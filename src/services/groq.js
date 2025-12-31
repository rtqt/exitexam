
// Split text into chunks of roughly 'maxLength' characters
const chunkText = (text, maxLength = 12000) => {
    const chunks = [];
    let currentChunk = "";

    // Split by newlines
    const lines = text.split('\n');

    for (const line of lines) {
        if ((currentChunk + line).length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = "";
        }
        currentChunk += line + "\n";
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk);
    }
    return chunks;
};

export const extractQuestionsGroq = async (apiKey, text) => {
    if (!apiKey || !text) throw new Error("API Key and content are required.");

    const cleanKey = apiKey.trim();
    const url = "https://api.groq.com/openai/v1/chat/completions";

    // 1. Chunk the text
    const chunks = chunkText(text, 15000); // 15k chars fits well within context but respects output limits
    let allQuestions = [];

    const createPrompt = (chunkText) => `
      You are an expert exam creator. Extract multiple-choice questions from the following text.
      
      CRITICAL:
      - Extract ALL questions in this text section.
      - Return result strictly as a raw JSON array. No markdown.
      
      Format:
      [
        {
          "theme": "Subject",
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "answer": 0 // index 0-3
        }
      ]
      
      Text:
      ${chunkText}
    `;

    try {
        // Loop through chunks
        for (const chunk of chunks) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that outputs only valid valid JSON array." },
                        { role: "user", content: createPrompt(chunk) }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("Groq Chunk Error:", errData);
                // If it's a rate limit (429), we might want to throw, but for now we'll log
                if (response.status === 429) throw new Error("Groq Rate Limit Exceeded. Try again later.");
                continue; // Try next chunk
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            try {
                const parsed = JSON.parse(content);
                let chunkQuestions = [];

                if (Array.isArray(parsed)) {
                    chunkQuestions = parsed;
                } else if (parsed.questions && Array.isArray(parsed.questions)) {
                    chunkQuestions = parsed.questions;
                } else {
                    // Deep search for array
                    const val = Object.values(parsed).find(v => Array.isArray(v));
                    if (val) chunkQuestions = val;
                }

                if (chunkQuestions.length > 0) {
                    allQuestions = [...allQuestions, ...chunkQuestions];
                }
            } catch (parseErr) {
                console.warn("JSON Parse Error on chunk:", parseErr);
            }
        }

        if (allQuestions.length === 0) {
            throw new Error("No questions extracted. Check text format or API availability.");
        }

        return allQuestions;

    } catch (error) {
        console.error("Groq Extraction Error:", error);
        throw new Error(`Groq Error: ${error.message}`);
    }
};

export const explainQuestionGroq = async (apiKey, question, options, correctAnswerIndex, model = "mixtral-8x7b-32768") => {
    if (!apiKey) throw new Error("API Key is required");

    const url = "https://api.groq.com/openai/v1/chat/completions";

    const prompt = `
    Question: ${question}
    Options:
    ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}
    
    Task:
    1. FIRST, analyze the question and options carefully.
    2. THINK step-by-step to derive the correct answer.
    3. STATE the correct answer clearly.
    4. Provide a detailed explanation of why that answer is correct.
    5. Briefly explain why each of the other options is incorrect.
    
    CRITICAL: You must be accurate. If the provided 'correct answer' (if any) seems wrong, explain why you think so, but prioritize logical correctness.
    
    Target audience: Computer Science students preparing for a comprehensive Exit Exam.
    Tone: Professional, educational, and encouraging.
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: "You are an expert Computer Science professor specialized in Exit Exams. You provide clear, in-depth, and accurate explanations." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Groq API Error");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Explanation Error", error);
        throw error;
    }
};

export const getGroqModels = async (apiKey) => {
    if (!apiKey) throw new Error("API Key is required");
    const url = "https://api.groq.com/openai/v1/models";
    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error("Failed to fetch models");
    const data = await response.json();
    return data.data || [];
};

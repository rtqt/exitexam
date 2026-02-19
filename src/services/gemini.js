
// Split text into chunks to respect token limits
const chunkText = (text, maxLength = 12000) => {
    const chunks = [];
    let currentChunk = "";
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

export const extractQuestionsFromText = async (apiKey, text, model = "gemini-2.5-flash") => {
    if (!apiKey || !text) throw new Error("API Key and content are required.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    let allQuestions = [];

    // Chunk the text
    const chunks = chunkText(text, 12000);

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
        for (const chunk of chunks) {
            const prompt = createPrompt(chunk);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error("Gemini Chunk Error:", err);
                throw new Error(err.error?.message || "Gemini API Error");
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) continue;

            try {
                // Remove markdown code blocks if present
                const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanContent);

                let chunkQuestions = [];
                if (Array.isArray(parsed)) {
                    chunkQuestions = parsed;
                } else if (parsed.questions && Array.isArray(parsed.questions)) {
                    chunkQuestions = parsed.questions;
                }

                if (chunkQuestions.length > 0) {
                    allQuestions = [...allQuestions, ...chunkQuestions];
                }
            } catch (parseErr) {
                console.warn("JSON Parse Error on Gemini chunk:", parseErr);
            }
        }

        if (allQuestions.length === 0) {
            throw new Error("No questions extracted. Check text format or API availability.");
        }

        return allQuestions;

    } catch (error) {
        console.error("Gemini Extraction Error", error);
        throw error;
    }
};

export const extractQuestionsFromMultimodal = async (apiKey, images, model = "gemini-2.5-flash") => {
    if (!apiKey || !images || images.length === 0) throw new Error("API Key and images are required.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    // Process images in batches to avoid payload limits if necessary, 
    // but for now we'll try sending them all (or limiting to a reasonable number like 5 pages per chunk if we had detailed logic, 
    // but simpler to just map them all).
    // Note: Gemini has limits on number of image parts. 
    // Let's assume the user uploads a reasonable PDF. unique images per request...
    // To be safe, let's process page by page or small groups.
    // Let's do page by page to ensure high quality extraction per page.

    let allQuestions = [];

    for (let i = 0; i < images.length; i++) {
        const base64Image = images[i];

        const prompt = `
        You are an expert exam creator. Extract multiple-choice questions from this exam page image.
        
        CRITICAL INSTRUCTIONS:
        - Extract ALL questions visible on this page.
        - If a question refers to a diagram or image in the document, you MUST describe the diagram in the 'imageDescription' field.
        - Return result strictly as a raw JSON array. No markdown.
        
        Format:
        [
            {
                "theme": "Subject",
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "answer": 0, // index 0-3
                "imageDescription": "Description of any diagram accompanying the question (optional)" 
            }
        ]
        `;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                console.error(`Gemini Image Page ${i + 1} Error:`, err);
                continue; // Skip failed pages but try others
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) continue;

            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanContent);

            let pageQuestions = [];
            if (Array.isArray(parsed)) {
                pageQuestions = parsed;
            } else if (parsed.questions && Array.isArray(parsed.questions)) {
                pageQuestions = parsed.questions;
            }

            if (pageQuestions.length > 0) {
                allQuestions = [...allQuestions, ...pageQuestions];
            }

        } catch (error) {
            console.warn(`Failed to parse page ${i + 1}:`, error);
        }
    }

    if (allQuestions.length === 0) {
        throw new Error("No questions extracted from images. Ensure images contains clear text/questions.");
    }

    return allQuestions;
};


export const explainQuestionGemini = async (apiKey, question, options, correctAnswerIndex, model = "gemini-2.5-flash") => {
    if (!apiKey) throw new Error("API Key is required");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    const prompt = `
    You are an expert Computer Science professor and tutor.
    
    Question: ${question}
    Options:
    ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}
    
    System's Claimed Correct Answer: ${String.fromCharCode(65 + correctAnswerIndex)} (${options[correctAnswerIndex]})
    
    TASK:
    1. Analyze the question and options yourself effectively "blinding" yourself to the system's claim initially.
    2. Determine the actual correct answer based on computer science principles.
    3. Compare your result with the "System's Claimed Correct Answer".
    
    CRITICAL RULE - NO HEDGING:
    - You are the Subject Matter Expert. The system's answer comes from a potentially flawed database.
    - If the system's claim contradicts standard definitions or is clearly inferior to another option, YOU MUST REJECT IT.
    - NEVER say "assuming the system is correct" or "the question might be interpreted broadly".
    - If the Answer is A, but System says B, your output MUST start with "Correction Needed".

    OUTPUT FORMAT (Strictly follow this):
    
    [If System is CORRECT]:
    "**Correct via System**"
    [Clear explanation of why it is right]
    
    [If System is INCORRECT]:
    "**Correction Needed**"
    "**System Claim:** ${String.fromCharCode(65 + correctAnswerIndex)}"
    "**Actual Correct Answer:** [The Option You Found]"
    
    "**Explanation:**"
    [Explain why your answer is the standard/correct one]
    [Explain strictly why the system's answer is NOT the best choice, without making excuses for it]
    
    Target audience: Exit exam students.
    Tone: Professional, educational, and definitive.
    `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Gemini API Error");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No explanation generated by Gemini.");
        }

        return text;
    } catch (error) {
        console.error("Gemini Explanation Error", error);
        throw error;
    }
};

export const getGeminiModels = async (apiKey) => {
    if (!apiKey) throw new Error("API Key is required");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch models");
    const data = await response.json();
    return data.models || [];
};

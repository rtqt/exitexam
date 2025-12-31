
export const parseQuestionsRegex = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const questions = [];
    let currentTheme = 'General';
    let currentQuestion = null;
    let lastField = null; // 'question' or 'option'

    // Regex patterns
    // Matches "Part I: Subject", "Part II. Subject", etc.
    const themeRegex = /^Part\s+[IVX]+[:.]?\s*(.+)/i;
    // Matches "1. Question text", "2) Question text"
    const questionRegex = /^\d+[:.)]\s*(.+)/;
    // Matches "A. Option", "a) Option"
    const optionRegex = /^([A-D])[:.)]\s*(.+)/i;

    for (const line of lines) {
        // 1. Check for Theme match
        const themeMatch = line.match(themeRegex);
        if (themeMatch) {
            currentTheme = themeMatch[1].trim();
            continue;
        }

        // 2. Check for Question match
        const questionMatch = line.match(questionRegex);
        if (questionMatch) {
            // Push previous question if complete
            if (currentQuestion) {
                // Ensure exactly 4 options by padding if needed
                while (currentQuestion.options.length < 4) currentQuestion.options.push("Option missing");
                questions.push(currentQuestion);
            }

            currentQuestion = {
                theme: currentTheme,
                question: questionMatch[1].trim(),
                options: [],
                answer: 0 // Default to 0 since we can't solve it
            };
            lastField = 'question';
            continue;
        }

        // 3. Check for Option match
        const optionMatch = line.match(optionRegex);
        if (currentQuestion && optionMatch) {
            currentQuestion.options.push(optionMatch[2].trim());
            lastField = 'option';
            continue;
        }

        // 4. Continuation lines (if line doesn't match patterns, append to last field)
        if (currentQuestion) {
            if (lastField === 'question') {
                currentQuestion.question += " " + line;
            } else if (lastField === 'option' && currentQuestion.options.length > 0) {
                currentQuestion.options[currentQuestion.options.length - 1] += " " + line;
            }
        }
    }

    // Push the very last question
    if (currentQuestion) {
        while (currentQuestion.options.length < 4) currentQuestion.options.push("Option missing");
        questions.push(currentQuestion);
    }

    return questions;
};

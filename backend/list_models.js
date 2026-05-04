require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't have a direct listModels, but we can try to use a default one.
        // Or check the model names.
        const models = ["gemini-pro", "gemini-1.5-flash-latest", "gemini-1.0-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hi");
                console.log(`Model ${m} WORKS:`, result.response.text().substring(0, 10));
            } catch (e) {
                console.log(`Model ${m} FAILED:`, e.message);
            }
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

listModels();

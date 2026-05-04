require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We can't easily list models with the SDK, but we can try common ones.
        const models = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
            "gemini-flash-latest",
            "gemini-pro"
        ];
        
        console.log("Checking models...");
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ ${modelName} is AVAILABLE`);
            } catch (err) {
                console.log(`❌ ${modelName} FAILED: ${err.message}`);
            }
        }
    } catch (err) {
        console.error("Top level error:", err.message);
    }
}

listModels();

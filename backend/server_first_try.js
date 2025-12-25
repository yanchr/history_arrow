import 'dotenv/config'
// 1. Correct package name
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. You MUST provide your API key here
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    try {
        // 3. Use getGenerativeModel and a valid model name (1.5-flash)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent("Explain how AI works in a few words");
        const response = result.response;
        console.log(response.text());
    } catch (error) {
        console.error("Error connecting to Gemini:", error);
    }
}

main();


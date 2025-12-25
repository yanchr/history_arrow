import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());          // This allows your Live Server to talk to this server
app.use(express.json());  // This allows the server to read JSON sent from the frontend

const ai = new GoogleGenAI({});

app.post('/ask', async (req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', '*'); 
    // res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
        const userPrompt = req.body.prompt;
        
        // 1. Set headers to keep the connection open for "Streaming"
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // 2. Use the streaming method

        const modelName = "gemini-2.5-flash"; // or "gemini-2.0-flash" 

        const result = await ai.models.generateContentStream({
            model: modelName,
            contents: userPrompt,
        });
        // 3. Iterate through the chunks as they arrive
        for await (const chunk of result.stream) {
            const chunkText = chunk.text;
            res.write(chunkText); // Send just this small piece to the browser
        }

        res.end(); // Close the connection when the AI is done
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

app.listen(3000, () => console.log("Backend running at http://localhost:3000"));
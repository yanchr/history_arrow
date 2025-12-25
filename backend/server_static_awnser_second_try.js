import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());          // This allows your Live Server to talk to this server
app.use(express.json());  // This allows the server to read JSON sent from the frontend

const ai = new GoogleGenAI({});

// This creates a "POST" endpoint at http://localhost:3000/ask
app.post('/ask', async (req, res) => {
    try {
        const userPrompt = req.body.prompt; // Get the text from the frontend
        
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: userPrompt,
        });

        res.json({ text: result.text }); // Send the AI's answer back to the browser
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(3000, () => console.log("Backend running at http://localhost:3000"));
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());          // This allows your Live Server to talk to this server
app.use(express.json());  // This allows the server to read JSON sent from the frontend

const ai = new GoogleGenAI({});


// This creates a "POST" endpoint at http://localhost:3000/ask

// Use it inside your app.post
app.post('/ask', async (req, res) => {
    const userPrompt =
                        `Write a short description of ${req.body.prompt}\n\n` +
                        "Rules:\n" +
                        "- The title is reused verbatim.\n" +
                        "- The subject must be something that can be assigned a year in the past.\n" +
                        "- Respond with exactly three lines, in this order:\n" +
                        "1) magnitude=<Years|Thousands|Millions|Billions>\n" +
                        "2) years_ago=<number>\n" +
                        "3) text=<description>\n\n" +
                        "Formatting rules:\n" +
                        "- Do not use JSON.\n" +
                        "- Do not add explanations.\n" +
                        "- Do not repeat the title.\n" +
                        "- years_ago must be a number (decimals allowed).\n" +
                        "- magnitude must match the scale of years_ago."
    try {
        const duplicateExists = await isTitleDuplicate(req.body.prompt)
        if(!duplicateExists) {
            // const userPrompt =  req.body.prompt; // Get the text from the frontend
            const result = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: userPrompt,
            });
    
            const modelUsed = req.body.model === "gemini-2.5-flash-lite" ? "flash_lite" : "flash";
            const counts = await logUsage(modelUsed);
    
            res.json(parseResponse(result.text, counts)); // Send the AI's answer back to the browser
        }
        return "Duplicate Exists"
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});


app.post('/ask-text', async (req, res) => {
    const string = "magnitude=Years\nyears_ago=255\ntext=Born in Ajaccio, Corsica, Napoleon Bonaparte entered the world on August 15, 1769, just a year after the island was ceded to France by Genoa.";
    const counts = await logUsage("flash_lite");
    // const counts = {"flash": "5", "flash_lite": "9"}
    res.json(parseResponse(string, counts));
});

app.post('/ask-text-2', (req, res) => {
    const string = "magnitude=Thousands\nyears_ago=2.5\ntext=The Great Pyramid of Giza, built around 2560 BC, stands as a testament to ancient Egyptian engineering and remains one of the Seven Wonders of the Ancient World.";
    res.json(parseResponse(string));
});

app.post('/ask-text-3', (req, res) => {
    const string = "magnitude=Millions\nyears_ago=200\ntext=Smth. That happened 200 Million Years ago";
    res.json(parseResponse(string));
});

function parseResponse(responseText, currentCount) {
    const lines = responseText.split("\n");
    let magnitude = null;
    let years_ago = null;   
    let text = null;

    for (const line of lines) {
        if (line.startsWith("magnitude=")) {
            magnitude = line.replace("magnitude=", "").trim();
        } else if (line.startsWith("years_ago=")) {
            years_ago = parseFloat(line.replace("years_ago=", "").trim());
        } else if (line.startsWith("text=")) {
            text = line.replace("text=", "").trim();
        }
    }

    return { magnitude, years_ago, text, currentCount };
}


// Add this simple counter function
async function logUsage(modelType) {
    const logPath = './data/usage_log.json';
    const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD

    let data = {};
    try {
        data = JSON.parse(await fs.readFile(logPath, 'utf-8'));
    } catch (e) { data = {}; }

    // Increment today's count
    if (!data[today]) {
        data[today] = { "flash": 0, "flash_lite": 0 };
    }

    data[today][modelType] = (data[today][modelType] || 0) + 1;

    await fs.writeFile(logPath, JSON.stringify(data, null, 2));
    return data[today];
}

/**
 * 1. Checks all JSON files in the folder for a matching title.
 * @returns {Promise<boolean>} - Returns true if a duplicate is found, false otherwise.
 */
async function isTitleDuplicate(title, folderPath = './data/json_infos') {
    try {
        const files = await fs.readdir(folderPath);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            const filePath = path.join(folderPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Ensure data is an array before calling .some
            if (Array.isArray(data)) {
                const duplicate = data.some(
                    event => event.title?.toLowerCase() === title.toLowerCase()
                );
                if (duplicate) return true;
            }
        }
        return false; // No duplicate found in any file
    } catch (error) {
        console.error("Error checking duplicates:", error);
        return false; 
    }
}

async function saveEventToFile(newEvent) {
    const folderPath = './data/json_infos';
    const targetFile = path.join(folderPath, 'gemini_requests.json');

    try {
        // Use the first function
        const duplicateExists = await isTitleDuplicate(newEvent.title, folderPath);

        if (duplicateExists) {
            return { success: false, message: "Duplicate title found in existing records." };
        }

        // Logic to append to the target file
        let targetData = [];
        try {
            const currentContent = await fs.readFile(targetFile, 'utf-8');
            targetData = JSON.parse(currentContent);
        } catch (e) {
            // If file doesn't exist, we keep targetData as []
        }

        targetData.push(newEvent);
        await fs.writeFile(targetFile, JSON.stringify(targetData, null, 4));
        
        return { success: true };

    } catch (error) {
        console.error("Save Error:", error);
        return { success: false, error: error.message };
    }
}

// 4. Create an Express Endpoint for this
app.post('/save-event', async (req, res) => {
    const result = await saveEventToFile(req.body);
    if (result.success) {
        res.json({ status: "saved" });
    } else {
        res.status(409).json({ status: "duplicate", message: result.message });
    }
});

app.listen(3000, () => console.log("Backend running at http://localhost:3000"));
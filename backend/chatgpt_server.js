import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();
const client = new OpenAI();

app.use(cors());
app.use(express.json());

app.get("/ask-stream", async (req, res) => {
    const title = req.query.prompt;
    if (!title) return res.status(400).end();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
        const stream = await client.responses.create({
            model: "gpt-5-nano",
            stream: true,
            input: [
                {
                    role: "system",
                    content:
                        "You receive a short title describing an event, person, invention, or time period.\n\n" +
                        "Rules:\n" +
                        "- The title is reused verbatim.\n" +
                        "- The subject must be something that can be assigned a year in the past.\n" +
                        "- Respond with exactly three lines, in this order:\n" +
                        "1) magnitude=<Years|Thousands|Millions|Billions>\n" +
                        "2) years_ago=<number>\n" +
                        "3) text=<short description>\n\n" +
                        "Formatting rules:\n" +
                        "- Do not use JSON.\n" +
                        "- Do not add explanations.\n" +
                        "- Do not repeat the title.\n" +
                        "- years_ago must be a number (decimals allowed).\n" +
                        "- magnitude must match the scale of years_ago."
                },
                {
                    role: "user",
                    content: title
                }
            ]
        });

        for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
                res.write(`data: ${event.delta}\n\n`);
            }

            if (event.type === "response.completed") {
                res.write("event: done\ndata: [DONE]\n\n");
                break;
            }
        }
    } catch (err) {
        console.error(err);
        res.write("event: error\ndata: failed\n\n");
    } finally {
        res.end();
    }
});


app.listen(3000, () => {
    console.log("SSE server running on http://localhost:3000");
});

import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing-key"
});

app.use(express.json({ limit: "1mb" }));

app.use("/api/", rateLimit({
  windowMs: 60000,
  limit: 15
}));

app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `
You are Mr Kali GPT 😈, a powerful AI assistant.
Answer questions, explain topics, write code, build websites,
help with programming, generate ideas and assist with research.
Be friendly, intelligent, direct and helpful.
Match the user's language.
Never pretend to perform actions you cannot perform.
`;

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    assistant: "Mr Kali GPT"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "OpenAI API key is missing."
      });
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const input = messages.slice(-40).map(m => {
      if (!["user", "assistant"].includes(m.role) ||
          typeof m.content !== "string") {
        throw new Error("Invalid message format.");
      }

      return {
        role: m.role,
        content: m.content.slice(0, 12000)
      };
    });

    const response = await ai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: SYSTEM_PROMPT,
      input
    });

    return res.json({
      reply: response.output_text || "Please try again.",
      assistant: "Mr Kali GPT"
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      error: error.message || "AI server error."
    });
  }
});

app.listen(PORT, () => {
  console.log("Mr Kali GPT running on port " + PORT);
});
  

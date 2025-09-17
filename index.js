import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route for handling therapy chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Check if message is unrelated to mental health
    if (!message.toLowerCase().includes("stress") &&
        !message.toLowerCase().includes("sad") &&
        !message.toLowerCase().includes("anxiety") &&
        !message.toLowerCase().includes("depress") &&
        !message.toLowerCase().includes("lonely")) {
      return res.json({ reply: "Well, I am a therapist and I have little to no knowledge about that matter." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // fast + affordable
      messages: [
        { role: "system", content: "You are a compassionate AI mental health therapist. Provide supportive, empathetic, and helpful responses." },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Sorry, I am having trouble responding right now." });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

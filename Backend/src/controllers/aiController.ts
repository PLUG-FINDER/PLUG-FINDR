import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
}

export const chatWithAI = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

    if (!apiKey) {
      res.status(500).json({ message: "AI service is not configured" });
      return;
    }

    const { messages } = req.body as ChatRequestBody;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: "messages array is required" });
      return;
    }

    // Simple length safeguard
    const trimmedMessages = messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 2000),
    }));

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "You are a helpful, general-purpose AI assistant. " +
        "Answer questions and help with tasks across any topic in a clear, friendly, and practical way. " +
        "You must never reveal API keys, secrets, or internal configuration.",
    };

    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages: [systemMessage, ...trimmedMessages],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const choice = groqResponse.data?.choices?.[0];
    const reply = choice?.message;

    if (!reply || !reply.content) {
      res.status(502).json({ message: "Invalid response from AI provider" });
      return;
    }

    res.json({
      message: reply,
    });
  } catch (error: any) {
    console.error("AI chat error:", error?.response?.data || error.message || error);

    if (error.code === "ECONNABORTED") {
      res.status(504).json({ message: "AI service timed out. Please try again." });
      return;
    }

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      res.status(502).json({ message: "AI service authentication failed" });
      return;
    }

    res
      .status(500)
      .json({ message: "Unable to process your request at the moment. Please try again." });
  }
};


import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import { PLATFORM_AI_SYSTEM_PROMPT, requiresDatabaseVerification } from "../utils/aiPrompt";
import {
  getTotalUserCount,
  getTotalVendorCount,
  getTotalProductCount,
  getTotalReviewCount,
  getTotalFeedbackCount,
  getTotalComplaintCount,
  getSystemStatistics,
  getVendorCountByStatus,
} from "../utils/aiDatabaseHelpers";

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

    // Check if the latest user message requires database verification
    const latestUserMessage = trimmedMessages
      .slice()
      .reverse()
      .find((m) => m.role === "user")?.content || "";

    let dataContext = "";
    if (requiresDatabaseVerification(latestUserMessage)) {
      try {
        const stats = await getSystemStatistics();
        const vendorStatus = await getVendorCountByStatus();

        dataContext = `\n\n[VERIFIED PLATFORM DATA AS OF NOW]\nApproved Vendors: ${stats.totalVendors}\nPending/Unapproved Vendors: ${vendorStatus.pending}\nFrozen Vendors: ${vendorStatus.frozen}\nTotal Products: ${stats.totalProducts}\nTotal Users: ${stats.totalUsers}\nTotal Reviews: ${stats.totalReviews}\nAverage Product Rating: ${stats.averageProductRating}/5\nTotal Feedback Entries: ${stats.totalFeedback}\nTotal Complaints: ${stats.totalComplaints}`;
      } catch (error) {
        console.warn("Failed to retrieve database statistics:", error);
      }
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content: PLATFORM_AI_SYSTEM_PROMPT + dataContext,
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


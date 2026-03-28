import apiClient from "./axios";

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatResponse {
  message: ChatMessage;
}

export const aiAPI = {
  sendChat: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatResponse>("/api/ai/chat", {
      messages,
    });
    return response.data.message;
  },
};


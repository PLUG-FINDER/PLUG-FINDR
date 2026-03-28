import React, { useEffect, useRef, useState } from 'react';
import { aiAPI, ChatMessage } from '../api/ai';
import { useAuth } from '../auth/AuthContext';
import './GlobalAIChat.css';

type ChatMode = 'button' | 'window';
type ChatWindowSize = 'compact' | 'expanded';

interface ConversationMessage extends ChatMessage {
  id: string;
  createdAt: number;
}

const GlobalAIChat: React.FC = () => {
  const { user } = useAuth();
  // System prompt for strict zero-knowledge, role-based, tool-only, deterministic AI
  const SYSTEM_PROMPT = `You are the official AI assistant for a multi-role platform that serves students, vendors, and admin, and your sole responsibility is to provide accurate, role-specific information strictly from the platform’s internal database and approved system tools. You must operate under a zero-knowledge policy, meaning you are strictly forbidden from using any external knowledge, assumptions, or general training data—every response must be based only on data retrieved through the provided tools such as database queries or internal APIs. For every user request related to platform data (including vendors, student records, feedback, orders, analytics, or system activity), you must first invoke the appropriate tool before generating a response. If no relevant data is returned, you must respond exactly with: “I’m sorry, I don’t have any information on that within our records.” Do not guess, infer, or fabricate any missing information. You must enforce strict role-based access control, ensuring that students, vendors, and admin can only access data they are authorized to view, and you must never expose restricted or sensitive information across roles. Maintain a professional, concise, and direct tone, and present retrieved data clearly, including all relevant fields where available. Do not mention tools, the database, or that you are an AI—respond as the official voice of the platform. The system must operate in a fully deterministic mode, equivalent to a temperature setting of 0.0, ensuring zero creativity, no variation in responses, and strict adherence to instructions.`;
  const [mode, setMode] = useState<ChatMode>('button');
  const [size, setSize] = useState<ChatWindowSize>('compact');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode === 'window') {
      setHasUnread(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'window' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, mode]);

  if (!user) {
    return null;
  }

  const handleToggleOpen = () => {
    setMode('window');
  };

  const handleCloseWindow = () => {
    setMode('button');
  };

  const handleToggleSize = () => {
    setSize((prev) => (prev === 'compact' ? 'expanded' : 'compact'));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = (editingMessageId ? editingContent : input).trim();
    if (!content || isSending) return;

    // Always inject the system prompt as the first message in the chat history
    const systemMessage: ChatMessage = {
      role: 'system',
      content: SYSTEM_PROMPT,
    };

    if (editingMessageId) {
      // Edit mode: update the message and re-send to AI
      setIsSending(true);
      setError(null);
      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessageId ? { ...msg, content } : msg
      );
      setMessages(updatedMessages);
      setEditingMessageId(null);
      setEditingContent('');

      try {
        const history: ChatMessage[] = [
          systemMessage,
          ...updatedMessages.map(({ role, content }) => ({ role, content })),
        ];
        const aiReply = await aiAPI.sendChat(history);
        const assistantMessage: ConversationMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: aiReply.content,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (mode === 'button') setHasUnread(true);
      } catch (err: any) {
        const friendly = err?.response?.data?.message || 'Something went wrong talking to the assistant. Please try again.';
        setError(friendly);
      } finally {
        setIsSending(false);
      }
      return;
    }

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const history: ChatMessage[] = [
        systemMessage,
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: 'user', content },
      ];

      const aiReply = await aiAPI.sendChat(history);

      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiReply.content,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (mode === 'button') {
        setHasUnread(true);
      }
    } catch (err: any) {
      const friendly =
        err?.response?.data?.message ||
        'Something went wrong talking to the assistant. Please try again.';
      setError(friendly);
    } finally {
      setIsSending(false);
    }
  };

  const placeholder =
    'Ask your question…';

  if (mode === 'button') {
    return (
      <button
        type="button"
        className="ai-assistant-floating-button"
        onClick={handleToggleOpen}
        aria-label="Open PlugFindr assistant"
      >
        <div className="ai-assistant-pulse" />
        <div className="ai-assistant-floating-button-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C7 2 3 5.5 3 10C3 11.8 3.6 13.4 4.7 14.7L3.5 20L9 18.8C9.9 19.1 10.9 19.3 12 19.3C17 19.3 21 15.8 21 11.3C21 6.8 17 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="11" r="0.9" fill="currentColor" />
            <circle cx="12" cy="11" r="0.9" fill="currentColor" />
            <circle cx="15" cy="11" r="0.9" fill="currentColor" />
          </svg>
          {hasUnread && <span className="ai-assistant-unread-dot" />}
        </div>
      </button>
    );
  }

  return (
    <div
      className={`ai-assistant-window ai-assistant-window-${size}`}
      aria-label="PlugFindr assistant chat"
    >
      <div className="ai-assistant-header">
        <div className="ai-assistant-header-left">
          <div className="ai-assistant-avatar">AI</div>
          <div>
            <div className="ai-assistant-title">PlugFindr Assistant</div>
            <div className="ai-assistant-subtitle">
              Here to help with your next step
            </div>
          </div>
        </div>
        <div className="ai-assistant-header-actions">
          <button
            type="button"
            className="ai-assistant-icon-button"
            onClick={handleToggleSize}
            aria-label={size === 'compact' ? 'Expand assistant' : 'Shrink assistant'}
          >
            {size === 'compact' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H5V9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5H19V9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 19H5V15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 19H19V15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7V7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5H17V7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 19H7V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 19H17V17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="ai-assistant-icon-button"
            onClick={handleCloseWindow}
            aria-label="Minimize assistant"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ai-assistant-body">
        <div className="ai-assistant-system-hint">
          Try asking things like:
          <br />
          “Show me how to find vendors near my hostel” or “Help me understand this dashboard”.
        </div>

        <div className="ai-assistant-messages">
          {messages.map((message) => {
            const isEditable =
              message.role === 'user' && Date.now() - message.createdAt < 15 * 60 * 1000;
            return (
              <div
                key={message.id}
                className={`ai-assistant-message-row ${message.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className={`ai-assistant-message-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>
                  {editingMessageId === message.id ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        autoFocus
                        maxLength={500}
                        placeholder="Edit your message..."
                        style={{ flex: 1, fontSize: '1rem', padding: '0.4rem 0.5rem', border: '1px solid #ccc', borderRadius: 4 }}
                      />
                      <button type="submit" style={{ marginLeft: 4, padding: '0.3rem 0.8rem', borderRadius: 4, border: '1px solid #ccc', background: '#f3f3f3', cursor: 'pointer' }}>Save</button>
                      <button type="button" style={{ marginLeft: 4, padding: '0.3rem 0.8rem', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }} onClick={() => { setEditingMessageId(null); setEditingContent(''); }}>Cancel</button>
                    </form>
                  ) : (
                    <span
                      {...(isEditable ? {
                        onContextMenu: (e: React.MouseEvent) => {
                          e.preventDefault();
                          setEditingMessageId(message.id);
                          setEditingContent(message.content);
                        },
                        onTouchStart: (_e: React.TouchEvent) => {
                          let timer: NodeJS.Timeout;
                          const touchEnd = () => {
                            clearTimeout(timer);
                            window.removeEventListener('touchend', touchEnd);
                            window.removeEventListener('touchmove', touchEnd);
                          };
                          timer = setTimeout(() => {
                            setEditingMessageId(message.id);
                            setEditingContent(message.content);
                          }, 600);
                          window.addEventListener('touchend', touchEnd);
                          window.addEventListener('touchmove', touchEnd);
                        }
                      } : {})}
                      style={{ width: '100%', display: 'inline-block' }}
                    >
                      {message.content}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="ai-assistant-message-row assistant">
              <div className="ai-assistant-message-bubble assistant">
                <span className="ai-assistant-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className="ai-assistant-footer" onSubmit={handleSubmit}>
        <div className="ai-assistant-input-row">
          <textarea
            className="ai-assistant-input"
            rows={1}
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="ai-assistant-send-button"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12L5.5 12.2L19 6L12.8 19.5L12.9 20L15 13L19 6L12 10L5 12Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="ai-assistant-status-row">
          <div>
            <span className="ai-assistant-status-dot" />
            Online assistant
          </div>
          {error && <div className="ai-assistant-error">{error}</div>}
        </div>
      </form>
    </div>
  );
};

export default GlobalAIChat;


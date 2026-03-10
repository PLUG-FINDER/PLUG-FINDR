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
  const [mode, setMode] = useState<ChatMode>('button');
  const [size, setSize] = useState<ChatWindowSize>('compact');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
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
    const content = input.trim();
    if (!content || isSending) return;

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
      const history: ChatMessage[] = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

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
    user.role === 'STUDENT'
      ? 'Ask about finding vendors, reviews, or using PlugFindr…'
      : user.role === 'VENDOR'
      ? 'Ask about managing your profile, products, or customer feedback…'
      : 'Ask about monitoring vendors, feedback, or admin tools…';

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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-assistant-message-row ${message.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div
                className={`ai-assistant-message-bubble ${
                  message.role === 'user' ? 'user' : 'assistant'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
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


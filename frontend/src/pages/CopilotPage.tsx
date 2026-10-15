import React, { useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { ChatMessage, ChatMessageItem } from '../components/copilot/ChatMessage';
import { PromptChips } from '../components/copilot/PromptChips';
import { mockCopilotSamplePrompts } from '../mocks/mockCopilot';
import { copilotService } from '../services/copilot.service';

export const CopilotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "Namaste! I am your **VyaparIQ Business Copilot**.\n\nI combine deterministic analytics on your reconciled transactions with grounded explanations. How can I help you understand your cashflow or audit anomalous expenditures today?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isSending) return;

    const userMessage: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setTimeout(scrollToBottom, 50);

    try {
      const response = await copilotService.sendMessage({ message: messageText });

      const assistantMessage: ChatMessageItem = {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: response.timestamp,
        copilotResponse: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Copilot encounter an issue: ${err.message || 'Unable to connect to AI engine'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#FFFFFF' }}>AI Business Copilot</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Grounded conversational financial intelligence for small business operations.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Box */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '16px',
        }}
      >
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} onSelectPrompt={(p) => handleSendMessage(p)} />
        ))}

        {isSending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                animation: 'pulse 1s infinite',
              }}
            />
            <span>Grounding metrics against ledger records...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <PromptChips
        prompts={mockCopilotSamplePrompts}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          display: 'flex',
          gap: '12px',
          position: 'relative',
        }}
      >
        <input
          type="text"
          placeholder="Ask Copilot about expenses, profit margins, anomalies, or cashflow..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 20px',
            color: '#FFFFFF',
            outline: 'none',
            fontSize: '0.94rem',
            boxShadow: 'var(--shadow-md)',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          style={{
            background: 'var(--primary-gradient)',
            color: '#FFFFFF',
            padding: '0 24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            opacity: !input.trim() || isSending ? 0.4 : 1,
            cursor: !input.trim() || isSending ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

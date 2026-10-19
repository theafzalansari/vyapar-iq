import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { LANDING_FAQ_ITEMS, matchFaqQuery } from '../../data/landingFaqData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  category?: string;
  suggestedQuestions?: string[];
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  'What is VyaparIQ?',
  'How does anomaly detection work?',
  'Does Business Copilot use Google Gemini?',
  'Does an anomaly prove fraud?',
  'How is company data protected?',
];

export const LandingFaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your local VyaparIQ FAQ Guide. Ask me anything about our CSV ledger reconciliation, anomaly detection rules, Google Gemini copilot, or platform security.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setShowAllTopics(false);

    // Run local keyword / fuzzy search
    const matchedFaq = matchFaqQuery(questionText);

    setTimeout(() => {
      if (matchedFaq) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchedFaq.answer,
          category: matchedFaq.category,
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Helpful fallback
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "I couldn't find a direct match in our local FAQ knowledge base for that query. Here are some verified platform topics you can explore:",
          suggestedQuestions: [
            'How does transaction ingestion work?',
            'What CSV data can users upload?',
            'Does an anomaly prove fraud?',
            'How does financial reconciliation work?',
          ],
          timestamp: 'Just now',
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion(inputQuery);
    }
  };

  return (
    <div className="landing-faq-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="landing-faq-floating-btn"
          aria-label="Open VyaparIQ FAQ Assistant"
          aria-expanded={isOpen}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'var(--surface-container-high)',
            color: 'var(--text-primary)',
            border: '1px solid var(--outline-variant)',
            borderRadius: '9999px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(99, 102, 241, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Bot size={16} />
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>VyaparIQ FAQ</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '9999px',
              backgroundColor: 'var(--primary-container)',
              color: 'var(--on-primary-container)',
            }}
          >
            20 Topics
          </span>
        </button>
      )}

      {/* Expanded FAQ Chat Panel */}
      {isOpen && (
        <div
          className="landing-faq-panel"
          role="dialog"
          aria-label="VyaparIQ FAQ Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--surface-container)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            zIndex: 95,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--surface-container-high)',
              borderBottom: '1px solid var(--outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
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
                  color: '#FFFFFF',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  VyaparIQ FAQ Guide
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tertiary)',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Local Knowledge Base • 20 Grounded Topics
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close FAQ Assistant"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container-highest)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Filter / Topic Bar */}
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--outline-variant)',
              backgroundColor: 'var(--surface-container-lowest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Predefined Offline Assistant</span>
            <button
              onClick={() => setShowAllTopics((prev) => !prev)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {showAllTopics ? 'Hide Topic List' : 'Browse All 20 Questions'}
            </button>
          </div>

          {/* All 20 Topics Modal / Drawer Overlay */}
          {showAllTopics && (
            <div
              style={{
                position: 'absolute',
                top: '90px',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'var(--surface-container)',
                zIndex: 20,
                overflowY: 'auto',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  All 20 Knowledge Base Topics:
                </span>
                <button
                  onClick={() => setShowAllTopics(false)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
              {LANDING_FAQ_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAskQuestion(item.question)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-container-high)',
                    border: '1px solid var(--outline-variant)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '2px' }}>
                    Topic {item.topicNumber} • {item.category}
                  </div>
                  <div>{item.question}</div>
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Initial suggestions if only welcome message exists */}
            {messages.length === 1 && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Frequently Asked Questions:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {INITIAL_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskQuestion(q)}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-container-high)',
                        border: '1px solid var(--outline-variant)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
                    >
                      <Sparkles size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '100%',
                  }}
                >
                  {isBot && msg.category && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        marginBottom: '4px',
                        paddingLeft: '4px',
                      }}
                    >
                      {msg.category}
                    </span>
                  )}

                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: isBot ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                      backgroundColor: isBot ? 'var(--surface-container-high)' : 'var(--primary)',
                      color: isBot ? 'var(--text-primary)' : 'var(--on-primary)',
                      border: isBot ? '1px solid var(--outline-variant)' : 'none',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Fallback Suggested Questions if present */}
                  {msg.suggestedQuestions && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px', width: '90%' }}>
                      {msg.suggestedQuestions.map((sq) => (
                        <button
                          key={sq}
                          onClick={() => handleAskQuestion(sq)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--surface-container-high)',
                            border: '1px solid var(--outline-variant)',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
                        >
                          👉 {sq}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      paddingLeft: isBot ? '4px' : '0',
                      paddingRight: isBot ? '0' : '4px',
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--surface-container-high)',
              borderTop: '1px solid var(--outline-variant)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question (e.g. anomaly detection)..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-container-lowest)',
                border: '1px solid var(--outline-variant)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleAskQuestion(inputQuery)}
              disabled={!inputQuery.trim()}
              aria-label="Send question"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: inputQuery.trim() ? 'var(--primary)' : 'var(--surface-container-highest)',
                color: inputQuery.trim() ? 'var(--on-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: inputQuery.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

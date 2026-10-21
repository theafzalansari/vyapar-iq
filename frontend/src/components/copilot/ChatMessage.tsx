import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { CopilotChatResponse } from '../../types/contracts.types';
import { GroundedMetricCard } from './GroundedMetricCard';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  copilotResponse?: CopilotChatResponse;
}

interface ChatMessageProps {
  message: ChatMessageItem;
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectPrompt }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        marginBottom: '20px',
        maxWidth: '850px',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isUser ? 'var(--bg-surface)' : 'var(--primary-gradient)',
          color: '#FFF',
          border: isUser ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        {isUser ? <UserIcon size={16} /> : <Bot size={18} />}
      </div>

      {/* Bubble Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            backgroundColor: isUser ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-card)',
            border: `1px solid ${isUser ? 'rgba(99, 102, 241, 0.35)' : 'var(--border-card)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            lineHeight: 1.6,
          }}
        >
          {/* Formatted Text rendering line breaks and bold */}
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>

          {/* Grounded Metrics Grid */}
          {message.copilotResponse?.groundedMetrics && message.copilotResponse.groundedMetrics.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Verified Financial Grounds
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {message.copilotResponse.groundedMetrics.map((gm, i) => (
                  <GroundedMetricCard key={i} data={gm} />
                ))}
              </div>
            </div>
          )}

          {/* AI Recommended Actions */}
          {message.copilotResponse?.recommendedActions && message.copilotResponse.recommendedActions.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                AI Recommendations (Action Required)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {message.copilotResponse.recommendedActions.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      color: '#E0E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>💡</span>
                    <span>{act.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Followups */}
          {message.copilotResponse?.suggestedFollowUps && message.copilotResponse.suggestedFollowUps.length > 0 && (
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Suggested follow-ups:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {message.copilotResponse.suggestedFollowUps.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectPrompt?.(prompt)}
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border-hover)',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '4px' }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

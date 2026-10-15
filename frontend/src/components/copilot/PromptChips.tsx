import React from 'react';
import { Sparkles } from 'lucide-react';

interface PromptChipsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export const PromptChips: React.FC<PromptChipsProps> = ({ prompts, onSelectPrompt }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '14px 0' }}>
      {prompts.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(p)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            padding: '6px 12px',
            borderRadius: '9999px',
            transition: 'all 0.15s ease-in-out',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-card)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
          }}
        >
          <Sparkles size={12} color="var(--primary)" />
          <span>{p}</span>
        </button>
      ))}
    </div>
  );
};

import React from 'react';
import { CategoryBreakdown } from '../../types/contracts.types';

interface ExpenseBreakdownProps {
  categories: CategoryBreakdown[];
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        No expense categories recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {categories.map((cat, idx) => (
        <div key={idx}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '0.84rem',
            }}
          >
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat.category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                ₹{cat.amount.toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ({cat.percentage}%)
              </span>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-container-highest)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${cat.percentage}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'var(--primary-gradient)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { MonthlyCashflowTrend } from '../../types/contracts.types';

interface CashflowChartProps {
  data: MonthlyCashflowTrend[];
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        No cashflow trend data recorded yet. Import your bank statement to view monthly trends.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses))) * 1.15;

  return (
    <div style={{ width: '100%' }}>
      {/* Chart Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10B981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Income</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#F43F5E' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Expenses</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#6366F1' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Net Profit</span>
        </div>
      </div>

      {/* Bar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          gap: '16px',
          height: '220px',
          alignItems: 'end',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
        }}
      >
        {data.map((item, idx) => {
          const incomeHeight = (item.income / maxVal) * 100;
          const expenseHeight = (item.expenses / maxVal) * 100;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '6px',
                  width: '100%',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                {/* Income Bar */}
                <div
                  title={`Income: ₹${item.income.toLocaleString()}`}
                  style={{
                    width: '38%',
                    maxWidth: '24px',
                    height: `${incomeHeight}%`,
                    backgroundColor: '#10B981',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease-out',
                  }}
                />
                {/* Expense Bar */}
                <div
                  title={`Expenses: ₹${item.expenses.toLocaleString()}`}
                  style={{
                    width: '38%',
                    maxWidth: '24px',
                    height: `${expenseHeight}%`,
                    backgroundColor: '#F43F5E',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease-out',
                  }}
                />
              </div>

              {/* Month Label */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {item.period.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

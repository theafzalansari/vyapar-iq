import React, { useState } from 'react';
import { MonthlyCashflowTrend } from '../../types/contracts.types';

interface CashflowChartProps {
  data: MonthlyCashflowTrend[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({
  data,
  title,
  subtitle,
  badge,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        No cashflow trend data recorded yet. Import your bank statement to view monthly trends.
      </div>
    );
  }

  // Calculate dynamic scale bounds
  const rawMax = Math.max(...data.map((d) => Math.max(d.income, d.expenses)));
  const maxVal = Math.ceil((rawMax * 1.15) / 50000) * 50000 || 200000;
  const gridTicks = [maxVal, Math.round(maxVal * 0.66), Math.round(maxVal * 0.33), 0];

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Optional Header Strip */}
      {(title || subtitle || badge) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--outline-variant)',
          }}
        >
          <div>
            {title && (
              <h4
                className="font-headline-md"
                style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}
              >
                {title}
              </h4>
            )}
            {subtitle && (
              <p
                className="font-label-ui"
                style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {badge && (
            <span
              className="font-label-data-sm"
              style={{
                fontSize: '0.6875rem',
                padding: '2px 8px',
                borderRadius: 'var(--rounded-full)',
                backgroundColor: 'var(--tertiary-container)',
                color: 'var(--tertiary)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Chart Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-label-ui" style={{ color: 'var(--outline)', fontSize: '0.6875rem' }}>
            Series:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--tertiary)',
                  boxShadow: '0 0 6px var(--tertiary-container)',
                }}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Gross Inflow</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--error)',
                  boxShadow: '0 0 6px var(--error-container)',
                }}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Disbursements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--primary)',
                }}
              />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Net Surplus</span>
            </div>
          </div>
        </div>

        {/* Hovered Month Detail Pill */}
        {hoveredIdx !== null && (
          <div
            className="font-label-data-sm"
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--rounded-xs)',
              backgroundColor: 'var(--surface-container-high)',
              border: '1px solid var(--outline-variant)',
              color: 'var(--text-primary)',
            }}
          >
            {data[hoveredIdx].period}: Net +₹{data[hoveredIdx].netCashflow.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {/* Main Chart Canvas with Axes & Grid */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          display: 'flex',
          gap: '12px',
        }}
      >
        {/* Y-Axis Value Labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '48px',
            paddingBottom: '24px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            userSelect: 'none',
          }}
        >
          {gridTicks.map((tick, i) => (
            <span key={i}>{formatCurrency(tick)}</span>
          ))}
        </div>

        {/* Chart Area with Horizontal Grid Lines */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Horizontal Background Grid Lines */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            {gridTicks.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '100%',
                  borderBottom: i === gridTicks.length - 1
                    ? '1px solid var(--outline-variant)'
                    : '1px dashed var(--outline-variant)',
                  opacity: i === gridTicks.length - 1 ? 1 : 0.6,
                }}
              />
            ))}
          </div>

          {/* Bar Columns Container */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'grid',
              gridTemplateColumns: `repeat(${data.length}, 1fr)`,
              gap: '8px',
              alignItems: 'end',
              paddingBottom: '24px',
              zIndex: 2,
            }}
          >
            {data.map((item, idx) => {
              const incomeHeight = Math.min(100, Math.max(4, (item.income / maxVal) * 100));
              const expenseHeight = Math.min(100, Math.max(4, (item.expenses / maxVal) * 100));
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {/* Floating Tooltip Bubble on Hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: `calc(${Math.max(incomeHeight, expenseHeight)}% + 12px)`,
                        backgroundColor: 'var(--surface-container-high)',
                        color: 'var(--text-primary)',
                        padding: '6px 10px',
                        borderRadius: 'var(--rounded-md)',
                        border: '1px solid var(--border-hover)',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.12s ease-out',
                      }}
                    >
                      <div style={{ color: 'var(--tertiary)', fontWeight: 600 }}>
                        In: ₹{item.income.toLocaleString('en-IN')}
                      </div>
                      <div style={{ color: 'var(--error)', fontWeight: 600 }}>
                        Out: ₹{item.expenses.toLocaleString('en-IN')}
                      </div>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, borderTop: '1px solid var(--outline-variant)', marginTop: '2px', paddingTop: '2px' }}>
                        Net: +₹{item.netCashflow.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {/* Dual Bar Group (Income & Expense) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '4px',
                      width: '100%',
                      maxWidth: '36px',
                      height: '100%',
                      justifyContent: 'center',
                      opacity: hoveredIdx !== null && !isHovered ? 0.45 : 1,
                      transition: 'opacity 0.15s ease',
                    }}
                  >
                    {/* Income Bar (Green) */}
                    <div
                      style={{
                        width: '50%',
                        height: `${incomeHeight}%`,
                        backgroundColor: 'var(--tertiary)',
                        borderRadius: 'var(--rounded-xs) var(--rounded-xs) 0 0',
                        boxShadow: isHovered ? '0 0 10px var(--tertiary-container)' : 'none',
                        transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
                      }}
                    />

                    {/* Expense Bar (Rose) */}
                    <div
                      style={{
                        width: '50%',
                        height: `${expenseHeight}%`,
                        backgroundColor: 'var(--error)',
                        borderRadius: 'var(--rounded-xs) var(--rounded-xs) 0 0',
                        boxShadow: isHovered ? '0 0 10px var(--error-container)' : 'none',
                        transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s',
                      }}
                    />
                  </div>

                  {/* Month Label (X-Axis) */}
                  <span
                    className="font-label-ui"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      fontSize: '0.6875rem',
                      fontWeight: isHovered ? 700 : 500,
                      color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.12s',
                    }}
                  >
                    {item.period.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowChart;

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { MetricCard } from '../../types/contracts.types';

interface KpiCardProps {
  data: MetricCard;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({ data, icon }) => {
  const isPositive = data.trend === 'up';
  const isNegative = data.trend === 'down';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {data.label}
        </span>
        {icon && (
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
        <h3
          className="font-display"
          style={{ fontSize: '1.75rem', color: '#FFFFFF', letterSpacing: '-0.03em' }}
        >
          {data.formatted}
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
        {data.changePercentage !== undefined && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 7px',
              borderRadius: '9999px',
              fontWeight: 600,
              backgroundColor: isPositive
                ? 'var(--success-bg)'
                : isNegative
                ? 'var(--danger-bg)'
                : 'rgba(255, 255, 255, 0.08)',
              color: isPositive
                ? 'var(--success)'
                : isNegative
                ? 'var(--danger)'
                : 'var(--text-muted)',
            }}
          >
            {isPositive ? <ArrowUpRight size={13} /> : isNegative ? <ArrowDownRight size={13} /> : <Minus size={13} />}
            {data.changePercentage > 0 ? `+${data.changePercentage}%` : `${data.changePercentage}%`}
          </span>
        )}
        {data.helperText && (
          <span style={{ color: 'var(--text-muted)' }}>{data.helperText}</span>
        )}
      </div>
    </div>
  );
};

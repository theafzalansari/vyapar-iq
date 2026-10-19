import React from 'react';
import { CheckCheck } from 'lucide-react';
import { GroundedMetric } from '../../types/contracts.types';

interface GroundedMetricCardProps {
  data: GroundedMetric;
}

export const GroundedMetricCard: React.FC<GroundedMetricCardProps> = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div>
        <div style={{ fontSize: '0.74rem', color: 'var(--tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
          {data.metric}
        </div>
        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
          {data.value}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {data.basis}
        </div>
      </div>
      <CheckCheck size={18} color="#10B981" style={{ flexShrink: 0 }} />
    </div>
  );
};

import React from 'react';
import { CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { AnomalyFinding } from '../../types/contracts.types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AnomalyCardProps {
  anomaly: AnomalyFinding;
  onResolve: (id: string) => void;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({ anomaly, onResolve }) => {
  const isResolved = anomaly.isResolved;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '22px',
        borderLeft: `4px solid ${
          anomaly.severity === 'critical'
            ? '#EF4444'
            : anomaly.severity === 'high'
            ? '#F59E0B'
            : anomaly.severity === 'medium'
            ? '#06B6D4'
            : '#94A3B8'
        }`,
        opacity: isResolved ? 0.6 : 1,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant={anomaly.severity}>{anomaly.severity}</Badge>
            <span
              style={{
                fontSize: '0.78rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 8px',
                borderRadius: '4px',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}
            >
              {anomaly.type}
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {new Date(anomaly.detectedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {anomaly.title}
          </h4>
        </div>

        {anomaly.affectedAmount && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disputed Impact</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F87171' }}>
              ₹{anomaly.affectedAmount.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
        {anomaly.description}
      </p>

      {/* Supporting Transaction Reference & Review Status */}
      {anomaly.transactionId && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Supporting Transaction:</span>
          <code style={{ color: 'var(--info)', fontWeight: 600 }}>{anomaly.transactionId}</code>
          <span style={{ color: 'var(--text-muted)' }}>• Review Status: {isResolved ? 'Cleared' : 'Under Investigation'}</span>
        </div>
      )}

      {/* Recommended Action Callout */}
      <div
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        <ShieldAlert size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A5B4FC', textTransform: 'uppercase' }}>
            Recommended Action (Grounded Anomaly Heuristic)
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginTop: '2px' }}>
            {anomaly.recommendedAction}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '14px',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Confidence Score:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {(anomaly.confidenceScore * 100).toFixed(0)}%
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            (Rule-based anomaly; not confirmed fraud)
          </span>
        </div>

        <div>
          {isResolved ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--success)',
                fontWeight: 600,
              }}
            >
              <CheckCircle size={16} /> Resolved
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onResolve(anomaly.id)}
            >
              Mark as Resolved
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

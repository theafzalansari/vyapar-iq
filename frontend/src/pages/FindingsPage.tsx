import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import { StateAlert } from '../components/common/StateAlert';
import { AnomalyCard } from '../components/findings/AnomalyCard';
import { anomaliesService } from '../services/anomalies.service';
import { AnomalyListResponse } from '../types/contracts.types';

export const FindingsPage: React.FC = () => {
  const [data, setData] = useState<AnomalyListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  const fetchAnomalies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await anomaliesService.getAnomalies();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial anomalies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await anomaliesService.resolveAnomaly(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          anomalies: prev.anomalies.map((a) => (a.id === id ? { ...a, isResolved: true } : a)),
        };
      });
    } catch (err: any) {
      alert('Failed to resolve anomaly: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
          <Skeleton height="80px" borderRadius="12px" />
        </div>
        <Skeleton height="180px" borderRadius="16px" className="mb-4" />
        <Skeleton height="180px" borderRadius="16px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <StateAlert
        type="error"
        title="Anomaly Engine Offline"
        message={error || 'Could not load anomaly findings.'}
        onRetry={fetchAnomalies}
      />
    );
  }

  const filteredAnomalies = data.anomalies.filter((a) => {
    if (filter === 'unresolved') return !a.isResolved;
    if (filter === 'resolved') return a.isResolved;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Anomaly Findings & Audits
          </h1>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#A5B4FC',
              fontWeight: 600,
            }}
          >
            Synthetic Dataset
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Hybrid deterministic heuristics flagging duplicate vendor payments, expense spikes, and irregular cash flow.
        </p>
      </div>

      {/* Advisory Notice */}
      <div
        style={{
          backgroundColor: 'var(--surface-container)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ color: '#F59E0B', fontSize: '1rem' }}>ℹ️</span>
        <span>
          <strong>Audit Review Notice:</strong> Flagged findings reflect statistical pattern anomalies and deterministic threshold triggers for accounting verification. Anomaly detection does NOT confirm or imply fraudulent intent.
        </span>
      </div>

      {/* Summary Stat Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Detected</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.summary.total}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #EF4444' }}>
          <span style={{ fontSize: '0.78rem', color: '#F87171' }}>Critical Flags</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#EF4444' }}>{data.summary.critical}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #F59E0B' }}>
          <span style={{ fontSize: '0.78rem', color: '#FBBF24' }}>High Priority</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F59E0B' }}>{data.summary.high}</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid #06B6D4' }}>
          <span style={{ fontSize: '0.78rem', color: '#38BDF8' }}>Medium Warnings</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#06B6D4' }}>{data.summary.medium}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'unresolved', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              color: filter === f ? '#FFFFFF' : 'var(--text-muted)',
              backgroundColor: filter === f ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-surface)',
              border: filter === f ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAnomalies.length > 0 ? (
          filteredAnomalies.map((anom) => (
            <AnomalyCard key={anom.id} anomaly={anom} onResolve={handleResolve} />
          ))
        ) : (
          <div
            className="glass-panel"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <CheckCircle size={44} color="#10B981" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>All Clear!</h4>
            <p style={{ fontSize: '0.85rem' }}>No anomalies match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

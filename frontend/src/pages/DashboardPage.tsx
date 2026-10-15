import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { StateAlert } from '../components/common/StateAlert';
import { CashflowChart } from '../components/dashboard/CashflowChart';
import { ExpenseBreakdown } from '../components/dashboard/ExpenseBreakdown';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RecentTransactionsWidget } from '../components/dashboard/RecentTransactionsWidget';
import { anomaliesService } from '../services/anomalies.service';
import { dashboardService } from '../services/dashboard.service';
import { AnomalyFinding, DashboardSummaryResponse } from '../types/contracts.types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyFinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summary, anomaliesRes] = await Promise.all([
        dashboardService.getDashboardSummary(),
        anomaliesService.getAnomalies().catch(() => ({ anomalies: [] })),
      ]);
      setData(summary);
      setAnomalies(anomaliesRes.anomalies);
    } catch (err: any) {
      setError(err.message || 'Unable to load financial dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          <Skeleton height="120px" borderRadius="16px" />
          <Skeleton height="120px" borderRadius="16px" />
          <Skeleton height="120px" borderRadius="16px" />
          <Skeleton height="120px" borderRadius="16px" />
        </div>
        <Skeleton height="320px" borderRadius="16px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <StateAlert
        type="error"
        title="Dashboard Error"
        message={error || 'Could not fetch dashboard summary.'}
        onRetry={fetchDashboard}
      />
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF' }}>
              Financial Overview
            </h1>
            <Badge variant="info">Synthetic Workspace</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-grounded performance metrics and automated bookkeeping for October 2026.
          </p>
        </div>

        {data.anomalyAlertsCount > 0 && (
          <Link
            to="/findings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <AlertTriangle size={16} color="#EF4444" />
            <span>{data.anomalyAlertsCount} Anomalies Flagged</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <KpiCard
          data={data.metrics.totalRevenue}
          icon={<DollarSign size={20} color="#10B981" />}
        />
        <KpiCard
          data={data.metrics.totalExpenses}
          icon={<TrendingDown size={20} color="#F43F5E" />}
        />
        <KpiCard
          data={data.metrics.netProfit}
          icon={<TrendingUp size={20} color="#6366F1" />}
        />
        <KpiCard
          data={data.metrics.burnRateOrSavings}
          icon={<Wallet size={20} color="#06B6D4" />}
        />
      </div>

      {/* Prioritized Findings Preview Section */}
      {anomalies.filter((a) => !a.isResolved).length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#EF4444" />
              <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Prioritized Findings & Anomalies</h3>
            </div>
            <Link
              to="/findings"
              style={{
                fontSize: '0.82rem',
                color: 'var(--primary)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View all findings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '16px',
            }}
          >
            {anomalies
              .filter((a) => !a.isResolved)
              .slice(0, 2)
              .map((finding) => (
                <div
                  key={finding.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    borderLeft: `4px solid ${
                      finding.severity === 'critical'
                        ? '#EF4444'
                        : finding.severity === 'high'
                        ? '#F59E0B'
                        : '#06B6D4'
                    }`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge variant={finding.severity}>{finding.severity}</Badge>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {finding.type}
                        </span>
                      </div>
                      {finding.affectedAmount && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F87171' }}>
                          ₹{finding.affectedAmount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '6px' }}>
                      {finding.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
                      {finding.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Confidence: <strong>{(finding.confidenceScore * 100).toFixed(0)}%</strong>
                    </span>
                    <Link
                      to="/findings"
                      style={{
                        color: 'var(--info)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Investigate <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Charts & Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <Card title="Cashflow Trends" subtitle="Monthly Income vs Expenses vs Net Margin (Last 6 Months)">
          <CashflowChart data={data.cashflowTrends} />
        </Card>

        <Card title="Top Expense Categories" subtitle="Highest cost drivers for October 2026">
          <ExpenseBreakdown categories={data.topExpenseCategories} />
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card title="Recent Transactions" subtitle="Latest reconciled income and expense entries">
        <RecentTransactionsWidget transactions={data.recentTransactions} />
      </Card>
    </div>
  );
};

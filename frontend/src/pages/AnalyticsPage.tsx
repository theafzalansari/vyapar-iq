import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { StateAlert } from '../components/common/StateAlert';
import { analyticsService } from '../services/analytics.service';
import {
  AnalyticsCategoriesResponse,
  AnalyticsSummaryResponse,
  AnalyticsTrendsResponse,
} from '../types/contracts.types';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrendsResponse | null>(null);
  const [categories, setCategories] = useState<AnalyticsCategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [groupBy, setGroupBy] = useState<'month' | 'day'>('month');
  const [categoryType, setCategoryType] = useState<'all' | 'expense' | 'income'>('expense');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, trendsRes, categoriesRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getTrends({ groupBy }),
        analyticsService.getCategories({ type: categoryType }),
      ]);
      setSummary(summaryRes);
      setTrends(trendsRes);
      setCategories(categoriesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [groupBy, categoryType]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Deterministic Financial Analytics
            </h1>
            <Badge variant="info">Milestone 3 Engine</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Auditable cashflow calculations, category spending shares, and chronological trend series.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              padding: '3px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setGroupBy('month')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: groupBy === 'month' ? 'var(--primary-light)' : 'transparent',
                color: groupBy === 'month' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setGroupBy('day')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: groupBy === 'day' ? 'var(--primary-light)' : 'transparent',
                color: groupBy === 'day' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Daily
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <StateAlert
          type="error"
          title="Analytics Fetch Error"
          message={error}
          onRetry={fetchAnalytics}
          actionText="Retry"
        />
      )}

      {isLoading && !summary ? (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <Skeleton height="110px" borderRadius="14px" />
            <Skeleton height="110px" borderRadius="14px" />
            <Skeleton height="110px" borderRadius="14px" />
            <Skeleton height="110px" borderRadius="14px" />
          </div>
          <Skeleton height="340px" borderRadius="16px" />
        </div>
      ) : summary ? (
        <>
          {/* KPI Quad Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Verified Inflow
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                ₹{summary.totalIncome.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} color="#10B981" /> {summary.incomeCount} revenue transactions
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Operational Outflows
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F43F5E', marginTop: '4px' }}>
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={14} color="#F43F5E" /> {summary.expenseCount} expense disbursements
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Net Ledger Surplus / Deficit
              </span>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: summary.netBalance >= 0 ? '#38BDF8' : '#F43F5E',
                  marginTop: '4px',
                }}
              >
                ₹{summary.netBalance.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: summary.netBalance >= 0 ? '#10B981' : '#F43F5E', marginTop: '4px', display: 'block' }}>
                {summary.totalIncome > 0
                  ? `${((summary.netBalance / summary.totalIncome) * 100).toFixed(1)}% operating margin`
                  : 'Zero baseline turnover'}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Ledger Volume
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {summary.transactionCount}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Basis: {summary.calculationBasis || 'reconciled_transactions'}
              </span>
            </div>
          </div>

          {/* Trends & Category Breakdown Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Category Share */}
            <Card
              title="Category Distribution"
              subtitle="Spending and revenue shares calculated deterministically"
              action={
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['expense', 'income', 'all'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setCategoryType(t)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        borderRadius: '4px',
                        backgroundColor: categoryType === t ? 'var(--primary-light)' : 'transparent',
                        color: categoryType === t ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              }
            >
              {!categories || categories.categories.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No transaction category data available.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  {categories.categories.map((cat) => (
                    <div key={cat.category}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.84rem',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.category}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ₹{cat.totalAmount.toLocaleString('en-IN')}{' '}
                          <strong style={{ color: 'var(--primary)' }}>({cat.percentage}%)</strong>
                        </span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(cat.percentage, 100)}%`,
                            height: '100%',
                            backgroundColor: cat.type === 'income' ? '#10B981' : 'var(--primary)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Chronological Trends */}
            <Card
              title={`Chronological Cashflow Trends (${groupBy === 'month' ? 'Monthly' : 'Daily'})`}
              subtitle="Verified period-by-period progression"
            >
              {!trends || trends.trends.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No trend data points recorded for this grouping.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>Period</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Inflow</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Outflow</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Net Cashflow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.trends.map((point, idx) => (
                        <tr
                          key={point.period}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {point.period}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#10B981' }}>
                            ₹{point.income.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#F43F5E' }}>
                            ₹{point.expenses.toLocaleString('en-IN')}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              textAlign: 'right',
                              fontWeight: 600,
                              color: point.netCashflow >= 0 ? '#38BDF8' : '#F43F5E',
                            }}
                          >
                            ₹{point.netCashflow.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

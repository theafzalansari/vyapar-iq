import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StateAlert } from '../components/common/StateAlert';
import { reportsService } from '../services/reports.service';
import { AuditReportData, TransactionDTO } from '../types/contracts.types';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<AuditReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedScope, setSelectedScope] = useState<'reconciliation' | 'anomalies' | 'gst'>('reconciliation');
  const [datePreset, setDatePreset] = useState<'all' | '30d' | '90d' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Download action states
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingLedger, setIsDownloadingLedger] = useState(false);
  const [isDownloadingFindings, setIsDownloadingFindings] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Compute effective date range
  const getDateRange = useCallback((): { startDate?: string; endDate?: string } => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (datePreset === '30d') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr };
    }
    if (datePreset === '90d') {
      const past = new Date();
      past.setDate(past.getDate() - 90);
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr };
    }
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate || undefined,
        endDate: customEndDate || undefined,
      };
    }
    return {};
  }, [datePreset, customStartDate, customEndDate]);

  // Load report data from backend
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = getDateRange();
      const data = await reportsService.getReportData({
        startDate,
        endDate,
        scope: selectedScope,
      });
      setReport(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate audit report';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, selectedScope]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Download triggers
  const handleExportPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const { startDate, endDate } = getDateRange();
      await reportsService.downloadPdfReport({
        startDate,
        endDate,
        scope: selectedScope,
      });
    } catch (err) {
      alert(`Error generating PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleExportTransactionsCSV = async () => {
    try {
      setIsDownloadingLedger(true);
      const { startDate, endDate } = getDateRange();
      await reportsService.downloadTransactionsCsv({ startDate, endDate });
    } catch (err) {
      alert(`Error exporting transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingLedger(false);
    }
  };

  const handleExportFindingsCSV = async () => {
    try {
      setIsDownloadingFindings(true);
      const { startDate, endDate } = getDateRange();
      await reportsService.downloadFindingsCsv({ startDate, endDate });
    } catch (err) {
      alert(`Error exporting findings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingFindings(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header & Export Actions */}
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
              Audit Reports & Compliance Export
            </h1>
            <Badge variant="info">
              {selectedScope === 'reconciliation'
                ? 'Reconciliation Pack'
                : selectedScope === 'anomalies'
                ? 'Dispute Evidence Pack'
                : 'GST Compliance Pack'}
            </Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Evidence-grounded audit reports, financial summaries, anomaly logs, and downloadable PDF/CSV workpapers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportTransactionsCSV}
            disabled={isDownloadingLedger}
          >
            {isDownloadingLedger ? (
              <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            Ledger CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportFindingsCSV}
            disabled={isDownloadingFindings}
          >
            {isDownloadingFindings ? (
              <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Download size={16} />
            )}
            Findings CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPdf}
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Printer size={16} />
            )}
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Date Filter & Scope Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Audit Scope:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedScope('reconciliation')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor:
                  selectedScope === 'reconciliation' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedScope === 'reconciliation' ? '#FFFFFF' : 'var(--text-secondary)',
                border:
                  selectedScope === 'reconciliation'
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              Reconciliation
            </button>
            <button
              onClick={() => setSelectedScope('anomalies')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor:
                  selectedScope === 'anomalies' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedScope === 'anomalies' ? '#FFFFFF' : 'var(--text-secondary)',
                border:
                  selectedScope === 'anomalies'
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              Dispute Evidence
            </button>
            <button
              onClick={() => setSelectedScope('gst')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor:
                  selectedScope === 'gst' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedScope === 'gst' ? '#FFFFFF' : 'var(--text-secondary)',
                border:
                  selectedScope === 'gst'
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              GST / Tax Prep
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--primary)" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            >
              <option value="all">All Ingested Records</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Current Quarter (90 Days)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {datePreset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                }}
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          )}

          <Button variant="secondary" size="sm" onClick={fetchReport} title="Refresh audit report">
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          </Button>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <StateAlert
          type="error"
          title="Audit Report Generation Failed"
          message={error}
          onRetry={fetchReport}
          actionText="Try Again"
        />
      )}

      {/* Loading state skeleton */}
      {loading && !report && (
        <div
          className="glass-panel"
          style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginBottom: '24px',
          }}
        >
          <Loader2 size={32} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Compiling Deterministic Audit Workpapers...
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Reconciling ledger transactions, verifying hash balances, and running anomaly rules.
          </p>
        </div>
      )}

      {/* Main Report Body */}
      {report && (
        <>
          {/* Business & Auditor Info Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
              borderLeft: '4px solid var(--primary)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '4px' }}>
                    {report.businessProfile.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span>
                      <strong>GSTIN:</strong> {report.businessProfile.gstin}
                    </span>
                    <span>
                      <strong>PAN:</strong> {report.businessProfile.pan}
                    </span>
                    <span>
                      <strong>Sector:</strong> {report.businessProfile.industry}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>
                  Report Ref: <strong style={{ color: 'var(--text-primary)' }}>{report.reportId}</strong>
                </div>
                <div>
                  Generated: {new Date(report.generatedAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
                <div>
                  Period: <span style={{ color: 'var(--text-secondary)' }}>{report.period.startDate} to {report.period.endDate}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'var(--text-secondary)' }}>Auditor Workpaper Status:</strong>{' '}
                {report.businessProfile.auditorNotes}
              </span>
            </div>
          </div>

          {/* Financial Metrics Quad */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Inflow (Revenue)
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                ₹{report.financialSummary.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <TrendingUp size={14} color="#10B981" /> Verified against {report.financialSummary.totalVolume} ledger transactions
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Outflow (Expenses)
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F43F5E', marginTop: '4px' }}>
                ₹{report.financialSummary.totalExpenses.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <TrendingDown size={14} color="#F43F5E" /> Operational & capital expenditures
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Net Operating Balance
              </span>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: report.financialSummary.netOperatingProfit >= 0 ? '#38BDF8' : '#F43F5E',
                  marginTop: '4px',
                }}
              >
                ₹{report.financialSummary.netOperatingProfit.toLocaleString('en-IN')}
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: report.financialSummary.profitMarginPct >= 0 ? '#10B981' : '#F43F5E',
                  marginTop: '6px',
                  display: 'block',
                }}
              >
                {report.financialSummary.profitMarginPct}% profit margin on turnover
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Anomaly Disputed Exposure
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>
                ₹{report.anomaliesAudit.totalDisputedAmount.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#F87171', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} />
                {report.anomaliesAudit.openCriticalCount} critical issues • {report.anomaliesAudit.totalIdentified} total findings
              </span>
            </div>
          </div>

          {/* Expense Breakdown & Cash Flow Trends Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            {/* Expense Categories */}
            <Card
              title="Expense Category Breakdown"
              subtitle="Audited operational outflows grouped by spending category"
            >
              {report.expenseCategories.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No expense records logged for the selected period.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
                  {report.expenseCategories.map((cat) => (
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
                            backgroundColor: 'var(--primary)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Cash Flow Trends */}
            <Card
              title="Monthly Cashflow Trends"
              subtitle="Historical revenue vs expense progression"
            >
              {report.cashflowTrends.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No cashflow trend points recorded for this period.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 10px' }}>Month</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Inflow</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Outflow</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Net Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.cashflowTrends.slice(-5).map((point, idx) => (
                        <tr
                          key={point.period}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {point.period}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10B981' }}>
                            ₹{point.income.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#F43F5E' }}>
                            ₹{point.expenses.toLocaleString('en-IN')}
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
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

          {/* Detected Anomalies & Evidence Workpapers */}
          <Card
            title="Detected Anomalies & Evidence Workpapers"
            subtitle="Heuristic audit findings with transparent confidence scores and affected amounts"
          >
            {report.findings.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  color: 'var(--success)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={32} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  No Anomalies Detected in Selected Period
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  All audited transactions adhere to deterministic volume, frequency, and pattern constraints.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Severity</th>
                      <th style={{ padding: '12px 14px' }}>Finding / Title</th>
                      <th style={{ padding: '12px 14px' }}>Triggered Rule</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Affected (INR)</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Risk Score</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.findings.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor:
                                item.severity === 'critical'
                                  ? 'rgba(239, 68, 68, 0.2)'
                                  : item.severity === 'high'
                                  ? 'rgba(249, 115, 22, 0.2)'
                                  : item.severity === 'medium'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(59, 130, 246, 0.2)',
                              color:
                                item.severity === 'critical'
                                  ? '#F87171'
                                  : item.severity === 'high'
                                  ? '#FB923C'
                                  : item.severity === 'medium'
                                  ? '#FCD34D'
                                  : '#60A5FA',
                            }}
                          >
                            {item.severity}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <code style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.rule || item.type}
                          </code>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₹{(item.affectedAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {item.riskScore ?? Math.round(item.confidenceScore * 100)}/100
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {item.isResolved ? (
                            <Badge variant="income">Resolved</Badge>
                          ) : (
                            <Badge variant="high">Open Review</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Advisory Follow-Up Actions (Distinguished from Verified Facts) */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <Card
              title="Advisory Follow-Up Recommendations"
              subtitle="Automated recommendations derived from pattern analytics — distinctly separate from verified ledger records"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {report.actionRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `4px solid ${
                        rec.priority === 'high' ? '#EF4444' : rec.priority === 'medium' ? '#F59E0B' : '#3B82F6'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {rec.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color:
                            rec.priority === 'high' ? '#F87171' : rec.priority === 'medium' ? '#FCD34D' : '#60A5FA',
                        }}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Category: <strong>{rec.category}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sample Reconciled Transactions Evidence Sheet */}
          <Card
            title="Reconciled Ledger Records & Evidence"
            subtitle={`Ingested transaction sample for reporting period ${report.period.startDate} to ${report.period.endDate}`}
          >
            {report.sampleTransactions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No transaction records available for this reporting period.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>TX ID</th>
                      <th style={{ padding: '12px 14px' }}>Date</th>
                      <th style={{ padding: '12px 14px' }}>Category</th>
                      <th style={{ padding: '12px 14px' }}>Description</th>
                      <th style={{ padding: '12px 14px' }}>Reference</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sampleTransactions.slice(0, 10).map((tx: TransactionDTO, idx: number) => (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {tx.id.slice(-8)}
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                          {new Date(tx.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)', maxWidth: '260px' }}>
                          {tx.description}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                          {tx.reference || '—'}
                        </td>
                        <td
                          style={{
                            padding: '12px 14px',
                            textAlign: 'right',
                            fontWeight: 600,
                            color: tx.type === 'income' ? '#10B981' : '#F43F5E',
                          }}
                        >
                          {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {tx.status === 'flagged' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#F87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              <Clock size={11} /> Flagged
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#34D399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <CheckCircle size={11} /> Reconciled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67E8F9' }}>
                <FileCheck size={16} />
                <span>
                  Deterministic Ingestion Ledger: {report.financialSummary.totalVolume} Transactions scanned,{' '}
                  {report.financialSummary.reconciledCount} Reconciled, {report.anomaliesAudit.totalIdentified} Flagged.
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>
                Showing sample {Math.min(report.sampleTransactions.length, 10)}
              </span>
            </div>
          </Card>

          {/* Explicit Legal & Audit Disclaimer */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <AlertCircle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FCA5A5', marginBottom: '4px' }}>
                LEGAL & AUDIT COMPLIANCE DISCLAIMER
              </div>
              <p style={{ fontSize: '0.8rem', color: '#FECDD3', lineHeight: 1.5, margin: 0 }}>
                {report.disclaimer}
              </p>
            </div>
          </div>
        </>
      )}

      {/* PDF Export Preview Modal */}
      {showPdfModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '640px',
              width: '100%',
              padding: '28px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <FileText size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  VyaparIQ Document Generation Engine
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Download high-resolution, vector PDF audit workpapers
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Included Workpapers in Download Package:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Executive Fiscal Summary & Cashflow Statement (P&L)</li>
                <li>Grounded Anomaly Audit Log with Confidence & Risk Scores</li>
                <li>Expense Category Breakdown & Trend Analysis</li>
                <li>Advisory Follow-Up Recommendations & Legal Disclaimers</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPdfModal(false);
                  handleExportPdf();
                }}
              >
                <Download size={16} /> Download PDF Pack
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

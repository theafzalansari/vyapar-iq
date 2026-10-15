import React, { useState } from 'react';
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
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { mockReportData } from '../mocks/mockReports';
import { mockTransactions } from '../mocks/mockTransactions';
import { TransactionDTO } from '../types/contracts.types';

export const ReportsPage: React.FC = () => {
  const [report] = useState(mockReportData);
  const [dateRange, setDateRange] = useState('2026-10-01 to 2026-10-15');
  const [selectedReportType, setSelectedReportType] = useState<'reconciliation' | 'anomalies' | 'gst'>('reconciliation');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // CSV Exporter for Transactions Ledger
  const handleExportTransactionsCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Amount', 'Category', 'Description', 'Reference'];
    const rows = mockTransactions.map((t: TransactionDTO) => [
      t.id,
      t.date.split('T')[0],
      t.type,
      t.amount.toString(),
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.reference || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: string[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VyaparIQ_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Exporter for Audit Summary
  const handleExportSummaryCSV = () => {
    const summaryRows = [
      ['VyaparIQ Financial Audit Summary Report'],
      ['Report ID', report.reportId],
      ['Generated At', report.generatedAt],
      ['Period', `${report.period.startDate} to ${report.period.endDate}`],
      ['Business Name', report.businessProfile.name],
      ['GSTIN', report.businessProfile.gstin],
      ['PAN', report.businessProfile.pan],
      ['Industry', report.businessProfile.industry],
      [''],
      ['Metric', 'Value (INR / Ratio)'],
      ['Total Inflow (Revenue)', report.financialSummary.totalRevenue.toString()],
      ['Total Outflow (Expenses)', report.financialSummary.totalExpenses.toString()],
      ['Net Operating Profit', report.financialSummary.netOperatingProfit.toString()],
      ['Operating Margin (%)', `${report.financialSummary.profitMarginPct}%`],
      ['Reconciled Volume', report.financialSummary.totalVolume.toString()],
      ['Total Flagged Anomalies', report.anomaliesAudit.totalIdentified.toString()],
      ['Disputed Anomaly Amount', report.anomaliesAudit.totalDisputedAmount.toString()],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + summaryRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VyaparIQ_Audit_Summary_${report.reportId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
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
            <h1 style={{ fontSize: '1.75rem', color: '#FFFFFF' }}>Audit & Fiscal Reports</h1>
            <Badge variant="info">Synthetic Audit Pack</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Automated reconciliation workpapers, GST compliance estimates, and dispute evidence logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={handleExportTransactionsCSV}>
            <FileSpreadsheet size={16} /> Export Ledger CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportSummaryCSV}>
            <Download size={16} /> Audit CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowPdfModal(true)}>
            <Printer size={16} /> PDF Report Pack
          </Button>
        </div>
      </div>

      {/* Date Filter & Report Category Strip */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Report Scope:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedReportType('reconciliation')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: selectedReportType === 'reconciliation' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedReportType === 'reconciliation' ? '#FFFFFF' : 'var(--text-secondary)',
                border: selectedReportType === 'reconciliation' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              Reconciliation
            </button>
            <button
              onClick={() => setSelectedReportType('anomalies')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: selectedReportType === 'anomalies' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedReportType === 'anomalies' ? '#FFFFFF' : 'var(--text-secondary)',
                border: selectedReportType === 'anomalies' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              Dispute Evidence
            </button>
            <button
              onClick={() => setSelectedReportType('gst')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: selectedReportType === 'gst' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: selectedReportType === 'gst' ? '#FFFFFF' : 'var(--text-secondary)',
                border: selectedReportType === 'gst' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              GST / Tax Prep
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} color="var(--primary)" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
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
            <option value="2026-10-01 to 2026-10-15">Current Cycle (Oct 1 - Oct 15, 2026)</option>
            <option value="2026-09-01 to 2026-09-30">Previous Month (Sep 2026)</option>
            <option value="2026-07-01 to 2026-09-30">Q2 FY 2026-27</option>
          </select>
        </div>
      </div>

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
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
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
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '4px' }}>
                {report.businessProfile.name}
              </h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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

          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              Report Ref: <strong style={{ color: 'var(--text-primary)' }}>{report.reportId}</strong>
            </div>
            <div>
              Generated: {new Date(report.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong style={{ color: 'var(--text-secondary)' }}>Auditor Notes:</strong> {report.businessProfile.auditorNotes}
          </span>
        </div>
      </div>

      {/* Financial Metrics Quad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Inflow Volume
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
            ₹{report.financialSummary.totalRevenue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified against sales invoices</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Outflow Volume
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F43F5E', marginTop: '4px' }}>
            ₹{report.financialSummary.totalExpenses.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational & raw material</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Net Operating Surplus
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6366F1', marginTop: '4px' }}>
            ₹{report.financialSummary.netOperatingProfit.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>{report.financialSummary.profitMarginPct}% profit margin</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Dispute Exposure
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>
            ₹{report.anomaliesAudit.totalDisputedAmount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#F87171' }}>
            {report.anomaliesAudit.openCriticalCount} open critical review items
          </span>
        </div>
      </div>

      {/* Main Evidence Sheet Canvas */}
      <Card
        title="Reconciliation & Transaction Evidence"
        subtitle={`Showing verified transactions for period ${dateRange}`}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
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
              {mockTransactions.slice(0, 8).map((tx: TransactionDTO, idx: number) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {tx.id}
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', maxWidth: '280px' }}>
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
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {tx.id === 'tx_106' ? (
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
            <span>Deterministic Ingestion Ledger: 11 Transactions scanned, 10 Reconciled, 1 Flagged for review.</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>Showing sample 8</span>
        </div>
      </Card>

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
                <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>PDF Report Generation Preview</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  VyaparIQ Document Generation Engine
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.82rem', color: '#FDE68A', lineHeight: 1.5 }}>
                <strong>Documented Integration Task:</strong> Client-side preview is ready. The production PDF export endpoint (`POST /api/reports/generate-pdf` via Puppeteer/PDFKit) is queued for backend AI engine integration.
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
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                Included Workpapers in Package:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Executive Fiscal Summary & Cashflow Statement (P&L)</li>
                <li>Grounded Anomaly Audit Log with Confidence Weights</li>
                <li>Bank vs Ledger Transaction Hash Verification Record</li>
                <li>Input Tax Credit (ITC) Estimate Schedule for GSTR-3B</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print / Save as PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

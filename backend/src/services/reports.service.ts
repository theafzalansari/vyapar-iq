import PDFDocument from 'pdfkit';
import { FilterQuery } from 'mongoose';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { normalizeDateBoundaries } from '../schemas/analytics.schema';
import { ReportQueryInput } from '../schemas/reports.schema';
import { analyticsService, roundCurrency } from './analytics.service';
import { anomalyDetectionService } from './anomalyDetection.service';
import {
  ActionRecommendation,
  AnomalyFinding,
  AuditReportActionItem,
  AuditReportAnomaliesAudit,
  AuditReportBusinessProfile,
  AuditReportData,
  AuditReportFinancialSummary,
  TransactionDTO,
} from '../types/contracts.types';

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export const reportsService = {
  /**
   * Compiles the full deterministic audit report data model for the authenticated user.
   */
  async generateAuditReportData(
    userId: string,
    query: ReportQueryInput = {}
  ): Promise<AuditReportData> {
    const { startDate, endDate } = normalizeDateBoundaries(query.startDate, query.endDate);

    // 1. Fetch deterministic financial summary
    const summary = await analyticsService.getSummary(userId, {
      startDate: query.startDate,
      endDate: query.endDate,
    });

    // 2. Fetch expense category breakdown
    const categoriesRes = await analyticsService.getCategories(userId, {
      startDate: query.startDate,
      endDate: query.endDate,
      type: 'expense',
    });

    // 3. Fetch cashflow trends (grouped by month)
    const trendsRes = await analyticsService.getTrends(userId, {
      startDate: query.startDate,
      endDate: query.endDate,
      groupBy: 'month',
    });

    // 4. Retrieve or scan anomaly findings
    const anomalyResult = await anomalyDetectionService.detectAnomalies(userId);
    let findings = anomalyResult.anomalies;

    // Filter findings if period is specified
    if (startDate || endDate) {
      findings = findings.filter((f) => {
        const detectedTime = new Date(f.detectedAt).getTime();
        if (startDate && detectedTime < startDate.getTime()) return false;
        if (endDate && detectedTime > endDate.getTime()) return false;
        return true;
      });
    }

    // 5. Query sample transactions for the audit workpaper table
    const matchFilter: FilterQuery<ITransactionDocument> = { userId };
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = startDate;
      if (endDate) matchFilter.date.$lte = endDate;
    }

    const txDocs = await Transaction.find(matchFilter)
      .sort({ date: -1 })
      .limit(25)
      .lean();

    const sampleTransactions: TransactionDTO[] = txDocs.map((tx: any) => ({
      id: tx._id.toString(),
      userId: tx.userId,
      batchId: tx.batchId ? tx.batchId.toString() : null,
      date: tx.date instanceof Date ? tx.date.toISOString() : new Date(tx.date).toISOString(),
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      paymentMethod: tx.paymentMethod || 'other',
      status: tx.status || 'completed',
      reference: tx.reference || null,
      counterparty: tx.counterparty || null,
      notes: tx.notes,
      metadata: tx.metadata,
      createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : new Date().toISOString(),
    }));

    // 6. Build Financial Summary metrics
    const totalRevenue = summary.totalIncome;
    const totalExpenses = summary.totalExpenses;
    const netOperatingProfit = summary.netBalance;
    const profitMarginPct =
      totalRevenue > 0
        ? Math.round(((netOperatingProfit / totalRevenue) * 100 + Number.EPSILON) * 10) / 10
        : 0;

    const reconciledCount = sampleTransactions.filter(
      (t) => t.status === 'reconciled' || t.status === 'completed'
    ).length;
    const unreconciledCount = sampleTransactions.filter(
      (t) => t.status === 'flagged' || t.status === 'pending'
    ).length;

    const financialSummary: AuditReportFinancialSummary = {
      totalRevenue,
      totalExpenses,
      netOperatingProfit,
      profitMarginPct,
      reconciledCount,
      unreconciledCount,
      totalVolume: summary.transactionCount,
      currency: summary.currency || 'INR',
    };

    // 7. Build Anomalies Audit Summary
    const totalDisputedAmount = roundCurrency(
      findings.reduce((acc, f) => acc + (f.affectedAmount || 0), 0)
    );
    const resolvedCount = findings.filter((f) => f.isResolved).length;
    const openCriticalCount = findings.filter(
      (f) => f.severity === 'critical' && !f.isResolved
    ).length;

    const anomaliesAudit: AuditReportAnomaliesAudit = {
      totalIdentified: findings.length,
      resolvedCount,
      openCriticalCount,
      totalDisputedAmount,
    };

    // 8. Business Profile
    const businessProfile: AuditReportBusinessProfile = {
      name: query.businessName || 'VyaparIQ Enterprise Merchant',
      gstin: query.gstin || '27AAECV1234F1Z5',
      pan: query.pan || 'AAECV1234F',
      industry: query.industry || 'B2B Wholesale & Supply Chain',
      auditorNotes:
        findings.length === 0
          ? 'Full reconciliation passed with zero anomalies flagged across the selected period.'
          : `${findings.length} anomaly findings flagged for review. ${openCriticalCount} critical issues require immediate management sign-off.`,
    };

    // 9. Generate Action Recommendations (distinguished from verified facts)
    const actionRecommendations: AuditReportActionItem[] = [];

    if (openCriticalCount > 0) {
      actionRecommendations.push({
        id: 'rec_critical_review',
        title: 'Review Critical Anomalies',
        priority: 'high',
        category: 'Compliance & Audit',
        description: `Conduct secondary verification for ${openCriticalCount} critical anomalies flagged for potential duplicate disbursements or major variances.`,
      });
    }

    if (netOperatingProfit < 0) {
      actionRecommendations.push({
        id: 'rec_negative_cashflow',
        title: 'Cash Flow Deficit Mitigation',
        priority: 'high',
        category: 'Cash Flow',
        description: `Operating expenses exceed income by ₹${Math.abs(netOperatingProfit).toLocaleString('en-IN')}. Rationalize top operational expenditure categories.`,
      });
    }

    if (categoriesRes.categories.length > 0) {
      const topExpense = categoriesRes.categories[0];
      if (topExpense.percentage > 35) {
        actionRecommendations.push({
          id: 'rec_expense_concentration',
          title: `Category Spend Concentration (${topExpense.category})`,
          priority: 'medium',
          category: 'Cost Optimization',
          description: `${topExpense.category} accounts for ${topExpense.percentage}% of total outflows (₹${topExpense.totalAmount.toLocaleString('en-IN')}). Investigate supplier terms and bulk rate negotiations.`,
        });
      }
    }

    if (unreconciledCount > 0) {
      actionRecommendations.push({
        id: 'rec_ledger_reconciliation',
        title: 'Ledger Hash Matching & Counterparty Verification',
        priority: 'medium',
        category: 'Bookkeeping',
        description: `${unreconciledCount} sample transactions have unconfirmed references or pending status. Match bank statements to finalize period close.`,
      });
    }

    if (actionRecommendations.length === 0) {
      actionRecommendations.push({
        id: 'rec_routine_maintenance',
        title: 'Routine Tax Pack Archival',
        priority: 'low',
        category: 'Archival',
        description: 'Ledger reconciled cleanly. Export workpapers and maintain backup records for quarterly GSTR-3B filings.',
      });
    }

    const reportId = `REP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const reportDateStr = new Date().toISOString();
    const periodStartStr = query.startDate || (txDocs.length > 0 ? txDocs[txDocs.length - 1].date.toISOString().split('T')[0] : 'Beginning');
    const periodEndStr = query.endDate || (txDocs.length > 0 ? txDocs[0].date.toISOString().split('T')[0] : 'Current');

    const disclaimer =
      'DISCLAIMER: This automated audit report and detected anomalies indicate potential patterns and variance requiring human review; they do not constitute legal proof of fraud or tax non-compliance. All financial totals reflect ingested ledger records.';

    return {
      reportId,
      generatedAt: reportDateStr,
      period: {
        startDate: periodStartStr,
        endDate: periodEndStr,
      },
      scope: query.scope || 'reconciliation',
      businessProfile,
      financialSummary,
      anomaliesAudit,
      expenseCategories: categoriesRes.categories,
      cashflowTrends: trendsRes.trends,
      findings,
      sampleTransactions,
      actionRecommendations,
      disclaimer,
    };
  },

  /**
   * Generates a downloadable PDF report buffer with professional typography,
   * tables, headers, and dynamic page numbers.
   */
  async generateAuditReportPdf(reportData: AuditReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: 'A4',
          bufferPages: true,
          info: {
            Title: `VyaparIQ Audit Report - ${reportData.reportId}`,
            Author: 'VyaparIQ Financial Intelligence System',
            Subject: 'Financial Audit & Anomaly Review Workpaper',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const pageWidth = 595.28;
        const margin = 40;
        const printableWidth = pageWidth - margin * 2;

        // ---------------------------------------------------------------------
        // Header Banner
        // ---------------------------------------------------------------------
        doc.rect(margin, margin, printableWidth, 68).fill('#0F172A');

        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold');
        doc.text('VyaparIQ Fiscal & Audit Workpaper', margin + 16, margin + 14);

        doc.fontSize(8.5).font('Helvetica').fillColor('#94A3B8');
        doc.text(
          `Automated Ledger Audit • Scope: ${reportData.scope.toUpperCase()} • Generated: ${new Date(
            reportData.generatedAt
          ).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}`,
          margin + 16,
          margin + 42
        );

        doc.fillColor('#38BDF8').fontSize(9).font('Helvetica-Bold');
        doc.text(`REF: ${reportData.reportId}`, printableWidth - 50, margin + 16, {
          align: 'right',
        });

        doc.y = margin + 82;

        // ---------------------------------------------------------------------
        // Business Profile Block
        // ---------------------------------------------------------------------
        doc.rect(margin, doc.y, printableWidth, 54).fill('#F8FAFC').stroke('#E2E8F0');
        const profileY = doc.y + 10;

        doc.fillColor('#1E293B').fontSize(11).font('Helvetica-Bold');
        doc.text(reportData.businessProfile.name, margin + 14, profileY);

        doc.fontSize(8.5).font('Helvetica').fillColor('#64748B');
        doc.text(
          `GSTIN: ${reportData.businessProfile.gstin}   |   PAN: ${reportData.businessProfile.pan}   |   Industry: ${reportData.businessProfile.industry}`,
          margin + 14,
          profileY + 16
        );

        doc.text(
          `Reporting Period: ${reportData.period.startDate} to ${reportData.period.endDate}`,
          margin + 14,
          profileY + 30
        );

        doc.y = profileY + 54;

        // ---------------------------------------------------------------------
        // Financial Metrics Summary Cards
        // ---------------------------------------------------------------------
        const cardGap = 10;
        const cardWidth = (printableWidth - cardGap * 3) / 4;
        const cardHeight = 56;
        const metricsY = doc.y;

        const metrics = [
          {
            label: 'TOTAL REVENUE',
            val: `INR ${reportData.financialSummary.totalRevenue.toLocaleString('en-IN')}`,
            color: '#059669',
            sub: `${reportData.financialSummary.totalVolume} Transactions`,
          },
          {
            label: 'TOTAL EXPENSES',
            val: `INR ${reportData.financialSummary.totalExpenses.toLocaleString('en-IN')}`,
            color: '#DC2626',
            sub: 'Operational Outflows',
          },
          {
            label: 'NET OPERATING PROFIT',
            val: `INR ${reportData.financialSummary.netOperatingProfit.toLocaleString('en-IN')}`,
            color: reportData.financialSummary.netOperatingProfit >= 0 ? '#2563EB' : '#DC2626',
            sub: `${reportData.financialSummary.profitMarginPct}% Margin`,
          },
          {
            label: 'DISPUTE EXPOSURE',
            val: `INR ${reportData.anomaliesAudit.totalDisputedAmount.toLocaleString('en-IN')}`,
            color: reportData.anomaliesAudit.openCriticalCount > 0 ? '#D97706' : '#64748B',
            sub: `${reportData.anomaliesAudit.totalIdentified} Anomalies Flagged`,
          },
        ];

        metrics.forEach((m, idx) => {
          const cardX = margin + idx * (cardWidth + cardGap);
          doc.rect(cardX, metricsY, cardWidth, cardHeight).fill('#F1F5F9').stroke('#CBD5E1');

          doc.fillColor('#64748B').fontSize(6.8).font('Helvetica-Bold');
          doc.text(m.label, cardX + 8, metricsY + 8, { width: cardWidth - 16 });

          doc.fillColor(m.color).fontSize(10).font('Helvetica-Bold');
          doc.text(m.val, cardX + 8, metricsY + 22, { width: cardWidth - 16 });

          doc.fillColor('#94A3B8').fontSize(6.5).font('Helvetica');
          doc.text(m.sub, cardX + 8, metricsY + 40, { width: cardWidth - 16 });
        });

        doc.y = metricsY + cardHeight + 16;

        // ---------------------------------------------------------------------
        // Section: Top Expense Categories Table
        // ---------------------------------------------------------------------
        doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold');
        doc.text('1. Expense Category Breakdown', margin, doc.y);
        doc.y += 6;

        // Table Header
        const tableY = doc.y;
        doc.rect(margin, tableY, printableWidth, 18).fill('#E2E8F0');
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica-Bold');
        doc.text('CATEGORY', margin + 8, tableY + 5);
        doc.text('TX COUNT', margin + 180, tableY + 5);
        doc.text('TOTAL AMOUNT (INR)', margin + 280, tableY + 5);
        doc.text('SHARE OF EXPENSES', margin + 410, tableY + 5);

        let rowY = tableY + 18;
        doc.font('Helvetica').fontSize(7.5);

        if (reportData.expenseCategories.length === 0) {
          doc.rect(margin, rowY, printableWidth, 18).fill('#FFFFFF').stroke('#F1F5F9');
          doc.fillColor('#64748B').text('No expense records logged for this period.', margin + 8, rowY + 5);
          rowY += 18;
        } else {
          reportData.expenseCategories.slice(0, 5).forEach((cat, idx) => {
            const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
            doc.rect(margin, rowY, printableWidth, 16).fill(bg).stroke('#F1F5F9');
            doc.fillColor('#1E293B').text(cat.category, margin + 8, rowY + 4);
            doc.fillColor('#475569').text(String(cat.transactionCount), margin + 180, rowY + 4);
            doc.fillColor('#1E293B').text(cat.totalAmount.toLocaleString('en-IN'), margin + 280, rowY + 4);
            doc.fillColor('#2563EB').text(`${cat.percentage}%`, margin + 410, rowY + 4);
            rowY += 16;
          });
        }

        doc.y = rowY + 14;

        // ---------------------------------------------------------------------
        // Section: Detected Anomalies & Evidence Table
        // ---------------------------------------------------------------------
        doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold');
        doc.text('2. Anomaly Findings & Grounded Evidence', margin, doc.y);
        doc.y += 6;

        const anomTableY = doc.y;
        doc.rect(margin, anomTableY, printableWidth, 18).fill('#E2E8F0');
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica-Bold');
        doc.text('SEVERITY', margin + 8, anomTableY + 5);
        doc.text('FINDING & RULE', margin + 70, anomTableY + 5);
        doc.text('AFFECTED (INR)', margin + 260, anomTableY + 5);
        doc.text('RISK', margin + 350, anomTableY + 5);
        doc.text('STATUS', margin + 420, anomTableY + 5);

        let anomRowY = anomTableY + 18;
        doc.font('Helvetica').fontSize(7.5);

        if (reportData.findings.length === 0) {
          doc.rect(margin, anomRowY, printableWidth, 20).fill('#FFFFFF').stroke('#F1F5F9');
          doc.fillColor('#059669').text('No anomalies detected in the selected period. Ledger verified.', margin + 8, anomRowY + 6);
          anomRowY += 20;
        } else {
          reportData.findings.slice(0, 6).forEach((item, idx) => {
            const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
            doc.rect(margin, anomRowY, printableWidth, 24).fill(bg).stroke('#F1F5F9');

            // Severity color pill
            const sevColor =
              item.severity === 'critical'
                ? '#DC2626'
                : item.severity === 'high'
                ? '#EA580C'
                : item.severity === 'medium'
                ? '#D97706'
                : '#2563EB';

            doc.fillColor(sevColor).font('Helvetica-Bold').text(item.severity.toUpperCase(), margin + 8, anomRowY + 4);

            doc.fillColor('#1E293B').font('Helvetica').text(item.title, margin + 70, anomRowY + 4, {
              width: 180,
              ellipsis: true,
            });
            doc.fillColor('#64748B').fontSize(6.5).text(`Rule: ${item.rule || item.type}`, margin + 70, anomRowY + 14);
            doc.fontSize(7.5);

            doc.fillColor('#1E293B').text((item.affectedAmount || 0).toLocaleString('en-IN'), margin + 260, anomRowY + 4);
            doc.fillColor('#475569').text(`${item.riskScore ?? Math.round(item.confidenceScore * 100)}/100`, margin + 350, anomRowY + 4);
            doc.fillColor(item.isResolved ? '#059669' : '#DC2626').text(item.isResolved ? 'RESOLVED' : 'OPEN REVIEW', margin + 420, anomRowY + 4);

            anomRowY += 24;
          });
        }

        doc.y = anomRowY + 14;

        // Check if page overflow requires a new page
        if (doc.y > 660) {
          doc.addPage();
          doc.y = margin;
        }

        // ---------------------------------------------------------------------
        // Section: Recommended Follow-Up Actions (Distinguished from Verified Facts)
        // ---------------------------------------------------------------------
        doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold');
        doc.text('3. Advisory Follow-Up Recommendations (Automated Heuristics)', margin, doc.y);
        doc.y += 4;
        doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
        doc.text('Note: Recommendations are derived from pattern analytics and do not constitute verified accounting findings.', margin, doc.y);
        doc.y += 8;

        reportData.actionRecommendations.slice(0, 3).forEach((rec) => {
          const recY = doc.y;
          doc.rect(margin, recY, printableWidth, 34).fill('#F8FAFC').stroke('#E2E8F0');

          doc.fillColor('#2563EB').fontSize(8).font('Helvetica-Bold');
          doc.text(`[${rec.priority.toUpperCase()}] ${rec.title}`, margin + 10, recY + 6);

          doc.fillColor('#475569').fontSize(7.5).font('Helvetica');
          doc.text(rec.description, margin + 10, recY + 18, { width: printableWidth - 20 });

          doc.y = recY + 38;
        });

        // ---------------------------------------------------------------------
        // Statutory Disclaimer
        // ---------------------------------------------------------------------
        doc.y += 6;
        if (doc.y > 700) {
          doc.addPage();
          doc.y = margin;
        }

        const discY = doc.y;
        doc.rect(margin, discY, printableWidth, 36).fill('#FEF2F2').stroke('#FCA5A5');
        doc.fillColor('#991B1B').fontSize(7).font('Helvetica-Bold');
        doc.text('LEGAL & AUDIT COMPLIANCE DISCLAIMER', margin + 10, discY + 6);
        doc.fillColor('#7F1D1D').fontSize(6.5).font('Helvetica');
        doc.text(reportData.disclaimer, margin + 10, discY + 16, { width: printableWidth - 20 });

        // ---------------------------------------------------------------------
        // Dynamic Page Numbering in Footers across all buffered pages
        // ---------------------------------------------------------------------
        const pages = doc.bufferedPageRange();
        for (let i = pages.start; i < pages.start + pages.count; i++) {
          doc.switchToPage(i);
          doc.fillColor('#94A3B8').fontSize(7).font('Helvetica');
          doc.text(
            `VyaparIQ Financial Intelligence Platform • Confidential Audit Workpaper • Page ${i + 1} of ${pages.count}`,
            margin,
            800,
            { align: 'center', width: printableWidth }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Generates a sanitized CSV string of transactions for the authenticated user and period.
   */
  async generateTransactionsCsv(
    userId: string,
    query: ReportQueryInput = {}
  ): Promise<string> {
    const { startDate, endDate } = normalizeDateBoundaries(query.startDate, query.endDate);

    const matchFilter: FilterQuery<ITransactionDocument> = { userId };
    if (startDate || endDate) {
      matchFilter.date = {};
      if (startDate) matchFilter.date.$gte = startDate;
      if (endDate) matchFilter.date.$lte = endDate;
    }

    const txDocs = await Transaction.find(matchFilter).sort({ date: -1 }).lean();

    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Amount',
      'Currency',
      'Category',
      'Description',
      'Reference',
      'Counterparty',
      'Payment Method',
      'Audit Status',
      'Batch ID',
    ];

    const rows = txDocs.map((tx: any) => [
      escapeCsvCell(tx._id.toString()),
      escapeCsvCell(tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''),
      escapeCsvCell(tx.type),
      escapeCsvCell(tx.amount),
      escapeCsvCell('INR'),
      escapeCsvCell(tx.category),
      escapeCsvCell(tx.description),
      escapeCsvCell(tx.reference || ''),
      escapeCsvCell(tx.counterparty || ''),
      escapeCsvCell(tx.paymentMethod || 'other'),
      escapeCsvCell(tx.status || 'completed'),
      escapeCsvCell(tx.batchId ? tx.batchId.toString() : ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },

  /**
   * Generates a sanitized CSV string of audit anomaly findings for the authenticated user and period.
   */
  async generateFindingsCsv(
    userId: string,
    query: ReportQueryInput = {}
  ): Promise<string> {
    const reportData = await this.generateAuditReportData(userId, query);

    const headers = [
      'Finding ID',
      'Type',
      'Severity',
      'Rule Triggered',
      'Title',
      'Description',
      'Affected Amount (INR)',
      'Confidence Score',
      'Risk Score',
      'Audit Status',
      'Detected Date',
      'Recommended Action',
    ];

    const rows = reportData.findings.map((f) => [
      escapeCsvCell(f.id),
      escapeCsvCell(f.type),
      escapeCsvCell(f.severity),
      escapeCsvCell(f.rule || f.type),
      escapeCsvCell(f.title),
      escapeCsvCell(f.description),
      escapeCsvCell(f.affectedAmount ?? 0),
      escapeCsvCell(f.confidenceScore),
      escapeCsvCell(f.riskScore ?? Math.round(f.confidenceScore * 100)),
      escapeCsvCell(f.isResolved ? 'Resolved' : 'Open Review'),
      escapeCsvCell(f.detectedAt ? f.detectedAt.split('T')[0] : ''),
      escapeCsvCell(f.recommendedAction),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },
};

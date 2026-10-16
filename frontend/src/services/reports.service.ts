import { env } from '../config/env';
import { mockReportData } from '../mocks/mockReports';
import { AuditReportData } from '../types/contracts.types';
import { apiClient } from './api.client';

export interface ReportQueryParams {
  startDate?: string;
  endDate?: string;
  scope?: 'reconciliation' | 'anomalies' | 'gst';
  businessName?: string;
  gstin?: string;
  pan?: string;
  industry?: string;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
}

export const reportsService = {
  /**
   * Fetches the compiled audit report data preview for the selected period and scope.
   */
  async getReportData(params: ReportQueryParams = {}): Promise<AuditReportData> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 200));
      return mockReportData;
    }

    return apiClient<AuditReportData>('/reports', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        scope: params.scope,
        businessName: params.businessName,
        gstin: params.gstin,
        pan: params.pan,
        industry: params.industry,
      },
    });
  },

  /**
   * Triggers generation and real download of the server-rendered PDF audit report pack.
   */
  async downloadPdfReport(params: ReportQueryParams = {}): Promise<void> {
    if (env.useMockData) {
      window.print();
      return;
    }

    const blob = await apiClient<Blob>('/reports/pdf', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        scope: params.scope,
        businessName: params.businessName,
      },
    });

    const filename = `VyaparIQ_Audit_Report_${params.scope || 'reconciliation'}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    triggerDownload(blob, filename);
  },

  /**
   * Triggers download of ledger transactions as CSV.
   */
  async downloadTransactionsCsv(params: ReportQueryParams = {}): Promise<void> {
    const csvData = await apiClient<string>('/reports/transactions/csv', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const filename = `VyaparIQ_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(blob, filename);
  },

  /**
   * Triggers download of audit findings and evidence logs as CSV.
   */
  async downloadFindingsCsv(params: ReportQueryParams = {}): Promise<void> {
    const csvData = await apiClient<string>('/reports/findings/csv', {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const filename = `VyaparIQ_Audit_Findings_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(blob, filename);
  },
};

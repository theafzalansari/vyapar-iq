import { env } from '../config/env';
import { mockTransactions } from '../mocks/mockTransactions';
import { PaginationMeta, PaginationParams } from '../types/api.types';
import { CsvImportResponse, TransactionDTO } from '../types/contracts.types';
import { apiClient } from './api.client';

export interface GetTransactionsFilter extends PaginationParams {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionsService = {
  /**
   * Fetch paginated and filtered transactions
   */
  async getTransactions(filters: GetTransactionsFilter = {}): Promise<{
    transactions: TransactionDTO[];
    pagination: PaginationMeta;
  }> {
    if (env.useMockData) {
      // Simulate network latency for realistic loading states
      await new Promise((r) => setTimeout(r, 250));

      let filtered = [...mockTransactions];

      if (filters.type) {
        filtered = filtered.filter((t) => t.type === filters.type);
      }
      if (filters.category) {
        filtered = filtered.filter((t) => t.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.description.toLowerCase().includes(s) ||
            t.category.toLowerCase().includes(s) ||
            (t.reference && t.reference.toLowerCase().includes(s))
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        transactions: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }

    return apiClient<{ transactions: TransactionDTO[]; pagination: PaginationMeta }>('/transactions', {
      method: 'GET',
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Upload CSV file for transaction ingestion
   */
  async uploadCsv(file: File, allowDuplicate = false): Promise<CsvImportResponse> {
    if (env.useMockData) {
      await new Promise((r) => setTimeout(r, 600));

      const mockResponse: CsvImportResponse = {
        batchId: `batch_mock_${Date.now()}`,
        fileName: file.name,
        totalRows: 12,
        importedRows: 12,
        rejectedRows: 0,
        status: 'completed',
        errors: [],
        sampleTransactions: mockTransactions.slice(0, 3),
        importedAt: new Date().toISOString(),
      };
      return mockResponse;
    }

    const formData = new FormData();
    formData.append('file', file);

    return apiClient<CsvImportResponse>('/transactions/import', {
      method: 'POST',
      body: formData,
      params: { allowDuplicate },
    });
  },

  /**
   * Download the sample CSV template
   */
  async downloadTemplate(): Promise<string> {
    if (env.useMockData) {
      return [
        'date,type,amount,category,description,reference',
        '2026-10-01,income,15000.00,Sales,Product counter cash sales,INV-2026-001',
        '2026-10-02,expense,3500.50,Inventory,Wholesale supplies restocking,PO-2026-042',
        '2026-10-05,expense,12000.00,Rent,Shop monthly rent payment,RENT-OCT-26',
        '2026-10-08,income,8250.00,Services,Customer consulting and setup fee,SRV-2026-118',
        '2026-10-10,expense,1450.00,Utilities,Commercial electricity bill,EB-99214',
      ].join('\r\n');
    }

    return apiClient<string>('/transactions/template', {
      method: 'GET',
    });
  },
};

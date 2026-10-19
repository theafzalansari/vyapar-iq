import React, { useEffect, useState } from 'react';
import { StateAlert } from '../components/common/StateAlert';
import { CsvUploadModal } from '../components/transactions/CsvUploadModal';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { transactionsService } from '../services/transactions.service';
import { PaginationMeta } from '../types/api.types';
import { TransactionDTO } from '../types/contracts.types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await transactionsService.getTransactions({
        page: currentPage,
        limit: 10,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: search.trim() || undefined,
      });
      setTransactions(res.transactions);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, typeFilter, search]);

  const handleDownloadTemplate = async () => {
    try {
      const csvText = await transactionsService.downloadTemplate();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vyapariq_transactions_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download CSV template: ' + err.message);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Transaction Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Import CSV statements, filter categorized bookkeeping entries, and manage business records.
        </p>
      </div>

      {error && (
        <StateAlert
          type="error"
          title="Error Loading Transactions"
          message={error}
          onRetry={fetchTransactions}
        />
      )}

      {/* Filter & Action Controls */}
      <TransactionFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={(val) => {
          setTypeFilter(val);
          setCurrentPage(1);
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
      />

      {/* Table & Pagination */}
      <TransactionTable
        transactions={transactions}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Upload CSV Modal */}
      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchTransactions();
        }}
      />
    </div>
  );
};

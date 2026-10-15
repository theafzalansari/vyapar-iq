import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { PaginationMeta } from '../../types/api.types';
import { TransactionDTO } from '../../types/contracts.types';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';

interface TransactionTableProps {
  transactions: TransactionDTO[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  pagination,
  isLoading,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <Skeleton height="36px" borderRadius="8px" className="mb-4" />
        <Skeleton height="50px" borderRadius="8px" className="mb-2" />
        <Skeleton height="50px" borderRadius="8px" className="mb-2" />
        <Skeleton height="50px" borderRadius="8px" className="mb-2" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Inbox size={42} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>No transactions found</h4>
        <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters or import a CSV file.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description & Reference</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              });

              return (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{dateStr}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.description}</div>
                    {tx.reference && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        Ref: {tx.reference}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        padding: '3px 8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>
                    {tx.paymentMethod.replace('_', ' ')}
                  </td>
                  <td>
                    <Badge variant={isIncome ? 'income' : 'expense'}>{tx.type}</Badge>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        color:
                          tx.status === 'completed'
                            ? 'var(--success)'
                            : tx.status === 'flagged'
                            ? '#F87171'
                            : 'var(--text-muted)',
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '0.94rem',
                      color: isIncome ? 'var(--success)' : '#FFFFFF',
                    }}
                  >
                    {isIncome ? `+₹${tx.amount.toLocaleString()}` : `-₹${tx.amount.toLocaleString()}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '6px',
                color: pagination.hasPrevPage ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: pagination.hasPrevPage ? 1 : 0.4,
              }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '6px',
                color: pagination.hasNextPage ? 'var(--text-primary)' : 'var(--text-muted)',
                opacity: pagination.hasNextPage ? 1 : 0.4,
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

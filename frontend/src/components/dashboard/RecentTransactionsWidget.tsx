import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { TransactionDTO } from '../../types/contracts.types';
import { Badge } from '../common/Badge';

interface RecentTransactionsWidgetProps {
  transactions: TransactionDTO[];
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({ transactions }) => {
  return (
    <div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              });

              return (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{dateStr}</td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.description}</div>
                    {tx.reference && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Ref: {tx.reference}
                      </div>
                    )}
                  </td>
                  <td>{tx.category}</td>
                  <td>
                    <Badge variant={isIncome ? 'income' : 'expense'}>{tx.type}</Badge>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontWeight: 600,
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

      <div style={{ marginTop: '14px', textAlign: 'right' }}>
        <Link
          to="/transactions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          View all transactions <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import { Download, Search, Upload } from 'lucide-react';
import { Button } from '../common/Button';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: 'all' | 'income' | 'expense';
  onTypeFilterChange: (type: 'all' | 'income' | 'expense') => void;
  onOpenUpload: () => void;
  onDownloadTemplate: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onOpenUpload,
  onDownloadTemplate,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px',
      }}
    >
      {/* Search Input and Type Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: '240px',
            maxWidth: '360px',
            width: '100%',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search description, reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px 8px 36px',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Type Toggle Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTypeFilterChange(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                color: typeFilter === t ? 'var(--on-primary)' : 'var(--text-muted)',
                backgroundColor: typeFilter === t ? 'var(--primary)' : 'transparent',
                boxShadow: typeFilter === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadTemplate}
          icon={<Download size={15} />}
        >
          Template
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenUpload}
          icon={<Upload size={15} />}
        >
          Import CSV
        </Button>
      </div>
    </div>
  );
};

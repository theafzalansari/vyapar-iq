import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { transactionsService } from '../../services/transactions.service';
import { CsvImportResponse } from '../../types/contracts.types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<CsvImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Only .csv files are supported.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const res = await transactionsService.uploadCsv(selectedFile, allowDuplicate);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'DUPLICATE_UPLOAD') {
        setError('Duplicate File: This identical CSV has already been imported. Check "Force re-upload" below to override.');
      } else {
        setError(err.message || 'Failed to upload and ingest CSV.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import CSV Transactions" maxWidth="600px">
      {!result ? (
        <div>
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              marginBottom: '18px',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <UploadCloud size={24} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selectedFile ? selectedFile.name : 'Click to select CSV file'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Required columns: date, type, amount, category, description, reference
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                color: '#FCA5A5',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Duplicate override option */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="allowDuplicate"
              checked={allowDuplicate}
              onChange={(e) => setAllowDuplicate(e.target.checked)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="allowDuplicate" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Force re-upload if file content matches a previous batch (override idempotency)
            </label>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              icon={<FileSpreadsheet size={16} />}
            >
              Upload & Process
            </Button>
          </div>
        </div>
      ) : (
        /* Result state */
        <div>
          <div
            style={{
              textAlign: 'center',
              padding: '16px 0 24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <CheckCircle size={28} />
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Ingestion Completed</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Batch: {result.fileName} ({result.batchId})
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Rows</span>
              <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{result.totalRows}</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Imported</span>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)' }}>
                {result.importedRows}
              </p>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Rejected</span>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--danger)' }}>
                {result.rejectedRows}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ fontSize: '0.85rem', color: '#F87171', marginBottom: '8px' }}>
                Row Validation Errors ({result.errors.length}):
              </h5>
              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {result.errors.map((err, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    Row {err.row} ({err.field}): {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={handleReset}>
              Upload Another
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

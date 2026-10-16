import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import { IImportBatchDocument, ImportBatch } from '../models/ImportBatch';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { csvRowSchema } from '../schemas/transaction.schema';
import { CsvImportResponse, CsvRowError, TransactionDTO } from '../types/contracts.types';
import { anomalyDetectionService } from './anomalyDetection.service';

export class DuplicateUploadError extends Error {
  public code = 'DUPLICATE_UPLOAD';
  public details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown>) {
    super(message);
    this.name = 'DuplicateUploadError';
    this.details = details;
  }
}

export class CsvParsingError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code = 'CSV_PARSING_ERROR', details?: unknown) {
    super(message);
    this.name = 'CsvParsingError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Maps a Mongoose Transaction document into a public TransactionDTO
 */
export const mapTransactionToDTO = (doc: ITransactionDocument): TransactionDTO => {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    batchId: doc.batchId ? doc.batchId.toString() : null,
    date: doc.date instanceof Date ? doc.date.toISOString() : new Date(doc.date).toISOString(),
    description: doc.description,
    amount: doc.amount,
    type: doc.type,
    category: doc.category,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    reference: doc.reference || null,
    counterparty: doc.counterparty || null,
    notes: doc.notes || undefined,
    metadata: doc.metadata || undefined,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export interface ProcessCsvOptions {
  file: Express.Multer.File;
  userId: string;
  allowDuplicate?: boolean;
}

const REQUIRED_CSV_COLUMNS = ['date', 'type', 'amount', 'category', 'description'];
const MAX_ALLOWED_ROWS = 5000;

export const processCsvImport = async (options: ProcessCsvOptions): Promise<CsvImportResponse> => {
  const { file, userId, allowDuplicate = false } = options;

  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new CsvParsingError('Uploaded CSV file is empty.', 'EMPTY_FILE');
  }

  // 1. Calculate SHA-256 hash of file content for idempotency and duplicate detection
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  // 2. Check for duplicate upload if not explicitly allowed
  if (!allowDuplicate) {
    const existingBatch = await ImportBatch.findOne({
      userId,
      fileHash,
      status: { $in: ['completed', 'partial'] },
    }).sort({ createdAt: -1 });

    if (existingBatch) {
      throw new DuplicateUploadError(
        'This identical file has already been uploaded and processed.',
        {
          existingBatchId: existingBatch._id.toString(),
          fileName: existingBatch.fileName,
          importedAt: existingBatch.importedAt.toISOString(),
          totalRows: existingBatch.totalRows,
          importedRows: existingBatch.importedRows,
          hint: 'To force re-import of this identical file, set the query parameter ?allowDuplicate=true.',
        }
      );
    }
  }

  // 3. Parse CSV content with csv-parse/sync
  let rawRecords: Record<string, string>[];
  try {
    rawRecords = parse(file.buffer, {
      columns: (headers: string[]) =>
        headers.map((header) => (header ? header.trim().toLowerCase() : '')),
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new CsvParsingError(`Malformed CSV content: ${message}`, 'MALFORMED_CSV');
  }

  // 4. Validate presence of data rows
  if (!rawRecords || rawRecords.length === 0) {
    throw new CsvParsingError('CSV file contains no transaction data rows.', 'NO_DATA_ROWS');
  }

  // 5. Check row count limit
  if (rawRecords.length > MAX_ALLOWED_ROWS) {
    throw new CsvParsingError(
      `CSV file row count (${rawRecords.length}) exceeds the maximum allowed limit of ${MAX_ALLOWED_ROWS} rows.`,
      'EXCESSIVE_ROW_COUNT'
    );
  }

  // 6. Validate header columns against required list
  const sampleRecord = rawRecords[0];
  const detectedColumns = Object.keys(sampleRecord);
  const missingColumns = REQUIRED_CSV_COLUMNS.filter((col) => !detectedColumns.includes(col));

  if (missingColumns.length > 0) {
    throw new CsvParsingError(
      `Missing required CSV column(s): ${missingColumns.join(', ')}. Expected headers: date, type, amount, category, description, reference (optional).`,
      'MISSING_REQUIRED_COLUMNS',
      { missingColumns, detectedColumns }
    );
  }

  // 7. Validate each row using Zod schema
  const rowErrors: CsvRowError[] = [];
  const validTransactionsToInsert: Array<{
    userId: string;
    batchId?: IImportBatchDocument['_id'];
    date: Date;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    reference?: string | null;
    counterparty?: string | null;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'cheque' | 'other';
    status: 'completed';
    notes?: string;
  }> = [];

  rawRecords.forEach((record, index) => {
    const rowNumber = index + 2; // Row 1 is header, data starts at row 2

    // Normalize vendor/party/payee aliases into counterparty if not explicitly set
    if (!record.counterparty) {
      record.counterparty =
        record.vendor || record.party || record.payee || record.payer || '';
    }

    const parsed = csvRowSchema.safeParse(record);

    if (!parsed.success) {
      parsed.error.errors.forEach((err) => {
        rowErrors.push({
          row: rowNumber,
          field: err.path.join('.') || 'row',
          value: record[err.path[0] as string] ?? undefined,
          message: err.message,
        });
      });
    } else {
      validTransactionsToInsert.push({
        userId, // Strictly use the authenticated Clerk user ID
        date: new Date(parsed.data.date),
        description: parsed.data.description,
        amount: parsed.data.amount,
        type: parsed.data.type,
        category: parsed.data.category,
        reference: parsed.data.reference || null,
        counterparty: parsed.data.counterparty || null,
        paymentMethod: (parsed.data.paymentMethod as any) || 'other',
        status: 'completed',
        notes: parsed.data.notes || '',
      });
    }
  });

  // 8. Determine batch import status
  let status: 'completed' | 'partial' | 'failed';
  if (validTransactionsToInsert.length === rawRecords.length) {
    status = 'completed';
  } else if (validTransactionsToInsert.length > 0) {
    status = 'partial';
  } else {
    status = 'failed';
  }

  // 9. Create ImportBatch record in MongoDB
  const importBatch = new ImportBatch({
    userId,
    fileName: file.originalname || 'transactions.csv',
    fileSize: file.size,
    fileHash,
    totalRows: rawRecords.length,
    importedRows: validTransactionsToInsert.length,
    rejectedRows: rowErrors.length,
    rowCount: rawRecords.length,
    successCount: validTransactionsToInsert.length,
    errorCount: rowErrors.length,
    status,
    errorLog: rowErrors.slice(0, 200), // Persist up to 200 errors for review
    importedAt: new Date(),
  });

  await importBatch.save();

  // 10. Persist valid transactions in MongoDB
  let sampleTransactions: TransactionDTO[] = [];
  if (validTransactionsToInsert.length > 0) {
    validTransactionsToInsert.forEach((tx) => {
      tx.batchId = importBatch._id;
    });

    const insertedDocs = await Transaction.insertMany(validTransactionsToInsert, { ordered: false });
    sampleTransactions = insertedDocs.slice(0, 5).map(mapTransactionToDTO);

    // Trigger deterministic anomaly scan for newly ingested records
    anomalyDetectionService.detectAnomalies(userId).catch((err) => {
      console.error('Async anomaly scan error after CSV ingestion:', err);
    });
  }

  return {
    batchId: importBatch._id.toString(),
    fileName: importBatch.fileName,
    totalRows: importBatch.totalRows,
    importedRows: importBatch.importedRows,
    rejectedRows: importBatch.rejectedRows,
    successfulRows: importBatch.importedRows,
    failedRows: importBatch.rejectedRows,
    status,
    errors: rowErrors,
    sampleTransactions,
    importedAt: importBatch.importedAt.toISOString(),
  };
};

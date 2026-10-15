import { Router, Request, Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import { requireAuth } from '../middleware/auth';
import { uploadCsvMiddleware } from '../middleware/upload';
import { validateRequest } from '../middleware/validate';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { TransactionQueryInput, transactionQuerySchema } from '../schemas/transaction.schema';
import {
  CsvParsingError,
  DuplicateUploadError,
  mapTransactionToDTO,
  processCsvImport,
} from '../services/csvImport.service';
import { ApiResponse, PaginationMeta } from '../types/api.types';
import { CsvImportResponse, TransactionDTO } from '../types/contracts.types';

export const transactionRouter = Router();

/**
 * GET /api/transactions/template
 * Download standard CSV template with required and optional columns
 */
transactionRouter.get('/template', (_req: Request, res: Response) => {
  const csvTemplate = [
    'date,type,amount,category,description,reference',
    '2026-10-01,income,15000.00,Sales,Product counter cash sales,INV-2026-001',
    '2026-10-02,expense,3500.50,Inventory,Wholesale supplies restocking,PO-2026-042',
    '2026-10-05,expense,12000.00,Rent,Shop monthly rent payment,RENT-OCT-26',
    '2026-10-08,income,8250.00,Services,Customer consulting and setup fee,SRV-2026-118',
    '2026-10-10,expense,1450.00,Utilities,Commercial electricity bill,EB-99214',
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="vyapariq_transactions_template.csv"');
  res.status(200).send(csvTemplate);
});

/**
 * POST /api/transactions/import
 * Ingest transactions via multipart/form-data CSV upload
 */
transactionRouter.post(
  '/import',
  requireAuth,
  uploadCsvMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: "No file uploaded. Please upload a CSV file with the form field name 'file'.",
          },
        });
        return;
      }

      // Enforce authenticated Clerk user ID
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Transaction owner must be an authenticated user.',
          },
        });
        return;
      }

      const allowDuplicate =
        req.query.allowDuplicate === 'true' || req.headers['x-allow-duplicate'] === 'true';

      const result = await processCsvImport({
        file: req.file,
        userId,
        allowDuplicate,
      });

      const response: ApiResponse<CsvImportResponse> = {
        success: true,
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof DuplicateUploadError) {
        res.status(409).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      if (error instanceof CsvParsingError) {
        res.status(400).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
        return;
      }

      next(error);
    }
  }
);

/**
 * GET /api/transactions
 * Retrieve transactions with user scoping, filtering, and pagination
 */
transactionRouter.get(
  '/',
  requireAuth,
  validateRequest(transactionQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as TransactionQueryInput;

      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Construct scoped MongoDB query filter
      const filter: FilterQuery<ITransactionDocument> = { userId };

      if (query.type) {
        filter.type = query.type;
      }

      if (query.category) {
        filter.category = { $regex: new RegExp(`^${query.category.trim()}$`, 'i') };
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) {
          filter.date.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filter.date.$lte = new Date(query.endDate);
        }
      }

      if (query.search) {
        const searchRegex = new RegExp(query.search.trim(), 'i');
        filter.$or = [
          { description: searchRegex },
          { reference: searchRegex },
          { category: searchRegex },
        ];
      }

      // Sorting
      const sortField = query.sortBy || 'date';
      const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
      const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

      // Query database
      const [transactions, total] = await Promise.all([
        Transaction.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Transaction.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;
      const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

      const response: ApiResponse<{
        transactions: TransactionDTO[];
        pagination: PaginationMeta;
      }> = {
        success: true,
        data: {
          transactions: (transactions as unknown as ITransactionDocument[]).map(mapTransactionToDTO),
          pagination,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

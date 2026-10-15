import { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';

// Use memory storage for fast, streaming CSV ingestion
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const isCsvExt = file.originalname.toLowerCase().endsWith('.csv');
    const isCsvMime =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/csv' ||
      file.mimetype === 'text/x-csv';

    if (!isCsvExt && !isCsvMime) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }

    cb(null, true);
  },
}).single('file');

/**
 * Express middleware to handle multipart CSV file uploads with graceful error handling.
 */
export const uploadCsvMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: 'CSV file size exceeds the maximum allowed limit of 5MB.',
            },
          });
          return;
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_FIELD',
              message: "Unexpected field. Please upload the file using form field name 'file'.",
            },
          });
          return;
        }

        res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: err.message,
          },
        });
        return;
      }

      if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only CSV files (.csv) are supported for transaction import.',
          },
        });
        return;
      }

      const message = err instanceof Error ? err.message : 'Unknown file upload error';
      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message,
        },
      });
      return;
    }

    next();
  });
};

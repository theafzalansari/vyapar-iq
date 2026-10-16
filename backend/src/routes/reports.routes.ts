import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { ReportQueryInput, reportQuerySchema } from '../schemas/reports.schema';
import { reportsService } from '../services/reports.service';
import { ApiResponse } from '../types/api.types';
import { AuditReportData } from '../types/contracts.types';

export const reportsRouter = Router();

/**
 * GET /api/reports
 * Returns compiled audit report data (summary, anomalies, trends, recommendations) as JSON.
 */
reportsRouter.get(
  '/',
  requireAuth,
  validateRequest(reportQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as ReportQueryInput;

      const reportData = await reportsService.generateAuditReportData(userId, query);

      const response: ApiResponse<AuditReportData> = {
        success: true,
        data: reportData,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/pdf
 * Generates and streams a downloadable PDF report pack for the authenticated user and period.
 */
reportsRouter.get(
  '/pdf',
  requireAuth,
  validateRequest(reportQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as ReportQueryInput;

      const reportData = await reportsService.generateAuditReportData(userId, query);
      const pdfBuffer = await reportsService.generateAuditReportPdf(reportData);

      const filename = `VyaparIQ_Audit_Report_${reportData.reportId}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/transactions/csv
 * Generates and streams a downloadable CSV of transactions for the authenticated user and period.
 */
reportsRouter.get(
  '/transactions/csv',
  requireAuth,
  validateRequest(reportQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as ReportQueryInput;

      const csvContent = await reportsService.generateTransactionsCsv(userId, query);
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `VyaparIQ_Transactions_${dateTag}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/findings/csv
 * Generates and streams a downloadable CSV of audit anomaly findings for the authenticated user and period.
 */
reportsRouter.get(
  '/findings/csv',
  requireAuth,
  validateRequest(reportQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as ReportQueryInput;

      const csvContent = await reportsService.generateFindingsCsv(userId, query);
      const dateTag = new Date().toISOString().split('T')[0];
      const filename = `VyaparIQ_Audit_Findings_${dateTag}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
);

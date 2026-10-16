import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { NetworkGraphQueryInput, networkGraphQuerySchema } from '../schemas/networkGraph.schema';
import { networkGraphService } from '../services/networkGraph.service';
import { ApiResponse } from '../types/api.types';
import { NetworkGraphResponse } from '../types/contracts.types';

export const networkGraphRouter = Router();

/**
 * GET /api/network-graph (and alias /api/network/graph)
 * Returns interactive relationship graph with vendor, customer, and transaction nodes,
 * payment edges, and detected duplicate/burst relationship indicators.
 * Strictly scoped to the authenticated Clerk user.
 */
networkGraphRouter.get(
  '/',
  requireAuth,
  validateRequest(networkGraphQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as NetworkGraphQueryInput;

      const graphData = await networkGraphService.getNetworkGraph(userId, query);

      const response: ApiResponse<NetworkGraphResponse> = {
        success: true,
        data: graphData,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

import crypto from 'crypto';
import { FilterQuery } from 'mongoose';
import { Anomaly } from '../models/Anomaly';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { normalizeDateBoundaries } from '../schemas/analytics.schema';
import { NetworkGraphQueryInput } from '../schemas/networkGraph.schema';
import {
  NetworkEdge,
  NetworkGraphResponse,
  NetworkGraphSummary,
  NetworkNode,
  NetworkNodeSeverity,
} from '../types/contracts.types';
import { anomalyDetectionService } from './anomalyDetection.service';

/**
 * Normalizes and extracts an explainable counterparty or vendor name from a transaction.
 */
export function extractCounterparty(tx: {
  counterparty?: string | null;
  description: string;
  category: string;
  type: 'income' | 'expense';
}): string {
  // 1. If explicit counterparty column exists, use it
  if (tx.counterparty && tx.counterparty.trim().length > 0) {
    return tx.counterparty.trim();
  }

  const desc = tx.description.trim();

  // 2. Check for separator patterns: "Vendor Name - Description" or "Vendor Name : Description"
  const separatorMatch = desc.match(/^([^:-|]+)\s*[-:|]\s*(.+)$/);
  if (separatorMatch && separatorMatch[1].trim().length > 2) {
    return cleanEntityName(separatorMatch[1].trim());
  }

  // 3. Check for payment phrases: "Payment to Vendor", "Paid to Vendor", "Transfer to Vendor"
  const toMatch = desc.match(
    /(?:payment\s+to|paid\s+to|transfer\s+to|neft\s+to|upi\s+to)\s+([a-zA-Z0-9\s&.]+)/i
  );
  if (toMatch && toMatch[1].trim().length > 2) {
    return cleanEntityName(toMatch[1].trim());
  }

  // 4. Check for receivable phrases: "Received from Client", "From Client"
  const fromMatch = desc.match(/(?:received\s+from|from)\s+([a-zA-Z0-9\s&.]+)/i);
  if (fromMatch && fromMatch[1].trim().length > 2) {
    return cleanEntityName(fromMatch[1].trim());
  }

  // 5. Fallback: normalize the description into a concise counterparty entity name
  return cleanEntityName(desc);
}

function cleanEntityName(name: string): string {
  // Remove trailing reference codes, invoice tags, or excessive punctuation
  return name
    .replace(/\s+(?:INV|PO|REF|CHQ|BILL|EB)[-\s#0-9A-Z]+/gi, '')
    .replace(/[#*()]/g, '')
    .trim();
}

function slugify(text: string): string {
  return crypto.createHash('md5').update(text.toLowerCase()).digest('hex').slice(0, 10);
}

export const networkGraphService = {
  /**
   * Generates an interactive relationship graph from real MongoDB transactions belonging
   * strictly to the authenticated user. Detects repeated payments, duplicate clusters,
   * and shared reference linkages.
   */
  async getNetworkGraph(
    userId: string,
    query: NetworkGraphQueryInput = { limit: 100 }
  ): Promise<NetworkGraphResponse> {
    const { startDate, endDate } = normalizeDateBoundaries(query.startDate, query.endDate);
    const limit = query.limit || 100;

    // Build query filter strictly isolated to the authenticated Clerk user
    const filter: FilterQuery<ITransactionDocument> = {
      userId,
      amount: { $gt: 0 },
    };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    if (query.category) {
      filter.category = query.category;
    }

    // Retrieve transactions sorted chronologically
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Handle empty dataset gracefully
    if (!transactions || transactions.length === 0) {
      return {
        nodes: [],
        edges: [],
        summary: {
          totalNodes: 0,
          totalEdges: 0,
          vendorNodes: 0,
          customerNodes: 0,
          transactionNodes: 0,
          flaggedNodes: 0,
          flaggedEdges: 0,
        },
      };
    }

    // Retrieve or run anomaly detection to identify flagged transactions and cross-links
    let anomalies = await Anomaly.find({ userId }).lean();
    if (anomalies.length === 0 && transactions.length > 0) {
      const detectResult = await anomalyDetectionService.detectAnomalies(userId);
      anomalies = (await Anomaly.find({ userId }).lean()) as any;
    }

    // Map transaction IDs to their anomaly findings
    const txAnomalyMap = new Map<string, { severity: NetworkNodeSeverity; title: string; type: string }>();
    anomalies.forEach((a) => {
      const severity: NetworkNodeSeverity =
        a.severity === 'critical' ? 'critical' : a.severity === 'high' || a.severity === 'medium' ? 'flagged' : 'normal';

      (a.transactionIds || []).forEach((txId) => {
        const idStr = txId.toString();
        const existing = txAnomalyMap.get(idStr);
        if (!existing || severity === 'critical') {
          txAnomalyMap.set(idStr, { severity, title: a.title, type: a.type });
        }
      });

      if (a.transactionId) {
        const idStr = a.transactionId.toString();
        const existing = txAnomalyMap.get(idStr);
        if (!existing || severity === 'critical') {
          txAnomalyMap.set(idStr, { severity, title: a.title, type: a.type });
        }
      }
    });

    // Group transactions by counterparty entity
    interface EntityGroup {
      name: string;
      slug: string;
      type: 'vendor' | 'customer';
      category: string;
      totalAmount: number;
      transactions: typeof transactions;
    }

    const entityGroups = new Map<string, EntityGroup>();

    transactions.forEach((tx) => {
      const counterpartyName = extractCounterparty({
        counterparty: (tx as any).counterparty,
        description: tx.description,
        category: tx.category,
        type: tx.type,
      });

      const slug = slugify(counterpartyName);

      let group = entityGroups.get(slug);
      if (!group) {
        group = {
          name: counterpartyName,
          slug,
          type: tx.type === 'income' ? 'customer' : 'vendor',
          category: tx.category,
          totalAmount: 0,
          transactions: [],
        };
        entityGroups.set(slug, group);
      }

      group.totalAmount += tx.amount;
      group.transactions.push(tx);
    });

    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    const edgeIdSet = new Set<string>();

    const sortedEntities = Array.from(entityGroups.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    // Limit to top entities to keep graph balanced and readable
    const maxEntities = Math.min(sortedEntities.length, 12);
    const activeEntities = sortedEntities.slice(0, maxEntities);

    // Canvas dimensions matching frontend SVG viewBox: 0 0 850 520
    const canvasWidth = 850;
    const canvasHeight = 520;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const orbitRx = Math.min(260, canvasWidth * 0.32);
    const orbitRy = Math.min(160, canvasHeight * 0.32);

    // 1. Position Counterparty Nodes in an elliptical orbit
    activeEntities.forEach((entity, idx) => {
      const angle = (2 * Math.PI * idx) / activeEntities.length - Math.PI / 2;
      const entityX = Math.round(centerX + orbitRx * Math.cos(angle));
      const entityY = Math.round(centerY + orbitRy * Math.sin(angle));

      // Determine entity node severity based on connected transactions
      let entitySeverity: NetworkNodeSeverity = 'normal';
      let flaggedCount = 0;

      entity.transactions.forEach((tx) => {
        const flag = txAnomalyMap.get(tx._id.toString());
        if (flag) {
          flaggedCount++;
          if (flag.severity === 'critical') entitySeverity = 'critical';
          else if (entitySeverity !== 'critical' && flag.severity === 'flagged') {
            entitySeverity = 'flagged';
          }
        }
      });

      const entityNodeId = `entity_${entity.slug}`;

      nodes.push({
        id: entityNodeId,
        label: entity.name,
        type: entity.type,
        category: entity.category,
        amount: Math.round(entity.totalAmount * 100) / 100,
        severity: entitySeverity,
        x: entityX,
        y: entityY,
        transactionCount: entity.transactions.length,
        details: `${entity.type === 'vendor' ? 'Vendor' : 'Customer'} associated with ${
          entity.transactions.length
        } transaction(s) totaling ₹${entity.totalAmount.toLocaleString('en-IN')}.${
          flaggedCount > 0
            ? ` ${flaggedCount} transaction(s) flagged for reconciliation audit.`
            : ' Reconciliation patterns consistent.'
        }`,
      });

      // 2. Position Transaction Nodes around each entity node in an outward arc
      const maxTxPerEntity = Math.min(entity.transactions.length, 5);
      const displayedTx = entity.transactions.slice(0, maxTxPerEntity);

      // Angle directed outward from graph center through entity node
      const outwardAngle = Math.atan2(entityY - centerY, entityX - centerX);
      const arcSpread = Math.PI * 0.7; // ~126 degree arc
      const txRadius = 82; // Distance from entity hub

      displayedTx.forEach((tx, txIdx) => {
        let txAngle = outwardAngle;
        if (displayedTx.length > 1) {
          const step = arcSpread / (displayedTx.length - 1);
          txAngle = outwardAngle - arcSpread / 2 + step * txIdx;
        }

        // Clamp coordinates within canvas boundaries
        const rawX = entityX + txRadius * Math.cos(txAngle);
        const rawY = entityY + txRadius * Math.sin(txAngle);
        const txX = Math.max(45, Math.min(canvasWidth - 45, Math.round(rawX)));
        const txY = Math.max(45, Math.min(canvasHeight - 45, Math.round(rawY)));

        const txIdStr = tx._id.toString();
        const txNodeId = `tx_${txIdStr}`;
        const anomaly = txAnomalyMap.get(txIdStr);

        const txSeverity: NetworkNodeSeverity = anomaly ? anomaly.severity : 'normal';

        const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
        });

        const shortRef = tx.reference ? `Ref ${tx.reference.slice(0, 10)}` : tx.description.slice(0, 16);

        nodes.push({
          id: txNodeId,
          label: `₹${tx.amount.toLocaleString('en-IN')} (${shortRef})`,
          type: 'transaction',
          amount: tx.amount,
          category: tx.category,
          severity: txSeverity,
          x: txX,
          y: txY,
          details: `${tx.type === 'income' ? 'Incoming payment' : 'Expense disbursement'} of ₹${tx.amount.toLocaleString(
            'en-IN'
          )} on ${dateStr} for "${tx.description}".${
            anomaly ? ` Warning: ${anomaly.title} (${anomaly.type}).` : ''
          }`,
          metadata: {
            date: tx.date,
            reference: tx.reference,
            paymentMethod: tx.paymentMethod,
            status: tx.status,
            description: tx.description,
          },
        });

        // Add primary edge from entity to transaction
        const edgeId = `e_${entityNodeId}_${txNodeId}`;
        edges.push({
          id: edgeId,
          source: entityNodeId,
          target: txNodeId,
          label: tx.type === 'income' ? 'Receivable' : 'Payment',
          amount: tx.amount,
          isFlagged: txSeverity !== 'normal',
          type: tx.type === 'income' ? 'receivable' : 'payment',
        });
        edgeIdSet.add(edgeId);
      });
    });

    // 3. Detect and add cross-link edges for explainable relationships:
    // (a) Duplicate or near-duplicate payments
    // (b) Repeated burst payments
    // (c) Shared invoice references
    const displayedTxNodes = nodes.filter((n) => n.type === 'transaction');

    for (let i = 0; i < displayedTxNodes.length; i++) {
      for (let j = i + 1; j < displayedTxNodes.length; j++) {
        const nodeA = displayedTxNodes[i];
        const nodeB = displayedTxNodes[j];

        const metaA = nodeA.metadata as any;
        const metaB = nodeB.metadata as any;
        if (!metaA || !metaB) continue;

        const crossEdgeId = `cross_${nodeA.id}_${nodeB.id}`;
        if (edgeIdSet.has(crossEdgeId)) continue;

        // Check for duplicate payment relationship (identical amount & close in time)
        const isIdenticalAmount = nodeA.amount && nodeB.amount && nodeA.amount === nodeB.amount;
        const dateA = new Date(metaA.date).getTime();
        const dateB = new Date(metaB.date).getTime();
        const timeDiffMinutes = Math.abs(dateA - dateB) / (1000 * 60);

        if (isIdenticalAmount && timeDiffMinutes <= 1440) {
          // Within 24 hours with exact amount
          const isRapid = timeDiffMinutes <= 60;
          edges.push({
            id: crossEdgeId,
            source: nodeA.id,
            target: nodeB.id,
            label: isRapid
              ? `Duplicate? (${Math.round(timeDiffMinutes)}m)`
              : `Identical ₹${nodeA.amount?.toLocaleString('en-IN')}`,
            amount: nodeA.amount,
            isFlagged: true,
            type: 'duplicate_link',
          });
          edgeIdSet.add(crossEdgeId);
          continue;
        }

        // Check for shared invoice reference cross-links
        if (
          metaA.reference &&
          metaB.reference &&
          metaA.reference.trim() !== '' &&
          metaA.reference.trim().toLowerCase() === metaB.reference.trim().toLowerCase()
        ) {
          edges.push({
            id: crossEdgeId,
            source: nodeA.id,
            target: nodeB.id,
            label: `Shared Ref (${metaA.reference})`,
            isFlagged: true,
            type: 'shared_reference',
          });
          edgeIdSet.add(crossEdgeId);
        }
      }
    }

    // 4. Compute comprehensive graph summary metrics
    const summary: NetworkGraphSummary = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      vendorNodes: nodes.filter((n) => n.type === 'vendor').length,
      customerNodes: nodes.filter((n) => n.type === 'customer').length,
      transactionNodes: nodes.filter((n) => n.type === 'transaction').length,
      flaggedNodes: nodes.filter((n) => n.severity && n.severity !== 'normal').length,
      flaggedEdges: edges.filter((e) => e.isFlagged).length,
    };

    return {
      nodes,
      edges,
      summary,
    };
  },
};

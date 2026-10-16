import crypto from 'crypto';
import mongoose from 'mongoose';
import { Anomaly, IAnomalyDocument } from '../models/Anomaly';
import { ITransactionDocument, Transaction } from '../models/Transaction';
import { AnomalyQueryInput } from '../schemas/anomaly.schema';
import {
  AnomalyFinding,
  AnomalyListResponse,
  AnomalySeverity,
  AnomalyType,
} from '../types/contracts.types';

export interface RawCandidateFinding {
  type: AnomalyType;
  severity: AnomalySeverity;
  rule: string;
  title: string;
  description: string;
  detectedAt: Date;
  transactionIds: mongoose.Types.ObjectId[];
  transactionId?: string;
  affectedAmount: number;
  confidenceScore: number;
  riskScore: number;
  evidence: Record<string, unknown>;
  recommendedAction: string;
  fingerprint: string;
}

function round(val: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

function generateFingerprint(rule: string, userId: string, keys: (string | number)[]): string {
  const content = `${rule}:${userId}:${keys.join(':')}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

export const anomalyDetectionService = {
  /**
   * Evaluates all deterministic anomaly rules against the authenticated user's transactions,
   * idempotently persists new/updated findings, and returns the full audit findings list.
   */
  async detectAnomalies(userId: string): Promise<AnomalyListResponse> {
    const transactions = await Transaction.find({ userId, amount: { $gt: 0 } })
      .sort({ date: 1 })
      .lean();

    if (!transactions || transactions.length === 0) {
      return {
        anomalies: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      };
    }

    const candidateFindings: RawCandidateFinding[] = [];

    // ========================================================================
    // Rule 1: Duplicate or Near-Duplicate Payments
    // ========================================================================
    const expenses = transactions.filter((t) => t.type === 'expense');

    // Group expenses by identical amount
    const amountMap = new Map<number, typeof expenses>();
    for (const exp of expenses) {
      const list = amountMap.get(exp.amount) || [];
      list.push(exp);
      amountMap.set(exp.amount, list);
    }

    for (const [amount, sameAmountList] of amountMap.entries()) {
      if (sameAmountList.length < 2) continue;

      for (let i = 0; i < sameAmountList.length; i++) {
        for (let j = i + 1; j < sameAmountList.length; j++) {
          const t1 = sameAmountList[i];
          const t2 = sameAmountList[j];

          const timeDeltaMs = Math.abs(t2.date.getTime() - t1.date.getTime());
          const timeDeltaMins = timeDeltaMs / (60 * 1000);
          const timeDeltaHours = timeDeltaMins / 60;

          // Only consider duplicate window within 72 hours
          if (timeDeltaHours > 72) continue;

          // Check description similarity / normalization
          const desc1 = t1.description.trim().toLowerCase();
          const desc2 = t2.description.trim().toLowerCase();
          const isDescMatch = desc1 === desc2 || desc1.includes(desc2) || desc2.includes(desc1);

          // If identical recipient or very close time window (<= 60 mins)
          if (isDescMatch || timeDeltaMins <= 60) {
            // Factor 1: Time Proximity (weight: 0.50)
            let timeFactor = 0.5;
            if (timeDeltaMins <= 15) timeFactor = 1.0;
            else if (timeDeltaMins <= 60) timeFactor = 0.9;
            else if (timeDeltaHours <= 24) timeFactor = 0.75;

            // Factor 2: Description Match (weight: 0.35)
            const descFactor = isDescMatch ? 1.0 : 0.6;

            // Factor 3: Amount Significance (weight: 0.15)
            const amountFactor = Math.min(1.0, amount / 5000);

            let riskScore = round(0.5 * timeFactor + 0.35 * descFactor + 0.15 * amountFactor, 2);

            let severity: AnomalySeverity = 'low';
            if (timeDeltaMins <= 15 && isDescMatch) {
              riskScore = Math.max(0.88, riskScore);
            }

            if (riskScore >= 0.85) severity = 'critical';
            else if (riskScore >= 0.7) severity = 'high';
            else if (riskScore >= 0.5) severity = 'medium';

            const sortedIds = [t1._id.toString(), t2._id.toString()].sort();
            const fingerprint = generateFingerprint(
              'DUPLICATE_PAYMENT',
              userId,
              [amount, ...sortedIds]
            );

            candidateFindings.push({
              type: 'duplicate_payment',
              severity,
              rule: 'DUPLICATE_OR_NEAR_DUPLICATE_PAYMENT',
              title:
                timeDeltaMins <= 60
                  ? `Duplicate Payment Detected within ${Math.max(1, Math.round(timeDeltaMins))} Minutes`
                  : `Potential Duplicate Expense within ${Math.round(timeDeltaHours)} Hours`,
              description: `Two identical payments of ₹${amount.toLocaleString()} were recorded for "${t1.description}" within ${
                timeDeltaMins <= 60
                  ? `${Math.max(1, Math.round(timeDeltaMins))} minutes`
                  : `${Math.round(timeDeltaHours)} hours`
              } (Refs: ${t1.reference || 'N/A'}, ${t2.reference || 'N/A'}).`,
              detectedAt: t2.date,
              transactionIds: [t1._id as mongoose.Types.ObjectId, t2._id as mongoose.Types.ObjectId],
              transactionId: t2._id.toString(),
              affectedAmount: amount,
              confidenceScore: riskScore,
              riskScore,
              evidence: {
                duplicateAmount: amount,
                timeDeltaMinutes: round(timeDeltaMins, 1),
                timeDeltaHours: round(timeDeltaHours, 1),
                candidateTransactionIds: sortedIds,
                descriptionMatch: isDescMatch,
                references: [t1.reference || null, t2.reference || null],
                weights: { timeProximity: 0.5, descriptionMatch: 0.35, amountSignificance: 0.15 },
              },
              recommendedAction: `Request refund, cancellation, or vendor credit note adjustment for duplicate transaction #${t2._id.toString().slice(-6)}.`,
              fingerprint,
            });
          }
        }
      }
    }

    // ========================================================================
    // Rule 2: Unusual Expense Spikes
    // ========================================================================
    const categoryMap = new Map<string, typeof expenses>();
    for (const exp of expenses) {
      const cat = exp.category.trim() || 'Uncategorized';
      const list = categoryMap.get(cat) || [];
      list.push(exp);
      categoryMap.set(cat, list);
    }

    for (const [catName, catList] of categoryMap.entries()) {
      if (catList.length < 3) continue;

      for (const exp of catList) {
        // Compute baseline from the other historical transactions in this category (leave-one-out)
        const otherAmounts = catList
          .filter((e) => e._id.toString() !== exp._id.toString())
          .map((e) => e.amount);

        if (otherAmounts.length < 2) continue;

        const baselineMean = otherAmounts.reduce((a, b) => a + b, 0) / otherAmounts.length;
        const baselineVariance =
          otherAmounts.reduce((sum, val) => sum + Math.pow(val - baselineMean, 2), 0) /
          (otherAmounts.length - 1);
        const baselineStdDev = Math.sqrt(baselineVariance);

        if (exp.amount <= baselineMean) continue;

        const multiplier = exp.amount / baselineMean;
        const zScore = baselineStdDev > 0 ? (exp.amount - baselineMean) / baselineStdDev : multiplier;

        // Trigger condition: at least 2.2x baseline and Z-score >= 2.0 (or absolute jump >= 1000)
        if (multiplier >= 2.2 && (zScore >= 2.0 || exp.amount - baselineMean >= 1000)) {
          const zFactor = Math.min(1.0, zScore / 4.0);
          const multFactor = Math.min(1.0, (multiplier - 1.0) / 3.0);
          const amtFactor = Math.min(1.0, exp.amount / 20000);

          const rawScore = 0.45 * zFactor + 0.4 * multFactor + 0.15 * amtFactor;
          const riskScore = round(Math.min(0.96, Math.max(0.5, rawScore)), 2);

          let severity: AnomalySeverity = 'low';
          if (riskScore >= 0.85) severity = 'critical';
          else if (riskScore >= 0.7) severity = 'high';
          else if (riskScore >= 0.5) severity = 'medium';

          const fingerprint = generateFingerprint('EXPENSE_SPIKE', userId, [
            catName,
            exp._id.toString(),
          ]);

          candidateFindings.push({
            type: 'expense_spike',
            severity,
            rule: 'UNUSUAL_EXPENSE_SPIKE',
            title: `Abnormal ${multiplier.toFixed(1)}x Expense Spike in ${catName}`,
            description: `Expense payment of ₹${exp.amount.toLocaleString()} for "${exp.description}" exceeded category rolling average of ₹${round(baselineMean).toLocaleString()} by ${multiplier.toFixed(1)}x (Z-Score: ${zScore.toFixed(2)}).`,
            detectedAt: exp.date,
            transactionIds: [exp._id as mongoose.Types.ObjectId],
            transactionId: exp._id.toString(),
            affectedAmount: round(exp.amount - baselineMean),
            confidenceScore: riskScore,
            riskScore,
            evidence: {
              category: catName,
              transactionAmount: exp.amount,
              categoryBaselineMean: round(baselineMean),
              categoryStdDev: round(baselineStdDev),
              multiplier: round(multiplier, 2),
              zScore: round(zScore, 2),
              sampleSize: otherAmounts.length,
              weights: { zScore: 0.45, multiplier: 0.4, absoluteAmount: 0.15 },
            },
            recommendedAction: `Verify invoice details and utility meter/commercial contract for ${catName} to explain unexpected volume spike.`,
            fingerprint,
          });
        }
      }
    }

    // ========================================================================
    // Rule 3: Repeated Transaction Burst (Irregular Frequency)
    // ========================================================================
    for (const [, sameAmountList] of amountMap.entries()) {
      if (sameAmountList.length < 3) continue;

      // Check sliding 24-hour window
      for (let i = 0; i <= sameAmountList.length - 3; i++) {
        const windowTxs = [sameAmountList[i]];
        for (let j = i + 1; j < sameAmountList.length; j++) {
          const deltaHours =
            (sameAmountList[j].date.getTime() - sameAmountList[i].date.getTime()) / (3600 * 1000);
          if (deltaHours <= 24) {
            windowTxs.push(sameAmountList[j]);
          }
        }

        if (windowTxs.length >= 3) {
          const burstIds = windowTxs.map((t) => t._id.toString()).sort();
          const totalBurst = windowTxs.reduce((sum, t) => sum + t.amount, 0);
          const hoursSpan =
            (windowTxs[windowTxs.length - 1].date.getTime() - windowTxs[0].date.getTime()) /
            (3600 * 1000);

          const count = windowTxs.length;
          const riskScore = count >= 4 ? 0.85 : 0.72;
          const severity: AnomalySeverity = count >= 4 ? 'high' : 'medium';

          const fingerprint = generateFingerprint(
            'REPEATED_BURST',
            userId,
            [sameAmountList[0].amount, ...burstIds]
          );

          // Avoid duplicate burst reports
          if (!candidateFindings.some((f) => f.fingerprint === fingerprint)) {
            candidateFindings.push({
              type: 'irregular_frequency',
              severity,
              rule: 'REPEATED_TRANSACTION_BURST',
              title: `Rapid Burst of ${count} Identical Payments`,
              description: `${count} identical payments of ₹${windowTxs[0].amount.toLocaleString()} were executed within ${round(hoursSpan, 1)} hours totaling ₹${round(totalBurst).toLocaleString()}.`,
              detectedAt: windowTxs[windowTxs.length - 1].date,
              transactionIds: windowTxs.map((t) => t._id as mongoose.Types.ObjectId),
              transactionId: windowTxs[0]._id.toString(),
              affectedAmount: round(totalBurst),
              confidenceScore: riskScore,
              riskScore,
              evidence: {
                count,
                singleAmount: windowTxs[0].amount,
                totalBurstAmount: round(totalBurst),
                timeWindowHours: round(hoursSpan, 1),
                transactionIds: burstIds,
              },
              recommendedAction: `Verify whether repeated batch transactions were intentional scheduled payouts or automated script duplication.`,
              fingerprint,
            });
          }
        }
      }
    }

    // ========================================================================
    // Rule 4: High-Value Unreconciled Transaction / Unexpected Vendor
    // ========================================================================
    if (expenses.length >= 5) {
      const sortedAmounts = [...expenses.map((e) => e.amount)].sort((a, b) => a - b);
      const p80 = sortedAmounts[Math.floor(sortedAmounts.length * 0.8)];

      for (const exp of expenses) {
        const hasReference = Boolean(exp.reference && exp.reference.trim().length > 0);
        // If amount is in top 20% and has no reference, and is >= 5000
        if (!hasReference && exp.amount >= Math.max(5000, p80)) {
          const fingerprint = generateFingerprint('UNRECONCILED_HIGH', userId, [
            exp._id.toString(),
          ]);

          candidateFindings.push({
            type: 'unexpected_vendor',
            severity: 'medium',
            rule: 'HIGH_VALUE_UNRECONCILED',
            title: `High-Value Expense without Invoice Reference`,
            description: `Payment of ₹${exp.amount.toLocaleString()} for "${exp.description}" (${exp.category}) was recorded without standard invoice reference or receipt identifier.`,
            detectedAt: exp.date,
            transactionIds: [exp._id as mongoose.Types.ObjectId],
            transactionId: exp._id.toString(),
            affectedAmount: exp.amount,
            confidenceScore: 0.65,
            riskScore: 0.65,
            evidence: {
              amount: exp.amount,
              category: exp.category,
              paymentMethod: exp.paymentMethod,
              missingReference: true,
              p80Threshold: round(p80),
            },
            recommendedAction: `Attach vendor tax invoice, signed muster roll, or voucher receipt for internal audit reconciliation.`,
            fingerprint,
          });
        }
      }
    }

    // ========================================================================
    // Rule 5: Negative Cashflow Velocity Outflow
    // ========================================================================
    if (transactions.length >= 4) {
      for (let i = 0; i < transactions.length; i++) {
        const tStart = transactions[i].date;
        const tEnd = new Date(tStart.getTime() + 7 * 24 * 3600 * 1000);

        const windowTxs = transactions.filter((t) => t.date >= tStart && t.date <= tEnd);
        const windowIncome = windowTxs
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const windowExpense = windowTxs
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        if (windowExpense >= 10000 && windowExpense > 1.8 * Math.max(1, windowIncome)) {
          const ratio = windowExpense / Math.max(1, windowIncome);
          const fingerprint = generateFingerprint('NEGATIVE_VELOCITY', userId, [
            tStart.toISOString().slice(0, 10),
          ]);

          if (!candidateFindings.some((f) => f.fingerprint === fingerprint)) {
            candidateFindings.push({
              type: 'negative_cashflow',
              severity: 'high',
              rule: 'NEGATIVE_CASHFLOW_VELOCITY',
              title: `Negative Cashflow Outflow Velocity Alert`,
              description: `Total expenses between ${tStart.toISOString().slice(0, 10)} and ${tEnd.toISOString().slice(0, 10)} (₹${round(windowExpense).toLocaleString()}) exceeded incoming receivables by ${ratio.toFixed(1)}x.`,
              detectedAt: tEnd,
              transactionIds: windowTxs.map((t) => t._id as mongoose.Types.ObjectId),
              transactionId: windowTxs[0]._id.toString(),
              affectedAmount: round(windowExpense - windowIncome),
              confidenceScore: 0.8,
              riskScore: 0.8,
              evidence: {
                windowStart: tStart.toISOString(),
                windowEnd: tEnd.toISOString(),
                windowExpenses: round(windowExpense),
                windowIncome: round(windowIncome),
                outflowToInflowRatio: round(ratio, 2),
              },
              recommendedAction: `Expedite overdue B2B trade receivables before releasing further supplier payments.`,
              fingerprint,
            });
          }
        }
      }
    }

    // ========================================================================
    // Idempotent Persistence & Synchronization
    // ========================================================================
    for (const candidate of candidateFindings) {
      await Anomaly.findOneAndUpdate(
        { userId, fingerprint: candidate.fingerprint },
        {
          $setOnInsert: {
            userId,
            fingerprint: candidate.fingerprint,
            type: candidate.type,
            rule: candidate.rule,
            title: candidate.title,
            description: candidate.description,
            detectedAt: candidate.detectedAt,
            transactionIds: candidate.transactionIds,
            transactionId: candidate.transactionId,
            recommendedAction: candidate.recommendedAction,
            isResolved: false,
          },
          $set: {
            severity: candidate.severity,
            affectedAmount: candidate.affectedAmount,
            confidenceScore: candidate.confidenceScore,
            riskScore: candidate.riskScore,
            evidence: candidate.evidence,
          },
        },
        { upsert: true, new: true }
      );
    }

    return this.getAnomalies(userId);
  },

  /**
   * Retrieves stored anomalies for the authenticated user with optional filtering.
   */
  async getAnomalies(
    userId: string,
    query: AnomalyQueryInput = {}
  ): Promise<AnomalyListResponse> {
    const filter: Record<string, unknown> = { userId };

    if (query.severity) {
      filter.severity = query.severity;
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (typeof query.isResolved === 'boolean') {
      filter.isResolved = query.isResolved;
    }
    if (query.startDate || query.endDate) {
      filter.detectedAt = {};
      if (query.startDate) {
        (filter.detectedAt as Record<string, Date>).$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (filter.detectedAt as Record<string, Date>).$lte = new Date(query.endDate);
      }
    }

    const docs = await Anomaly.find(filter).sort({ detectedAt: -1 }).lean();

    const anomalies: AnomalyFinding[] = docs.map((doc: any) => ({
      id: doc._id.toString(),
      type: doc.type,
      severity: doc.severity,
      rule: doc.rule,
      title: doc.title,
      description: doc.description,
      detectedAt: doc.detectedAt.toISOString(),
      transactionId: doc.transactionId || (doc.transactionIds?.[0]?.toString() ?? undefined),
      transactionIds: (doc.transactionIds || []).map((id: any) => id.toString()),
      affectedAmount: doc.affectedAmount,
      confidenceScore: doc.confidenceScore,
      riskScore: doc.riskScore,
      evidence: doc.evidence,
      recommendedAction: doc.recommendedAction,
      isResolved: doc.isResolved,
      resolvedAt: doc.resolvedAt ? doc.resolvedAt.toISOString() : undefined,
      resolutionNotes: doc.resolutionNotes || undefined,
    }));

    // Compute summary counts across all anomalies for this user
    const allUserDocs = await Anomaly.find({ userId }).select('severity isResolved').lean();

    const summary = {
      total: allUserDocs.length,
      critical: allUserDocs.filter((a) => a.severity === 'critical').length,
      high: allUserDocs.filter((a) => a.severity === 'high').length,
      medium: allUserDocs.filter((a) => a.severity === 'medium').length,
      low: allUserDocs.filter((a) => a.severity === 'low').length,
    };

    return { anomalies, summary };
  },

  /**
   * Marks a finding as resolved/reviewed.
   */
  async resolveAnomaly(
    userId: string,
    anomalyId: string,
    isResolved = true,
    resolutionNotes?: string
  ): Promise<{ success: boolean; anomalyId: string }> {
    const anomaly = await Anomaly.findOne({
      _id: new mongoose.Types.ObjectId(anomalyId),
      userId,
    });

    if (!anomaly) {
      throw new Error('Anomaly finding not found or unauthorized');
    }

    anomaly.isResolved = isResolved;
    anomaly.resolvedAt = isResolved ? new Date() : null;
    anomaly.resolvedBy = isResolved ? userId : null;
    if (resolutionNotes !== undefined) {
      anomaly.resolutionNotes = resolutionNotes;
    }

    await anomaly.save();

    return { success: true, anomalyId: anomaly._id.toString() };
  },
};

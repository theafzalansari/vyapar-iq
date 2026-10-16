import mongoose, { Document, Model, Schema } from 'mongoose';
import { AnomalySeverity, AnomalyType } from '../types/contracts.types';

export interface IAnomalyDocument extends Document {
  userId: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  rule: string;
  title: string;
  description: string;
  detectedAt: Date;
  transactionIds: mongoose.Types.ObjectId[];
  transactionId?: string | null;
  affectedAmount: number;
  confidenceScore: number;
  riskScore: number;
  evidence: Record<string, unknown>;
  recommendedAction: string;
  isResolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnomalySchema = new Schema<IAnomalyDocument>(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          'expense_spike',
          'duplicate_payment',
          'unexpected_vendor',
          'negative_cashflow',
          'irregular_frequency',
          'unusual_category',
        ],
        message: '{VALUE} is not a valid anomaly type',
      },
      required: [true, 'type is required'],
      index: true,
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level',
      },
      required: [true, 'severity is required'],
      index: true,
    },
    rule: {
      type: String,
      required: [true, 'rule is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [200, 'title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
      maxlength: [1000, 'description cannot exceed 1000 characters'],
    },
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    transactionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    transactionId: {
      type: String,
      default: null,
      trim: true,
    },
    affectedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'affectedAmount cannot be negative'],
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: [0, 'confidenceScore must be between 0 and 1'],
      max: [1, 'confidenceScore must be between 0 and 1'],
    },
    riskScore: {
      type: Number,
      required: true,
      min: [0, 'riskScore must be between 0 and 1'],
      max: [1, 'riskScore must be between 0 and 1'],
    },
    evidence: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recommendedAction: {
      type: String,
      required: [true, 'recommendedAction is required'],
      trim: true,
      maxlength: [500, 'recommendedAction cannot exceed 500 characters'],
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: null,
      trim: true,
    },
    resolutionNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, 'resolutionNotes cannot exceed 500 characters'],
    },
    fingerprint: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user querying, resolution status, and idempotent fingerprinting
AnomalySchema.index({ userId: 1, fingerprint: 1 }, { unique: true });
AnomalySchema.index({ userId: 1, isResolved: 1, detectedAt: -1 });
AnomalySchema.index({ userId: 1, severity: 1 });

export const Anomaly: Model<IAnomalyDocument> =
  mongoose.models.Anomaly || mongoose.model<IAnomalyDocument>('Anomaly', AnomalySchema);

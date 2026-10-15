import mongoose, { Document, Model, Schema } from 'mongoose';
import { PaymentMethod, TransactionStatus, TransactionType } from '../types/contracts.types';

export interface ITransactionDocument extends Document {
  userId: string;
  batchId?: mongoose.Types.ObjectId | null;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  reference?: string | null;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
      trim: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'ImportBatch',
      default: null,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
      maxlength: [500, 'description cannot exceed 500 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'type is required'],
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
      maxlength: [100, 'category cannot exceed 100 characters'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'other',
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'pending', 'flagged', 'reconciled'],
        message: '{VALUE} is not a valid transaction status',
      },
      default: 'completed',
    },
    reference: {
      type: String,
      trim: true,
      maxlength: [100, 'reference cannot exceed 100 characters'],
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'notes cannot exceed 1000 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for business querying and analytics
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

export const Transaction: Model<ITransactionDocument> =
  mongoose.models.Transaction || mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);

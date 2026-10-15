import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICsvRowError {
  row: number;
  field?: string;
  message: string;
}

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'partial' | 'failed';

export interface IImportBatchDocument extends Document {
  userId: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  successCount: number;
  errorCount: number;
  status: BatchStatus;
  errorLog: ICsvRowError[];
  importedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImportBatchSchema = new Schema<IImportBatchDocument>(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'fileName is required'],
      trim: true,
      maxlength: [255, 'fileName cannot exceed 255 characters'],
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rowCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    successCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    errorCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'partial', 'failed'],
        message: '{VALUE} is not a valid batch status',
      },
      default: 'pending',
      index: true,
    },
    errorLog: [
      {
        row: { type: Number, required: true },
        field: { type: String },
        message: { type: String, required: true },
      },
    ],
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ImportBatchSchema.index({ userId: 1, createdAt: -1 });

export const ImportBatch: Model<IImportBatchDocument> =
  mongoose.models.ImportBatch || mongoose.model<IImportBatchDocument>('ImportBatch', ImportBatchSchema);

// TypeScript type augmentation for Express Request

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};

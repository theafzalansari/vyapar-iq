import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

export type DbConnectionState = 'connected' | 'connecting' | 'disconnected' | 'disconnecting';

export const getDatabaseStatus = (): DbConnectionState => {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    case 0:
    default:
      return 'disconnected';
  }
};

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Ensure Atlas mongodb+srv SRV lookups resolve reliably on Windows
  if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch {
      // Ignore if environment does not permit setting DNS servers
    }
  }

  try {
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB: Connected successfully (${mongoose.connection.name})`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB: Connection disconnected');
    });

    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'vyapariq',
      serverSelectionTimeoutMS: 8000,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`MongoDB warning: Unable to connect to database (${message}). Running with disconnected database.`);
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

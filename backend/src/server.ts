import { app } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { isClerkConfigured } from './middleware/auth';

const startServer = async () => {
  console.log('='.repeat(50));
  console.log('🚀 Starting VyaparIQ Backend Server...');
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Clerk Auth:  ${isClerkConfigured() ? 'Configured ✅' : 'Development/Unconfigured (Add keys to .env) ⚠️'}`);
  console.log('='.repeat(50));

  // Connect to Database
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`VyaparIQ Server running at http://localhost:${env.PORT}`);
    console.log(`Health Check: http://localhost:${env.PORT}/api/health`);
    console.log('='.repeat(50));
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('VyaparIQ server and database connection closed.');
      process.exit(0);
    });

    // Force exit if not closed within 10s
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('Failed to start VyaparIQ server:', error);
  process.exit(1);
});

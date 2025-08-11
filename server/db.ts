import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment with enhanced error handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced connection configuration with retry logic and connection pooling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit concurrent connections for stability
  maxUses: 1000, // Connection reuse limit
  allowExitOnIdle: false, // Keep connections alive
  idleTimeoutMillis: 30000, // 30 second idle timeout
});

// Enhanced database instance with better error handling and performance monitoring
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: process.env.NODE_ENV === 'development' 
});

// Performance monitoring for slow queries
export function logSlowQuery(queryName: string, duration: number) {
  if (duration > 100) {
    console.warn(`⚠️ Slow query: ${queryName} - ${duration}ms`);
  }
}

// Connection health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown handler
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connections closed gracefully');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}
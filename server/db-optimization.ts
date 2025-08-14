
/**
 * SHERLOCK v18.8 DATABASE OPTIMIZATION ENGINE
 * Advanced database query optimization and indexing
 */

import { db } from './db.js';
import { sql } from 'drizzle-orm';

export class DatabaseOptimizer {
  
  /**
   * Create optimal indexes for financial queries
   */
  async createOptimalIndexes() {
    console.log('🔧 Creating optimal database indexes...');
    
    try {
      // Index for representatives by debt amount (DESC)
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_representatives_total_debt_desc 
        ON representatives (CAST(total_debt as DECIMAL) DESC NULLS LAST)
      `);

      // Index for invoices by representative_id and status
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_rep_status 
        ON invoices (representative_id, status)
      `);

      // Index for payments by representative_id and allocation
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_rep_allocated 
        ON payments (representative_id, is_allocated)
      `);

      // Index for payments by invoice_id and allocation (for specific invoice calculations)
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice_allocated 
        ON payments (invoice_id, is_allocated)
      `);

      // Composite index for invoice amount calculations
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_rep_status_amount 
        ON invoices (representative_id, status) INCLUDE (amount)
      `);

      console.log('✅ Database indexes created successfully');
      return true;

    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      return false;
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQueryPerformance() {
    console.log('📊 Analyzing database query performance...');
    
    try {
      // Check if indexes are being used
      const indexUsage = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE idx_scan > 0
        ORDER BY idx_scan DESC
        LIMIT 10
      `);

      console.log('📈 Index usage statistics:', indexUsage);

      // Check slow queries (if pg_stat_statements is available)
      try {
        const slowQueries = await db.execute(sql`
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows
          FROM pg_stat_statements
          WHERE mean_time > 100
          ORDER BY mean_time DESC
          LIMIT 5
        `);
        
        console.log('🐌 Slow queries detected:', slowQueries);
      } catch (error) {
        console.log('ℹ️ pg_stat_statements not available for slow query analysis');
      }

      return { indexUsage };

    } catch (error) {
      console.error('❌ Error analyzing performance:', error);
      return null;
    }
  }

  /**
   * Optimize table statistics
   */
  async updateTableStatistics() {
    console.log('📊 Updating table statistics...');
    
    try {
      // Update statistics for better query planning
      await db.execute(sql`ANALYZE representatives`);
      await db.execute(sql`ANALYZE invoices`);
      await db.execute(sql`ANALYZE payments`);
      
      console.log('✅ Table statistics updated');
      return true;
      
    } catch (error) {
      console.error('❌ Error updating statistics:', error);
      return false;
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    console.log('🏥 Checking database health...');
    
    try {
      // Check connection status
      const connectionInfo = await db.execute(sql`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      // Check table sizes
      const tableSizes = await db.execute(sql`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(tablename::regclass) DESC
      `);

      console.log('🔗 Database connections:', connectionInfo);
      console.log('📦 Table sizes:', tableSizes);

      return {
        connections: connectionInfo,
        tableSizes
      };

    } catch (error) {
      console.error('❌ Error checking database health:', error);
      return null;
    }
  }
}

export const dbOptimizer = new DatabaseOptimizer();

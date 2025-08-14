
import { Express } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerMaintenanceRoutes(app: Express) {
  
  // Enhanced Authentication Middleware
  const maintenanceAuthMiddleware = (req: any, res: any, next: any) => {
    const isCrmAuthenticated = req.session?.crmAuthenticated === true || req.session?.crmUser;
    const isAdminAuthenticated = req.session?.authenticated === true;
    const isAuthenticated = isCrmAuthenticated || isAdminAuthenticated;
    
    if (isAuthenticated) {
      req.session.touch();
      next();
    } else {
      res.status(401).json({ 
        error: 'احراز هویت نشده - دسترسی غیرمجاز',
        context: 'MAINTENANCE_ACCESS',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Force cache cleanup and optimization
  app.post("/api/crm/maintenance/cleanup", maintenanceAuthMiddleware, async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Clean old activity logs (older than 30 days)
      const cleanupResult = await db.execute(
        sql`delete from activity_logs where created_at < ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}`
      );
      
      // Clean old session data if exists
      await db.execute(
        sql`delete from session where expire < ${Math.floor(Date.now() / 1000)}`
      );
      
      const endTime = Date.now();
      
      console.log(`🧹 Maintenance cleanup completed in ${endTime - startTime}ms`);
      
      res.json({
        success: true,
        message: 'پاکسازی سیستم با موفقیت انجام شد',
        details: {
          duration: `${endTime - startTime}ms`,
          logsCleared: cleanupResult.rowCount || 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Maintenance cleanup error:', error);
      res.status(500).json({ 
        error: 'خطا در پاکسازی سیستم',
        timestamp: new Date().toISOString()
      });
    }
  });

  // System health check endpoint
  app.get("/api/crm/maintenance/health", maintenanceAuthMiddleware, async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Check database connection
      const dbTest = await db.execute(sql`SELECT 1 as health_check`);
      
      // Check session store
      const sessionCount = await db.execute(sql`SELECT COUNT(*) as session_count FROM session`);
      
      // Check recent activity
      const recentActivity = await db.execute(
        sql`SELECT COUNT(*) as recent_logs FROM activity_logs WHERE created_at > ${new Date(Date.now() - 24 * 60 * 60 * 1000)}`
      );
      
      const endTime = Date.now();
      
      res.json({
        success: true,
        health: 'HEALTHY',
        checks: {
          database: dbTest.rows.length > 0 ? 'OK' : 'ERROR',
          sessions: sessionCount.rows[0]?.session_count || 0,
          recentActivity: recentActivity.rows[0]?.recent_logs || 0,
          responseTime: `${endTime - startTime}ms`
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        health: 'UNHEALTHY',
        error: 'خطا در بررسی وضعیت سیستم',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Performance metrics endpoint
  app.get("/api/crm/maintenance/metrics", maintenanceAuthMiddleware, async (req, res) => {
    try {
      const metrics = {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: {
          uptime: Math.round(process.uptime()),
          loadAverage: process.platform === 'linux' ? require('os').loadavg() : [0, 0, 0]
        },
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch
        },
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error('Metrics error:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت معیارهای عملکرد',
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('✅ Maintenance routes registered successfully');
}

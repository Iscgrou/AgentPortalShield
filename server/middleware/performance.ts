import { Request, Response, NextFunction } from 'express';

// Enhanced performance monitoring middleware
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Override res.json to log response time
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;

    // Dynamic thresholds based on endpoint type
    let threshold = 200;
    if (req.url?.includes('/statistics') || req.url?.includes('/global')) {
      threshold = 1000;
    } else if (req.url?.includes('/debtors') || req.url?.includes('/unified-financial')) {
      threshold = 500; // More lenient for financial calculations
    }

    // Performance categorization
    let perfLevel = '✅';
    if (duration > threshold * 2) {
      perfLevel = '🔴 CRITICAL';
    } else if (duration > threshold) {
      perfLevel = '⚠️ SLOW';
    } else if (duration > threshold * 0.5) {
      perfLevel = '🟡 MODERATE';
    }

    // Enhanced logging
    if (duration > threshold || process.env.NODE_ENV === 'development') {
      console.log(`${perfLevel} ${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
    }

    // Memory usage check for heavy endpoints
    if (duration > 1000) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      if (heapUsedMB > 300) {
        console.warn(`🧠 High memory usage: ${heapUsedMB}MB after ${req.url}`);
      }
    }

    return originalJson.call(this, body);
  };

  next();
}

// Memory monitoring utility
export function logMemoryUsage() {
  const used = process.memoryUsage();
  const memoryInfo = {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100,
  };

  console.log('Memory usage:', memoryInfo);

  // Warn if heap usage is too high
  if (memoryInfo.heapUsed > 500) {
    console.warn('⚠️ High memory usage detected:', memoryInfo.heapUsed, 'MB');
  }
}

// Startup memory monitoring
if (process.env.NODE_ENV === 'development') {
  setInterval(logMemoryUsage, 60000); // Log every minute in development
}
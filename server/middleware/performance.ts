import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export function performanceMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Override res.json to log response time
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;

    // ⚠️ Warning for slow endpoints (> 1000ms for statistics, > 200ms for others)
    const isStatisticsEndpoint = req.url?.includes('/statistics') || req.url?.includes('/global');
    const threshold = isStatisticsEndpoint ? 1000 : 200;

    if (duration > threshold) {
      console.warn(`⚠️ Slow endpoint: ${req.method} ${req.url} - ${duration}ms`);
    }

    // Log all requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
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
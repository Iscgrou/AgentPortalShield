/**
 * SHERLOCK v18.0 - UNIFIED STATISTICS API ROUTES
 * API endpoints یکپارچه برای تمام ویجت‌های آماری
 */

import { Router } from "express";
import { unifiedStatisticsEngine } from "../services/unified-statistics-engine";

const router = Router();

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if ((req.session as any)?.authenticated || (req.session as any)?.crmAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "احراز هویت نشده" });
  }
}

/**
 * آمار کلی سیستم - Dashboard اصلی
 * GET /api/unified-statistics/global
 */
router.get("/global", requireAuth, async (req, res) => {
  try {
    // Cache response for 30 seconds to prevent repeated expensive queries
    res.set('Cache-Control', 'public, max-age=30');

    console.log('🔄 SHERLOCK v18.0: Starting global statistics generation...');
    const startTime = Date.now();

    const stats = await unifiedStatisticsEngine.getGlobalStatistics();

    res.json({
      success: true,
      data: stats,
      meta: {
        source: "SHERLOCK v18.0 Unified Statistics Engine",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Global statistics error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار کلی سیستم",
      details: error.message
    });
  }
});

/**
 * آمار تخصصی نمایندگان 
 * GET /api/unified-statistics/representatives
 */
router.get("/representatives", requireAuth, async (req, res) => {
  try {
    const stats = await unifiedStatisticsEngine.getRepresentativeStatistics();

    res.json({
      success: true,
      data: stats,
      meta: {
        source: "SHERLOCK v18.0 Representatives Statistics",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Representative statistics error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت آمار نمایندگان",
      details: error.message
    });
  }
});

/**
 * فعالیت‌های اخیر سیستم
 * GET /api/unified-statistics/recent-activities
 */
router.get("/recent-activities", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await unifiedStatisticsEngine.getRecentActivities(limit);

    res.json({
      success: true,
      data: activities,
      meta: {
        count: activities.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Recent activities error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت فعالیت‌های اخیر",
      details: error.message
    });
  }
});

/**
 * پاک‌سازی Cache آمار
 * POST /api/unified-statistics/cache/invalidate
 */
router.post("/cache/invalidate", requireAuth, async (req, res) => {
  try {
    const { scope = 'all' } = req.body;

    unifiedStatisticsEngine.invalidateCache(scope);

    res.json({
      success: true,
      message: `Cache ${scope} با موفقیت پاک‌سازی شد`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Cache invalidation error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در پاک‌سازی Cache",
      details: error.message
    });
  }
});

/**
 * وضعیت سلامت Statistics Engine
 * GET /api/unified-statistics/health
 */
router.get("/health", async (req, res) => {
  try {
    const startTime = Date.now();

    // تست سریع کارکرد Engine
    await unifiedStatisticsEngine.getRecentActivities(1);

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      status: "HEALTHY",
      engine: "SHERLOCK v18.0 Unified Statistics Engine",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      capabilities: [
        "Global System Statistics",
        "Representative Analytics", 
        "Financial Overview",
        "Real-time Caching",
        "Activity Tracking",
        "Financial Integrity Integration"
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: "UNHEALTHY",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
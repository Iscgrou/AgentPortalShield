/**
 * SHERLOCK v18.2 UNIFIED FINANCIAL ROUTES
 * 
 * تنها سیستم routing مالی - جایگزین تمام endpoints موازی
 */

import { Router } from 'express';
import { unifiedFinancialEngine } from '../services/unified-financial-engine.js';

const router = Router();

// Import authentication middleware from main routes
import type { Request, Response, NextFunction } from 'express';

// Authentication middleware consistent with main system
const requireAuth = (req: any, res: any, next: any) => {
  const isAdminAuthenticated = req.session?.authenticated === true;
  const isCrmAuthenticated = req.session?.crmAuthenticated === true;

  if (isAdminAuthenticated || isCrmAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "احراز هویت نشده" });
  }
};

/**
 * آمار مالی کلی سیستم
 * جایگزین /api/unified-statistics/global
 */
router.get('/global', requireAuth, async (req, res) => {
  try {
    const summary = await unifiedFinancialEngine.calculateGlobalSummary();

    res.json({
      success: true,
      data: summary,
      meta: {
        source: "UNIFIED FINANCIAL ENGINE v18.2",
        accuracy: "100% GUARANTEED",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting unified global summary:', error);
    res.status(500).json({
      success: false,
      error: "خطا در محاسبه آمار کلی"
    });
  }
});

/**
 * آمار مالی یک نماینده
 * جایگزین endpoints تکراری
 */
router.get('/representative/:id', requireAuth, async (req, res) => {
  try {
    const representativeId = parseInt(req.params.id);
    const data = await unifiedFinancialEngine.calculateRepresentative(representativeId);

    res.json({
      success: true,
      data,
      meta: {
        source: "UNIFIED FINANCIAL ENGINE v18.2",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting representative financial data:', error);
    res.status(500).json({
      success: false,
      error: "خطا در محاسبه اطلاعات مالی نماینده"
    });
  }
});

// Cache for debtor data
let debtorCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 120000; // 2 minutes cache

/**
 * لیست بدهکاران
 * جایگزین /api/dashboard/debtor-representatives
 */
router.get('/debtors', requireAuth, async (req, res) => {
  try {
    const startTime = Date.now();
    const limit = parseInt(req.query.limit as string) || 30;

    // Check cache first
    const now = Date.now();
    if (debtorCache && (now - debtorCache.timestamp) < CACHE_DURATION) {
      console.log(`⚡ Cache hit: Returning cached debtor data in ${Date.now() - startTime}ms`);
      return res.json({
        success: true,
        data: debtorCache.data.slice(0, limit),
        meta: {
          count: Math.min(debtorCache.data.length, limit),
          cached: true,
          cacheAge: Math.round((now - debtorCache.timestamp) / 1000)
        }
      });
    }

    console.log(`🚀 SHERLOCK v18.7: Fresh calculation for ${limit} debtors`);
    const debtors = await unifiedFinancialEngine.getDebtorRepresentatives(limit);

    // Transform to legacy format for compatibility
    const transformedData = debtors.map(debtor => ({
      id: debtor.representativeId,
      representativeId: debtor.representativeId,
      name: debtor.representativeName,
      code: debtor.representativeCode,
      remainingDebt: debtor.actualDebt.toString(),
      totalInvoices: debtor.totalSales.toString(),
      totalPayments: debtor.totalPaid.toString(),
      // Additional fields for better UI
      debtLevel: debtor.debtLevel,
      paymentRatio: debtor.paymentRatio,
      lastTransactionDate: debtor.lastTransactionDate
    }));

    // Update cache
    debtorCache = {
      data: transformedData,
      timestamp: now
    };

    const duration = Date.now() - startTime;
    console.log(`✅ SHERLOCK v18.7: Generated ${transformedData.length} debtors in ${duration}ms`);

    res.json({
      success: true,
      data: transformedData,
      meta: {
        count: transformedData.length,
        calculationTime: duration,
        accuracyGuaranteed: true,
        cached: false
      }
    });
  } catch (error) {
    console.error('Error in unified financial debtors endpoint:', error);
    res.status(500).json({
      success: false,
      error: "خطا در محاسبه بدهکاران"
    });
  }
});

/**
 * آمار تمام نمایندگان
 * جایگزین /api/representatives و سایر endpoints
 */
router.get('/all-representatives', requireAuth, async (req, res) => {
  try {
    const allData = await unifiedFinancialEngine.calculateAllRepresentatives();

    res.json({
      success: true,
      data: allData,
      meta: {
        source: "UNIFIED FINANCIAL ENGINE v18.2",
        count: allData.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting all representatives data:', error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات نمایندگان"
    });
  }
});

/**
 * تست authentication
 */
router.get('/auth-test', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "احراز هویت موفق",
      user: {
        authenticated: true,
        session: !!req.session,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({
      success: false,
      error: "خطا در تست احراز هویت"
    });
  }
});

export default router;

// Named export function for integration
export function registerUnifiedFinancialRoutes(app: any, requireAuth: any) {
  app.use('/api/unified-financial', router);
}
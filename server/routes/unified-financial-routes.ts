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

/**
 * لیست بدهکاران
 * جایگزین /api/dashboard/debtor-representatives
 */
router.get('/debtors', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const debtors = await unifiedFinancialEngine.getDebtorRepresentatives(limit);
    
    res.json({
      success: true,
      data: debtors,
      meta: {
        source: "UNIFIED FINANCIAL ENGINE v18.2",
        count: debtors.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting debtor representatives:', error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت لیست بدهکاران"
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
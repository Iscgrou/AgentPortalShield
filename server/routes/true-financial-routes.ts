/**
 * SHERLOCK v18.1 TRUE FINANCIAL ROUTES
 * اندپوینت‌های محاسبه و تصحیح مالی واقعی
 */

import { Router } from 'express';
import { trueFinancialEngine } from '../services/true-financial-engine.js';

const router = Router();

/**
 * دریافت آمار مالی واقعی سیستم
 */
router.get('/global-summary', async (req, res) => {
  try {
    const summary = await trueFinancialEngine.calculateGlobalTrueSummary();
    
    res.json({
      success: true,
      data: summary,
      meta: {
        source: "TRUE FINANCIAL ENGINE v18.1",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting global true summary:', error);
    res.status(500).json({
      success: false,
      error: "خطا در محاسبه آمار مالی واقعی"
    });
  }
});

/**
 * محاسبه snapshot واقعی برای نماینده
 */
router.get('/representative/:id', async (req, res) => {
  try {
    const representativeId = parseInt(req.params.id);
    const snapshot = await trueFinancialEngine.calculateTrueSnapshot(representativeId);
    
    res.json({
      success: true,
      data: snapshot,
      meta: {
        source: "TRUE FINANCIAL ENGINE v18.1",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting representative true snapshot:', error);
    res.status(500).json({
      success: false,
      error: "خطا در محاسبه snapshot واقعی نماینده"
    });
  }
});

/**
 * تصحیح فوری فیلدهای stored
 */
router.post('/correct-stored-values', async (req, res) => {
  try {
    const result = await trueFinancialEngine.correctStoredValues();
    
    res.json({
      success: true,
      message: `${result.correctedCount} نماینده تصحیح شد`,
      data: {
        correctedCount: result.correctedCount,
        totalDiscrepancy: result.totalDiscrepancy,
        details: result.details.slice(0, 10) // نمایش ۱۰ مورد اول
      },
      meta: {
        source: "TRUE FINANCIAL ENGINE v18.1",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error correcting stored values:', error);
    res.status(500).json({
      success: false,
      error: "خطا در تصحیح فیلدهای ذخیره شده"
    });
  }
});

export default router;
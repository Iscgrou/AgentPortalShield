
/**
 * DATABASE OPTIMIZATION ROUTES
 * For performance monitoring and optimization
 */

import { Router } from 'express';
import { dbOptimizer } from '../db-optimization.js';

const router = Router();

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  const isAdminAuthenticated = req.session?.authenticated === true;
  
  if (isAdminAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "فقط ادمین مجاز است" });
  }
};

/**
 * Create optimal database indexes
 */
router.post('/create-indexes', requireAuth, async (req, res) => {
  try {
    console.log('🔧 Admin requested database index creation');
    
    const success = await dbOptimizer.createOptimalIndexes();
    
    if (success) {
      res.json({
        success: true,
        message: 'ایندکس‌های بهینه با موفقیت ایجاد شدند',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'خطا در ایجاد ایندکس‌ها'
      });
    }
  } catch (error) {
    console.error('Error creating indexes:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در بهینه‌سازی پایگاه داده'
    });
  }
});

/**
 * Analyze database performance
 */
router.get('/performance-analysis', requireAuth, async (req, res) => {
  try {
    const analysis = await dbOptimizer.analyzeQueryPerformance();
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing performance:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در تحلیل عملکرد'
    });
  }
});

/**
 * Update table statistics
 */
router.post('/update-statistics', requireAuth, async (req, res) => {
  try {
    const success = await dbOptimizer.updateTableStatistics();
    
    if (success) {
      res.json({
        success: true,
        message: 'آمار جداول بروزرسانی شد',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'خطا در بروزرسانی آمار'
      });
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در بروزرسانی آمار جداول'
    });
  }
});

/**
 * Database health check
 */
router.get('/health-check', requireAuth, async (req, res) => {
  try {
    const healthInfo = await dbOptimizer.checkDatabaseHealth();
    
    res.json({
      success: true,
      data: healthInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking database health:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در بررسی سلامت پایگاه داده'
    });
  }
});

export default router;

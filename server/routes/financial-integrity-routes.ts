/**
 * SHERLOCK v17.8 - FINANCIAL INTEGRITY ROUTES
 * API endpoints برای مدیریت یکپارچگی مالی سیستم
 */

import { Router } from "express";
import { financialIntegrityEngine } from "../services/financial-integrity-engine";

const router = Router();

// Authentication middleware (same as main routes)
function requireAuth(req: any, res: any, next: any) {
  if ((req.session as any)?.authenticated || (req.session as any)?.crmAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "احراز هویت نشده" });
  }
}

/**
 * دریافت snapshot مالی یک نماینده
 * GET /api/financial-integrity/representative/:id/snapshot
 */
router.get("/representative/:id/snapshot", requireAuth, async (req, res) => {
  try {
    const representativeId = parseInt(req.params.id);
    
    if (!representativeId || isNaN(representativeId)) {
      return res.status(400).json({ error: "شناسه نماینده معتبر نیست" });
    }
    
    const snapshot = await financialIntegrityEngine.calculateFinancialSnapshot(representativeId);
    
    res.json({
      success: true,
      data: snapshot
    });
  } catch (error: any) {
    console.error("Financial snapshot error:", error);
    res.status(500).json({
      error: "خطا در محاسبه snapshot مالی",
      details: error.message
    });
  }
});

/**
 * تطبیق مالی یک نماینده
 * POST /api/financial-integrity/representative/:id/reconcile
 */
router.post("/representative/:id/reconcile", requireAuth, async (req, res) => {
  try {
    const representativeId = parseInt(req.params.id);
    
    if (!representativeId || isNaN(representativeId)) {
      return res.status(400).json({ error: "شناسه نماینده معتبر نیست" });
    }
    
    const result = await financialIntegrityEngine.reconcileRepresentativeFinancials(representativeId);
    
    res.json({
      success: true,
      message: "تطبیق مالی با موفقیت انجام شد",
      data: result
    });
  } catch (error: any) {
    console.error("Financial reconciliation error:", error);
    res.status(500).json({
      error: "خطا در تطبیق مالی",
      details: error.message
    });
  }
});

/**
 * تحلیل نمایندگان با مشکل مالی
 * GET /api/financial-integrity/problematic-representatives
 */
router.get("/problematic-representatives", requireAuth, async (req, res) => {
  try {
    const analysis = await financialIntegrityEngine.analyzeProblematicRepresentatives();
    
    res.json({
      success: true,
      data: {
        summary: {
          excessPaymentRepsCount: analysis.excessPaymentReps.length,
          reconciliationNeededCount: analysis.reconciliationNeeded.length,
          lowIntegrityRepsCount: analysis.lowIntegrityReps.length,
          totalProblematicCount: analysis.totalProblematicCount
        },
        details: analysis
      }
    });
  } catch (error: any) {
    console.error("Problematic representatives analysis error:", error);
    res.status(500).json({
      error: "خطا در تحلیل نمایندگان مشکل‌دار",
      details: error.message
    });
  }
});

/**
 * تطبیق مالی سراسری سیستم
 * POST /api/financial-integrity/system-reconciliation
 */
router.post("/system-reconciliation", requireAuth, async (req, res) => {
  try {
    console.log("🚀 SYSTEM-WIDE FINANCIAL RECONCILIATION: Starting...");
    
    const result = await financialIntegrityEngine.executeSystemWideReconciliation();
    
    res.json({
      success: true,
      message: `تطبیق مالی سراسری با موفقیت انجام شد. ${result.totalReconciled} نماینده تطبیق یافت.`,
      data: {
        summary: {
          totalReconciled: result.totalReconciled,
          totalFixed: result.totalFixed,
          averageIntegrityScoreImprovement: result.averageIntegrityScoreImprovement,
          executionTimeMs: result.executionTimeMs,
          executionTimeFormatted: `${(result.executionTimeMs / 1000).toFixed(2)} ثانیه`
        }
      }
    });
  } catch (error: any) {
    console.error("System-wide reconciliation error:", error);
    res.status(500).json({
      error: "خطا در تطبیق مالی سراسری",
      details: error.message
    });
  }
});

/**
 * بازنشانی و تطبیق اضطراری سیستم
 * POST /api/financial-integrity/emergency-reset
 */
router.post("/emergency-reset", requireAuth, async (req, res) => {
  try {
    const { confirmReset } = req.body;
    
    if (confirmReset !== "CONFIRM_EMERGENCY_FINANCIAL_RESET") {
      return res.status(400).json({ 
        error: "برای تأیید بازنشانی اضطراری، کد تأیید را ارسال کنید" 
      });
    }
    
    console.log("🚨 EMERGENCY FINANCIAL RESET: Starting complete system reconciliation...");
    
    // اجرای تطبیق سراسری
    const reconcileResult = await financialIntegrityEngine.executeSystemWideReconciliation();
    
    // تحلیل نمایندگان مشکل‌دار پس از تطبیق
    const analysis = await financialIntegrityEngine.analyzeProblematicRepresentatives();
    
    res.json({
      success: true,
      message: "بازنشانی اضطراری سیستم مالی با موفقیت انجام شد",
      data: {
        reconciliation: reconcileResult,
        postAnalysis: {
          totalProblematicCount: analysis.totalProblematicCount,
          excessPaymentRepsCount: analysis.excessPaymentReps.length,
          reconciliationNeededCount: analysis.reconciliationNeeded.length,
          lowIntegrityRepsCount: analysis.lowIntegrityReps.length
        }
      }
    });
  } catch (error: any) {
    console.error("Emergency reset error:", error);
    res.status(500).json({
      error: "خطا در بازنشانی اضطراری",
      details: error.message
    });
  }
});

export default router;
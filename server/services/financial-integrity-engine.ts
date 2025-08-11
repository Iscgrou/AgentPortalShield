/**
 * SHERLOCK v17.8 - FINANCIAL INTEGRITY ENGINE
 * پیکربندی استاندارد محاسباتی یکپارچه برای سیستم CRM
 * 
 * BUSINESS RULES:
 * 1. مانده بدهی = مجموع فاکتورهای unpaid/overdue - مجموع پرداخت‌های allocated
 * 2. اعتبار = مجموع پرداخت‌های unallocated (پرداخت‌های بدون تخصیص)  
 * 3. کل فروش = مجموع تمام فاکتورها (شامل paid/unpaid/overdue)
 * 4. هیچ پرداختی نباید بیش از مجموع فاکتورهای یک نماینده باشد
 */

import { db } from "../db";
import { representatives, invoices, payments } from "@shared/schema";
import { sql, eq, and, or } from "drizzle-orm";

interface FinancialSnapshot {
  representativeId: number;
  representativeName: string;
  
  // فاکتورها
  totalInvoices: number;
  totalInvoiceAmount: number;
  unpaidInvoiceAmount: number;
  paidInvoiceAmount: number;
  
  // پرداخت‌ها
  totalPayments: number;
  totalPaymentAmount: number;
  allocatedPaymentAmount: number;
  unallocatedPaymentAmount: number;
  
  // محاسبات نهایی (استاندارد)
  standardDebt: number;          // unpaid invoices - allocated payments
  standardCredit: number;        // unallocated payments
  standardTotalSales: number;    // all invoices
  
  // وضعیت سلامت مالی
  hasExcessPayments: boolean;    // آیا پرداخت بیش از کل فاکتور دارد
  needsReconciliation: boolean;  // آیا نیاز به تطبیق دارد
  integrityScore: number;        // امتیاز یکپارچگی (0-100)
}

export class FinancialIntegrityEngine {
  
  /**
   * محاسبه snapshot جامع مالی برای یک نماینده
   */
  async calculateFinancialSnapshot(representativeId: number): Promise<FinancialSnapshot> {
    // اطلاعات نماینده
    const representative = await db
      .select({ id: representatives.id, name: representatives.name })
      .from(representatives)
      .where(eq(representatives.id, representativeId));
    
    if (!representative.length) {
      throw new Error(`Representative with ID ${representativeId} not found`);
    }
    
    // محاسبه فاکتورها
    const invoiceStats = await db
      .select({
        totalCount: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
        unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
      })
      .from(invoices)
      .where(eq(invoices.representativeId, representativeId));
    
    // محاسبه پرداخت‌ها
    const paymentStats = await db
      .select({
        totalCount: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
        allocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = true THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
        unallocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = false OR is_allocated IS NULL THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
      })
      .from(payments)
      .where(eq(payments.representativeId, representativeId));
    
    const invoiceData = invoiceStats[0] || { totalCount: 0, totalAmount: 0, unpaidAmount: 0, paidAmount: 0 };
    const paymentData = paymentStats[0] || { totalCount: 0, totalAmount: 0, allocatedAmount: 0, unallocatedAmount: 0 };
    
    // محاسبات استاندارد
    const standardDebt = Math.max(0, invoiceData.unpaidAmount - paymentData.allocatedAmount);
    const standardCredit = paymentData.unallocatedAmount;
    const standardTotalSales = invoiceData.totalAmount;
    
    // بررسی سلامت مالی
    const hasExcessPayments = paymentData.totalAmount > invoiceData.totalAmount;
    const needsReconciliation = hasExcessPayments || 
                               (invoiceData.unpaidAmount < paymentData.allocatedAmount);
    
    // محاسبه امتیاز یکپارچگی
    let integrityScore = 100;
    if (hasExcessPayments) integrityScore -= 50;
    if (needsReconciliation) integrityScore -= 25;
    if (paymentData.unallocatedAmount > invoiceData.totalAmount * 0.5) integrityScore -= 15;
    
    const snapshot: FinancialSnapshot = {
      representativeId,
      representativeName: representative[0].name,
      
      // فاکتورها
      totalInvoices: invoiceData.totalCount,
      totalInvoiceAmount: invoiceData.totalAmount,
      unpaidInvoiceAmount: invoiceData.unpaidAmount,
      paidInvoiceAmount: invoiceData.paidAmount,
      
      // پرداخت‌ها
      totalPayments: paymentData.totalCount,
      totalPaymentAmount: paymentData.totalAmount,
      allocatedPaymentAmount: paymentData.allocatedAmount,
      unallocatedPaymentAmount: paymentData.unallocatedAmount,
      
      // محاسبات نهایی
      standardDebt,
      standardCredit,
      standardTotalSales,
      
      // وضعیت سلامت
      hasExcessPayments,
      needsReconciliation,
      integrityScore: Math.max(0, integrityScore)
    };
    
    return snapshot;
  }
  
  /**
   * تطبیق و آپدیت مالی استاندارد برای یک نماینده
   */
  async reconcileRepresentativeFinancials(representativeId: number): Promise<{
    success: boolean;
    snapshot: FinancialSnapshot;
    changes: {
      previousDebt: string;
      newDebt: string;
      previousCredit: string;
      newCredit: string;
      previousTotalSales: string;
      newTotalSales: string;
    };
  }> {
    // دریافت وضعیت فعلی
    const currentRep = await db
      .select()
      .from(representatives)
      .where(eq(representatives.id, representativeId));
    
    if (!currentRep.length) {
      throw new Error(`Representative ${representativeId} not found`);
    }
    
    const previousDebt = currentRep[0].totalDebt || "0";
    const previousCredit = currentRep[0].credit || "0";
    const previousTotalSales = currentRep[0].totalSales || "0";
    
    // محاسبه snapshot جدید
    const snapshot = await this.calculateFinancialSnapshot(representativeId);
    
    // آپدیت جدول نمایندگان بر اساس استاندارد
    await db
      .update(representatives)
      .set({
        totalDebt: snapshot.standardDebt.toString(),
        credit: snapshot.standardCredit.toString(),
        totalSales: snapshot.standardTotalSales.toString(),
        updatedAt: new Date()
      })
      .where(eq(representatives.id, representativeId));
    
    const changes = {
      previousDebt,
      newDebt: snapshot.standardDebt.toString(),
      previousCredit,
      newCredit: snapshot.standardCredit.toString(),
      previousTotalSales,
      newTotalSales: snapshot.standardTotalSales.toString()
    };
    
    console.log(`💎 FINANCIAL INTEGRITY: Reconciled representative ${representativeId}`, {
      snapshot: {
        debt: snapshot.standardDebt,
        credit: snapshot.standardCredit,
        sales: snapshot.standardTotalSales,
        integrityScore: snapshot.integrityScore
      },
      changes
    });
    
    return {
      success: true,
      snapshot,
      changes
    };
  }
  
  /**
   * تحلیل نمایندگانی که مشکل مالی دارند
   */
  async analyzeProblematicRepresentatives(): Promise<{
    excessPaymentReps: FinancialSnapshot[];
    reconciliationNeeded: FinancialSnapshot[];
    lowIntegrityReps: FinancialSnapshot[];
    totalProblematicCount: number;
  }> {
    // گرفتن همه نمایندگان فعال
    const activeReps = await db
      .select({ id: representatives.id })
      .from(representatives)
      .where(eq(representatives.isActive, true));
    
    const excessPaymentReps: FinancialSnapshot[] = [];
    const reconciliationNeeded: FinancialSnapshot[] = [];
    const lowIntegrityReps: FinancialSnapshot[] = [];
    
    for (const rep of activeReps) {
      try {
        const snapshot = await this.calculateFinancialSnapshot(rep.id);
        
        if (snapshot.hasExcessPayments) {
          excessPaymentReps.push(snapshot);
        }
        
        if (snapshot.needsReconciliation) {
          reconciliationNeeded.push(snapshot);
        }
        
        if (snapshot.integrityScore < 70) {
          lowIntegrityReps.push(snapshot);
        }
      } catch (error) {
        console.error(`Error analyzing representative ${rep.id}:`, error);
      }
    }
    
    return {
      excessPaymentReps,
      reconciliationNeeded,
      lowIntegrityReps,
      totalProblematicCount: new Set([
        ...excessPaymentReps.map(r => r.representativeId),
        ...reconciliationNeeded.map(r => r.representativeId),
        ...lowIntegrityReps.map(r => r.representativeId)
      ]).size
    };
  }
  
  /**
   * تطبیق مالی جامع برای همه نمایندگان
   */
  async executeSystemWideReconciliation(): Promise<{
    totalReconciled: number;
    totalFixed: number;
    averageIntegrityScoreImprovement: number;
    executionTimeMs: number;
  }> {
    const startTime = Date.now();
    const allReps = await db
      .select({ id: representatives.id })
      .from(representatives)
      .where(eq(representatives.isActive, true));
    
    let totalReconciled = 0;
    let totalFixed = 0;
    let totalIntegrityImprovement = 0;
    
    console.log(`🚀 SYSTEM-WIDE FINANCIAL RECONCILIATION: Starting for ${allReps.length} representatives`);
    
    for (const rep of allReps) {
      try {
        const beforeSnapshot = await this.calculateFinancialSnapshot(rep.id);
        const beforeScore = beforeSnapshot.integrityScore;
        
        const result = await this.reconcileRepresentativeFinancials(rep.id);
        
        if (result.success) {
          totalReconciled++;
          const afterScore = result.snapshot.integrityScore;
          
          if (afterScore > beforeScore) {
            totalFixed++;
            totalIntegrityImprovement += (afterScore - beforeScore);
          }
        }
      } catch (error) {
        console.error(`Error reconciling representative ${rep.id}:`, error);
      }
    }
    
    const executionTimeMs = Date.now() - startTime;
    const averageIntegrityScoreImprovement = totalFixed > 0 ? totalIntegrityImprovement / totalFixed : 0;
    
    console.log(`✅ SYSTEM-WIDE RECONCILIATION COMPLETE:`, {
      totalReconciled,
      totalFixed,
      averageIntegrityScoreImprovement: averageIntegrityScoreImprovement.toFixed(2),
      executionTimeMs
    });
    
    return {
      totalReconciled,
      totalFixed,
      averageIntegrityScoreImprovement,
      executionTimeMs
    };
  }
}

export const financialIntegrityEngine = new FinancialIntegrityEngine();
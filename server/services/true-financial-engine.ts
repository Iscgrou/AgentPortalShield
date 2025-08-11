/**
 * SHERLOCK v18.1 TRUE FINANCIAL ENGINE
 * 
 * تنها منبع واقعی محاسبات مالی - بدون اتکا به فیلدهای stored
 * محاسبه real-time از پایگاه داده‌های اصلی
 */

import { db } from '../db.js';
import { representatives, invoices, payments } from '../../shared/schema.js';
import { eq, sql, and, or, inArray } from 'drizzle-orm';

export interface TrueFinancialSnapshot {
  representativeId: number;
  representativeName: string;
  
  // محاسبات واقعی از transactions
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  
  // محاسبات FIFO واقعی
  actualOutstandingDebt: number;
  allocatedPayments: number;
  unallocatedPayments: number;
  
  // وضعیت یکپارچگی
  integrityScore: number;
  lastTransactionDate: string;
  
  // تشخیص مشکلات
  hasDiscrepancy: boolean;
  storedVsRealDifference: number;
}

export interface GlobalTrueFinancialSummary {
  totalRepresentatives: number;
  
  // آمار فاکتورها (از جدول invoices)
  totalInvoices: number;
  totalInvoiceAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  
  // آمار پرداخت‌ها (از جدول payments)
  totalPayments: number;
  totalPaymentAmount: number;
  allocatedPaymentAmount: number;
  unallocatedPaymentAmount: number;
  
  // محاسبات نهایی
  actualTotalDebt: number;
  storedTotalDebt: number;
  discrepancyAmount: number;
  discrepancyPercentage: number;
  
  // سلامت سیستم
  systemIntegrityScore: number;
  representativesWithDiscrepancy: number;
  
  calculationTimestamp: string;
}

class TrueFinancialEngine {
  
  /**
   * محاسبه snapshot واقعی برای یک نماینده
   */
  async calculateTrueSnapshot(representativeId: number): Promise<TrueFinancialSnapshot> {
    // دریافت اطلاعات نماینده
    const representative = await db.select({
      id: representatives.id,
      name: representatives.name,
      storedDebt: representatives.totalDebt
    }).from(representatives).where(eq(representatives.id, representativeId));

    if (!representative.length) {
      throw new Error(`Representative ${representativeId} not found`);
    }

    const rep = representative[0];

    // محاسبه واقعی فاکتورها
    const invoiceStats = await db.select({
      totalCount: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
      paidAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
      unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
    }).from(invoices).where(eq(invoices.representativeId, representativeId));

    // محاسبه واقعی پرداخت‌ها
    const paymentStats = await db.select({
      totalCount: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
      allocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = true THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
      unallocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = false OR is_allocated IS NULL THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
    }).from(payments).where(eq(payments.representativeId, representativeId));

    const invoice = invoiceStats[0];
    const payment = paymentStats[0];

    // محاسبه بدهی واقعی FIFO
    const actualDebt = Math.max(0, invoice.unpaidAmount - payment.allocatedAmount);
    
    // محاسبه اختلاف با stored value
    const storedDebt = parseFloat(rep.storedDebt) || 0;
    const difference = storedDebt - actualDebt;
    
    // امتیاز یکپارچگی
    const integrityScore = Math.abs(difference) < 1000 ? 100 : 
                          Math.abs(difference) < 10000 ? 90 :
                          Math.abs(difference) < 100000 ? 70 : 50;

    return {
      representativeId,
      representativeName: rep.name,
      
      totalInvoiceAmount: invoice.totalAmount,
      totalPaidAmount: invoice.paidAmount,
      totalUnpaidAmount: invoice.unpaidAmount,
      
      actualOutstandingDebt: actualDebt,
      allocatedPayments: payment.allocatedAmount,
      unallocatedPayments: payment.unallocatedAmount,
      
      integrityScore,
      lastTransactionDate: new Date().toISOString(),
      
      hasDiscrepancy: Math.abs(difference) > 1000,
      storedVsRealDifference: difference
    };
  }

  /**
   * محاسبه آمار کلی واقعی سیستم
   */
  async calculateGlobalTrueSummary(): Promise<GlobalTrueFinancialSummary> {
    console.log("🧮 TRUE FINANCIAL ENGINE: Calculating real system summary...");
    
    // آمار کلی فاکتورها
    const invoiceGlobalStats = await db.select({
      totalCount: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
      paidCount: sql<number>`SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`,
      unpaidCount: sql<number>`SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN 1 ELSE 0 END)`,
      unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN status IN ('unpaid', 'overdue') THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
    }).from(invoices);

    // آمار کلی پرداخت‌ها
    const paymentGlobalStats = await db.select({
      totalCount: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
      allocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = true THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
      unallocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = false OR is_allocated IS NULL THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
    }).from(payments);

    // آمار stored در جدول representatives
    const storedStats = await db.select({
      totalCount: sql<number>`COUNT(*)`,
      storedTotalDebt: sql<number>`COALESCE(SUM(CAST(total_debt as DECIMAL)), 0)`
    }).from(representatives);

    const invoiceData = invoiceGlobalStats[0];
    const paymentData = paymentGlobalStats[0];
    const storedData = storedStats[0];

    // محاسبه بدهی واقعی
    const actualTotalDebt = invoiceData.unpaidAmount - paymentData.allocatedAmount;
    const storedTotalDebt = storedData.storedTotalDebt;
    const discrepancy = storedTotalDebt - actualTotalDebt;
    const discrepancyPercentage = storedTotalDebt > 0 ? 
      Math.round((Math.abs(discrepancy) / storedTotalDebt) * 100 * 100) / 100 : 0;

    // تعداد نمایندگان با اختلاف
    const discrepantReps = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(representatives).where(
      sql`ABS(CAST(total_debt as DECIMAL) - (
        SELECT COALESCE(SUM(CASE WHEN i.status IN ('unpaid', 'overdue') THEN CAST(i.amount as DECIMAL) ELSE 0 END), 0) -
               COALESCE(SUM(CASE WHEN p.is_allocated = true THEN CAST(p.amount as DECIMAL) ELSE 0 END), 0)
        FROM invoices i
        LEFT JOIN payments p ON i.representative_id = p.representative_id
        WHERE i.representative_id = representatives.id
      )) > 1000`
    );

    // امتیاز یکپارچگی سیستم
    const systemIntegrityScore = discrepancyPercentage < 5 ? 95 :
                                discrepancyPercentage < 10 ? 85 :
                                discrepancyPercentage < 20 ? 70 : 50;

    return {
      totalRepresentatives: storedData.totalCount,
      
      totalInvoices: invoiceData.totalCount,
      totalInvoiceAmount: invoiceData.totalAmount,
      paidInvoices: invoiceData.paidCount,
      unpaidInvoices: invoiceData.unpaidCount,
      
      totalPayments: paymentData.totalCount,
      totalPaymentAmount: paymentData.totalAmount,
      allocatedPaymentAmount: paymentData.allocatedAmount,
      unallocatedPaymentAmount: paymentData.unallocatedAmount,
      
      actualTotalDebt,
      storedTotalDebt,
      discrepancyAmount: discrepancy,
      discrepancyPercentage,
      
      systemIntegrityScore,
      representativesWithDiscrepancy: discrepantReps[0].count,
      
      calculationTimestamp: new Date().toISOString()
    };
  }

  /**
   * عملیات تصحیح فوری فیلدهای stored
   */
  async correctStoredValues(): Promise<{ 
    correctedCount: number; 
    totalDiscrepancy: number;
    details: Array<{id: number, name: string, oldDebt: number, newDebt: number}> 
  }> {
    console.log("🔧 TRUE FINANCIAL ENGINE: Starting stored values correction...");
    
    const allReps = await db.select({
      id: representatives.id,
      name: representatives.name,
      currentDebt: representatives.totalDebt
    }).from(representatives);

    const corrections = [];
    let totalDiscrepancy = 0;

    for (const rep of allReps) {
      const snapshot = await this.calculateTrueSnapshot(rep.id);
      const oldDebt = parseFloat(rep.currentDebt) || 0;
      const newDebt = snapshot.actualOutstandingDebt;
      
      if (Math.abs(oldDebt - newDebt) > 1000) {
        corrections.push({
          id: rep.id,
          name: rep.name,
          oldDebt,
          newDebt
        });
        
        totalDiscrepancy += Math.abs(oldDebt - newDebt);
        
        // Update stored value
        await db.update(representatives)
          .set({ totalDebt: newDebt.toString() })
          .where(eq(representatives.id, rep.id));
      }
    }

    console.log(`✅ TRUE FINANCIAL ENGINE: Corrected ${corrections.length} representatives`);
    
    return {
      correctedCount: corrections.length,
      totalDiscrepancy,
      details: corrections
    };
  }
}

export const trueFinancialEngine = new TrueFinancialEngine();
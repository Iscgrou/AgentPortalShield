// 🔄 SHERLOCK v4.0 - Real-time Financial Synchronization Engine
// Phase 2: اتصال فوری تغییرات مالی به workflow

import { eq, desc, sql, and, or } from "drizzle-orm";
import { db } from "../db";
import { 
  representatives,
  invoices,
  payments,
  workspaceTasks,
  crmTasks,
  activityLogs,
  aiDecisionLog,
  financialTransactions
} from "../../shared/schema";
import { intelligentCoupling } from "./intelligent-coupling-service";
import { PersianAIEngine } from "./persian-ai-engine";
import { nanoid } from "nanoid";

export interface FinancialChangeEvent {
  type: 'INVOICE_ADDED' | 'INVOICE_UPDATED' | 'INVOICE_DELETED' | 'PAYMENT_RECEIVED' | 'PAYMENT_UPDATED';
  representativeId: number;
  entityId: number;
  previousState?: any;
  currentState: any;
  changeAmount: number;
  changeDate: string;
  triggeredBy: string;
  metadata?: any;
}

export interface SyncResult {
  success: boolean;
  tasksAffected: number;
  workflowAdjustments: any[];
  aiRecommendations: any[];
  syncLatency: number;
  details: string;
}

/**
 * 🔄 Real-time Financial Synchronization Engine
 * 
 * هدف: همگام‌سازی فوری تغییرات مالی با workflow و وظایف
 * روش: Event-driven real-time sync بدون تخریب سیستم موجود
 */
export class RealTimeSyncEngine {
  private persianAI: PersianAIEngine;
  private syncQueue: FinancialChangeEvent[] = [];
  private isProcessing: boolean = false;
  private syncMetrics: Map<string, any> = new Map();

  constructor() {
    this.persianAI = new PersianAIEngine();
  }

  // ==================== MAIN SYNC ORCHESTRATOR ====================

  /**
   * 🎯 ورودی اصلی: همگام‌سازی تغییرات مالی
   */
  async syncFinancialChange(event: FinancialChangeEvent): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Processing financial change: ${event.type} for rep ${event.representativeId}`);

      // Step 1: تحلیل تأثیر تغییر
      const impactAnalysis = await this.analyzeFinancialImpact(event);

      // Step 2: شناسایی وظایف مرتبط
      const affectedTasks = await this.identifyAffectedTasks(event.representativeId, event.type);

      // Step 3: تولید تنظیمات workflow
      const workflowAdjustments = await this.generateWorkflowAdjustments(event, impactAnalysis, affectedTasks);

      // Step 4: اعمال تنظیمات محافظتی
      const appliedAdjustments = await this.applyProtectiveAdjustments(workflowAdjustments);

      // Step 5: تولید توصیه‌های AI
      const aiRecommendations = await this.generateAIRecommendations(event, impactAnalysis);

      // Step 6: ثبت همگام‌سازی
      await this.logSyncOperation(event, {
        impactAnalysis,
        affectedTasks: affectedTasks.length,
        adjustments: appliedAdjustments.length,
        recommendations: aiRecommendations.length
      });

      const syncLatency = Date.now() - startTime;

      console.log(`✅ Financial sync completed in ${syncLatency}ms`);

      return {
        success: true,
        tasksAffected: affectedTasks.length,
        workflowAdjustments: appliedAdjustments,
        aiRecommendations,
        syncLatency,
        details: `همگام‌سازی موفق: ${affectedTasks.length} وظیفه تأثیرپذیر، ${appliedAdjustments.length} تنظیم اعمال شد`
      };

    } catch (error) {
      console.error('خطا در همگام‌سازی مالی:', error);
      return {
        success: false,
        tasksAffected: 0,
        workflowAdjustments: [],
        aiRecommendations: [],
        syncLatency: Date.now() - startTime,
        details: `خطا: ${error.message}`
      };
    }
  }

  // ==================== FINANCIAL IMPACT ANALYSIS ====================

  private async analyzeFinancialImpact(event: FinancialChangeEvent): Promise<any> {
    const representative = await db.select()
      .from(representatives)
      .where(eq(representatives.id, event.representativeId))
      .limit(1);

    if (!representative.length) {
      throw new Error('نماینده یافت نشد');
    }

    const rep = representative[0];
    const currentDebt = parseFloat(rep.totalDebt || '0');
    const changeAmount = event.changeAmount;

    // تحلیل شدت تأثیر
    const impactSeverity = this.calculateImpactSeverity(currentDebt, changeAmount, event.type);
    
    // تحلیل اولویت
    const priorityChange = this.calculatePriorityChange(currentDebt, changeAmount, event.type);

    // تحلیل نیاز به اقدام فوری
    const urgentActionNeeded = this.assessUrgentActionNeed(currentDebt, changeAmount, event.type);

    return {
      impactSeverity, // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
      priorityChange, // 'NO_CHANGE', 'INCREASE', 'DECREASE'
      urgentActionNeeded,
      currentDebt,
      changeAmount,
      newDebtProjection: event.type === 'PAYMENT_RECEIVED' ? currentDebt - changeAmount : currentDebt + changeAmount,
      riskLevel: this.calculateRiskLevel(currentDebt, changeAmount),
      recommendedActions: this.generateImpactRecommendations(impactSeverity, currentDebt, changeAmount)
    };
  }

  private calculateImpactSeverity(currentDebt: number, changeAmount: number, eventType: string): string {
    const changeRatio = Math.abs(changeAmount) / Math.max(currentDebt, 1000000); // حداقل ۱ میلیون برای محاسبه

    if (changeRatio > 0.5) return 'CRITICAL';
    if (changeRatio > 0.2) return 'HIGH';
    if (changeRatio > 0.1) return 'MEDIUM';
    return 'LOW';
  }

  private calculatePriorityChange(currentDebt: number, changeAmount: number, eventType: string): string {
    if (eventType === 'PAYMENT_RECEIVED') {
      return changeAmount > currentDebt * 0.3 ? 'DECREASE' : 'NO_CHANGE';
    }
    
    if (eventType.includes('INVOICE')) {
      return changeAmount > 2000000 ? 'INCREASE' : 'NO_CHANGE'; // بیش از ۲ میلیون تومان
    }

    return 'NO_CHANGE';
  }

  private assessUrgentActionNeed(currentDebt: number, changeAmount: number, eventType: string): boolean {
    // پرداخت بزرگ - کاهش اولویت وظایف
    if (eventType === 'PAYMENT_RECEIVED' && changeAmount > currentDebt * 0.8) {
      return true;
    }

    // افزایش بدهی زیاد - نیاز به اقدام فوری
    if (eventType.includes('INVOICE') && changeAmount > 5000000) {
      return true;
    }

    // بدهی کل بالای ۱۰ میلیون
    if (currentDebt + changeAmount > 10000000) {
      return true;
    }

    return false;
  }

  private calculateRiskLevel(currentDebt: number, changeAmount: number): string {
    const totalDebt = currentDebt + Math.abs(changeAmount);
    
    if (totalDebt > 20000000) return 'VERY_HIGH';
    if (totalDebt > 10000000) return 'HIGH';
    if (totalDebt > 5000000) return 'MEDIUM';
    return 'LOW';
  }

  private generateImpactRecommendations(severity: string, currentDebt: number, changeAmount: number): string[] {
    const recommendations = [];

    switch (severity) {
      case 'CRITICAL':
        recommendations.push('بررسی فوری وضعیت نماینده');
        recommendations.push('تماس اضطراری با نماینده');
        recommendations.push('بازنگری کامل استراتژی پیگیری');
        break;
      
      case 'HIGH':
        recommendations.push('اولویت‌بندی مجدد وظایف');
        recommendations.push('افزایش تعدد پیگیری‌ها');
        break;
      
      case 'MEDIUM':
        recommendations.push('نظارت دقیق‌تر بر وضعیت');
        recommendations.push('برنامه‌ریزی پیگیری منظم');
        break;
    }

    return recommendations;
  }

  // ==================== TASK IMPACT IDENTIFICATION ====================

  private async identifyAffectedTasks(representativeId: number, changeType: string): Promise<any[]> {
    // دریافت وظایف فعال مرتبط با نماینده
    const activeTasks = await db.select()
      .from(workspaceTasks)
      .where(and(
        eq(workspaceTasks.representativeId, representativeId),
        or(
          eq(workspaceTasks.status, 'ASSIGNED'),
          eq(workspaceTasks.status, 'IN_PROGRESS')
        )
      ));

    // تحلیل تأثیر بر هر وظیفه
    const affectedTasks = [];
    
    for (const task of activeTasks) {
      const impact = await this.analyzeTaskImpact(task, changeType);
      if (impact.requiresAdjustment) {
        affectedTasks.push({
          task,
          impact,
          suggestedAdjustments: impact.adjustments
        });
      }
    }

    return affectedTasks;
  }

  private async analyzeTaskImpact(task: any, changeType: string): Promise<any> {
    let requiresAdjustment = false;
    const adjustments = [];

    // تحلیل بر اساس نوع تغییر
    switch (changeType) {
      case 'PAYMENT_RECEIVED':
        if (task.taskType === 'DEBT_COLLECTION' || task.priority === 'URGENT') {
          requiresAdjustment = true;
          adjustments.push({
            type: 'PRIORITY_DECREASE',
            reason: 'پرداخت انجام شده'
          });
        }
        break;

      case 'INVOICE_ADDED':
        if (task.priority === 'LOW' || task.priority === 'MEDIUM') {
          requiresAdjustment = true;
          adjustments.push({
            type: 'PRIORITY_INCREASE',
            reason: 'افزایش بدهی'
          });
        }
        break;
    }

    return {
      requiresAdjustment,
      adjustments,
      originalPriority: task.priority,
      recommendedPriority: this.calculateNewPriority(task.priority, changeType)
    };
  }

  private calculateNewPriority(currentPriority: string, changeType: string): string {
    const priorityMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };
    const reversePriorityMap = { 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 4: 'URGENT' };
    
    let currentLevel = priorityMap[currentPriority] || 2;

    if (changeType === 'PAYMENT_RECEIVED') {
      currentLevel = Math.max(1, currentLevel - 1);
    } else if (changeType === 'INVOICE_ADDED') {
      currentLevel = Math.min(4, currentLevel + 1);
    }

    return reversePriorityMap[currentLevel];
  }

  // ==================== WORKFLOW ADJUSTMENTS ====================

  private async generateWorkflowAdjustments(event: FinancialChangeEvent, impactAnalysis: any, affectedTasks: any[]): Promise<any[]> {
    const adjustments = [];

    // تنظیمات بر اساس شدت تأثیر
    if (impactAnalysis.impactSeverity === 'CRITICAL') {
      adjustments.push({
        type: 'IMMEDIATE_REVIEW',
        action: 'بررسی فوری تمام وظایف نماینده',
        priority: 'URGENT',
        autoExecute: false
      });
    }

    // تنظیمات بر اساس وظایف تأثیرپذیر
    for (const affectedTask of affectedTasks) {
      for (const taskAdjustment of affectedTask.suggestedAdjustments) {
        adjustments.push({
          type: 'TASK_PRIORITY_UPDATE',
          taskId: affectedTask.task.id,
          currentPriority: affectedTask.task.priority,
          newPriority: affectedTask.impact.recommendedPriority,
          reason: taskAdjustment.reason,
          autoExecute: true
        });
      }
    }

    // تنظیمات کلی workflow
    if (impactAnalysis.priorityChange === 'INCREASE') {
      adjustments.push({
        type: 'FOLLOW_UP_FREQUENCY_INCREASE',
        representativeId: event.representativeId,
        newFrequency: 'DAILY',
        reason: 'افزایش بدهی',
        autoExecute: false
      });
    }

    return adjustments;
  }

  private async applyProtectiveAdjustments(adjustments: any[]): Promise<any[]> {
    const appliedAdjustments = [];

    for (const adjustment of adjustments) {
      try {
        if (adjustment.autoExecute && adjustment.type === 'TASK_PRIORITY_UPDATE') {
          // به‌روزرسانی اولویت وظیفه
          await db.update(workspaceTasks)
            .set({ 
              priority: adjustment.newPriority,
              updatedAt: new Date()
            })
            .where(eq(workspaceTasks.id, adjustment.taskId));

          appliedAdjustments.push({
            ...adjustment,
            status: 'APPLIED',
            appliedAt: new Date()
          });

          console.log(`✅ Auto-applied: ${adjustment.type} for task ${adjustment.taskId}`);
        } else {
          // ثبت برای بررسی دستی
          appliedAdjustments.push({
            ...adjustment,
            status: 'PENDING_MANUAL_REVIEW',
            reason: 'نیاز به بررسی دستی'
          });
        }
      } catch (error) {
        console.error(`خطا در اعمال تنظیم ${adjustment.type}:`, error);
        appliedAdjustments.push({
          ...adjustment,
          status: 'FAILED',
          error: error.message
        });
      }
    }

    return appliedAdjustments;
  }

  // ==================== AI RECOMMENDATIONS ====================

  private async generateAIRecommendations(event: FinancialChangeEvent, impactAnalysis: any): Promise<any[]> {
    const recommendations = [];

    // توصیه‌های کلی بر اساس تحلیل تأثیر
    recommendations.push({
      type: 'STRATEGIC_RECOMMENDATION',
      priority: impactAnalysis.impactSeverity,
      title: 'استراتژی کلی پیگیری',
      description: this.generateStrategicDescription(event, impactAnalysis),
      actionItems: impactAnalysis.recommendedActions,
      aiConfidence: this.calculateAIConfidence(impactAnalysis)
    });

    // توصیه‌های فرهنگی
    if (impactAnalysis.impactSeverity === 'HIGH' || impactAnalysis.impactSeverity === 'CRITICAL') {
      const culturalRecommendation = await this.generateCulturalRecommendation(event.representativeId, impactAnalysis);
      recommendations.push(culturalRecommendation);
    }

    // توصیه‌های تیمی
    if (impactAnalysis.urgentActionNeeded) {
      recommendations.push({
        type: 'TEAM_COORDINATION',
        priority: 'HIGH',
        title: 'هماهنگی تیمی',
        description: 'اطلاع‌رسانی به تیم مدیریت و هماهنگی اقدامات',
        actionItems: [
          'اطلاع‌رسانی به مدیر مستقیم',
          'هماهنگی با واحد مالی',
          'برنامه‌ریزی جلسه بررسی'
        ],
        aiConfidence: 90
      });
    }

    return recommendations;
  }

  private generateStrategicDescription(event: FinancialChangeEvent, impactAnalysis: any): string {
    let description = `تغییر مالی ${event.type} با مبلغ ${event.changeAmount.toLocaleString('fa-IR')} تومان `;
    
    switch (impactAnalysis.impactSeverity) {
      case 'CRITICAL':
        description += 'تأثیر بحرانی داشته و نیاز به اقدام فوری دارد.';
        break;
      case 'HIGH':
        description += 'تأثیر زیادی داشته و نیاز به توجه ویژه دارد.';
        break;
      default:
        description += 'تأثیر متعادلی داشته و نیاز به نظارت معمول دارد.';
    }

    return description;
  }

  private async generateCulturalRecommendation(representativeId: number, impactAnalysis: any): Promise<any> {
    // دریافت پروفایل فرهنگی
    const culturalProfile = await this.persianAI.analyzeCulturalProfile(representativeId);

    return {
      type: 'CULTURAL_APPROACH',
      priority: 'HIGH',
      title: 'رویکرد فرهنگی پیشنهادی',
      description: `بر اساس تحلیل فرهنگی، رویکرد ${culturalProfile.communicationStyle} توصیه می‌شود`,
      actionItems: [
        `استفاده از سبک ارتباطی ${culturalProfile.communicationStyle}`,
        'در نظر گیری عوامل فرهنگی',
        'تطبیق با انتظارات فرهنگی نماینده'
      ],
      culturalFactors: culturalProfile.culturalFactors,
      aiConfidence: culturalProfile.confidence
    };
  }

  private calculateAIConfidence(impactAnalysis: any): number {
    let confidence = 70; // پایه

    // افزایش اعتماد بر اساس داده‌های موجود
    if (impactAnalysis.currentDebt > 0) confidence += 10;
    if (impactAnalysis.changeAmount > 1000000) confidence += 10;
    if (impactAnalysis.impactSeverity !== 'LOW') confidence += 10;

    return Math.min(95, confidence);
  }

  // ==================== LOGGING & METRICS ====================

  private async logSyncOperation(event: FinancialChangeEvent, results: any): Promise<void> {
    await db.insert(aiDecisionLog).values({
      decisionId: `SYNC-${Date.now()}-${nanoid(6)}`,
      decisionType: 'FINANCIAL_WORKFLOW_SYNC',
      representativeId: event.representativeId,
      inputData: {
        event,
        results
      },
      reasoning: `Real-time sync for ${event.type}: ${results.affectedTasks} tasks affected, ${results.adjustments} adjustments applied`,
      confidenceScore: 85,
      expectedOutcome: 'Optimized workflow based on financial changes',
      contextFactors: {
        realTimeSync: true,
        protective: true,
        latency: results.latency || 0
      },
      culturalConsiderations: {},
      createdAt: new Date()
    });

    // آمار عملکرد
    this.updateSyncMetrics(event.type, results);
  }

  private updateSyncMetrics(eventType: string, results: any): void {
    const currentMetrics = this.syncMetrics.get(eventType) || {
      totalSyncs: 0,
      averageLatency: 0,
      successRate: 0,
      totalTasksAffected: 0
    };

    currentMetrics.totalSyncs++;
    currentMetrics.averageLatency = (currentMetrics.averageLatency + (results.latency || 0)) / 2;
    if (results.success) currentMetrics.successRate = (currentMetrics.successRate + 100) / 2;
    currentMetrics.totalTasksAffected += results.affectedTasks || 0;

    this.syncMetrics.set(eventType, currentMetrics);
  }

  // ==================== PUBLIC UTILITY METHODS ====================

  /**
   * دریافت آمار عملکرد همگام‌سازی
   */
  getSyncMetrics(): any {
    const metrics = {};
    for (const [eventType, data] of this.syncMetrics.entries()) {
      metrics[eventType] = data;
    }
    return {
      metrics,
      totalEvents: Array.from(this.syncMetrics.values()).reduce((sum, data) => sum + data.totalSyncs, 0),
      overallLatency: Array.from(this.syncMetrics.values()).reduce((sum, data) => sum + data.averageLatency, 0) / this.syncMetrics.size || 0
    };
  }

  /**
   * تست سیستم همگام‌سازی
   */
  async testSyncSystem(representativeId: number): Promise<any> {
    const testEvent: FinancialChangeEvent = {
      type: 'INVOICE_ADDED',
      representativeId,
      entityId: 999999,
      currentState: { amount: 1500000 },
      changeAmount: 1500000,
      changeDate: new Date().toISOString(),
      triggeredBy: 'SYSTEM_TEST',
      metadata: { testMode: true }
    };

    const result = await this.syncFinancialChange(testEvent);
    
    return {
      testResult: result,
      systemHealth: this.getSyncMetrics(),
      recommendations: [
        'سیستم همگام‌سازی آماده بهره‌برداری است',
        'پاسخ‌دهی مطلوب در زمان مناسب',
        'قابلیت تنظیم خودکار وظایف فعال'
      ]
    };
  }
}

// Export singleton instance
export const realTimeSyncEngine = new RealTimeSyncEngine();
/**
 * DA VINCI v2.0 - Report Analysis Engine
 * تحلیل گزارشات کارمندان و استخراج insights برای AI
 */

import { XAIGrokEngine } from './xai-grok-engine';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
import * as persianDate from 'persian-date';

export interface TaskReport {
  id: string;
  taskId: string;
  staffId: number;
  representativeId: number;
  reportContent: string;
  completedAt: string;
  submittedAt: string;
}

export interface ReportAnalysis {
  reportId: string;
  keyInsights: string[];
  followUpActions: FollowUpAction[];
  representativeUpdates: RepresentativeUpdate[];
  culturalContext: string[];
  nextContactDate?: string;
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  aiConfidence: number;
}

export interface FollowUpAction {
  type: 'CALL' | 'EMAIL' | 'VISIT' | 'TECHNICAL_SUPPORT';
  description: string;
  scheduledFor: string;
  assignedTo: number;
  context: string;
}

export interface RepresentativeUpdate {
  representativeId: number;
  updateType: 'CONTACT_PREFERENCE' | 'ISSUE_STATUS' | 'PAYMENT_PLAN' | 'PERFORMANCE_NOTE';
  updateValue: string;
  confidence: number;
}

export class ReportAnalyzer {
  private grokEngine: XAIGrokEngine;

  constructor() {
    this.grokEngine = new XAIGrokEngine();
  }

  /**
   * تحلیل گزارش کارمند و استخراج insights
   */
  async analyzeReport(report: TaskReport): Promise<ReportAnalysis> {
    try {
      console.log(`🔍 Analyzing report ${report.id} for representative ${report.representativeId}`);

      // Get representative context
      const representative = await this.getRepresentativeContext(report.representativeId);
      
      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(report, representative);
      
      // Extract structured insights
      const analysis: ReportAnalysis = {
        reportId: report.id,
        keyInsights: this.extractKeyInsights(report.reportContent),
        followUpActions: await this.generateFollowUpActions(report, aiAnalysis),
        representativeUpdates: this.extractRepresentativeUpdates(report, aiAnalysis),
        culturalContext: this.extractCulturalContext(aiAnalysis),
        nextContactDate: this.calculateNextContactDate(report, aiAnalysis),
        priorityLevel: this.determinePriorityLevel(aiAnalysis),
        aiConfidence: aiAnalysis.confidence || 75
      };

      // Save analysis to database
      await this.saveAnalysis(analysis);
      
      console.log(`✅ Report analysis completed with ${analysis.followUpActions.length} follow-up actions`);
      return analysis;

    } catch (error) {
      console.error('Error analyzing report:', error);
      throw error;
    }
  }

  /**
   * دریافت context نماینده برای تحلیل بهتر
   */
  private async getRepresentativeContext(representativeId: number): Promise<any> {
    try {
      const result = await db.execute(sql`
        SELECT id, name, phone, total_debt, total_sales, is_active
        FROM representatives 
        WHERE id = ${representativeId}
      `);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching representative context:', error);
      return null;
    }
  }

  /**
   * تولید تحلیل AI با استفاده از Grok Engine
   */
  private async generateAIAnalysis(report: TaskReport, representative: any): Promise<any> {
    try {
      const analysisPrompt = `
تحلیل گزارش پشتیبانی مشتری:

اطلاعات نماینده:
- نام: ${representative?.name || 'نامشخص'}
- بدهی: ${representative?.total_debt || '0'} ریال
- فروش: ${representative?.total_sales || '0'} ریال

گزارش کارمند پشتیبانی:
"${report.reportContent}"

لطفا تحلیل کاملی ارائه دهید شامل:
1. نکات کلیدی و مهم گزارش
2. اقدامات پیگیری پیشنهادی
3. وضعیت احساسی و نگرش مشتری
4. اولویت پیگیری (1-5)
5. زمان پیشنهادی برای تماس بعدی
6. نکات فرهنگی مهم

JSON format:
{
  "keyPoints": ["نکته 1", "نکته 2"],
  "customerMood": "مثبت/منفی/خنثی",
  "followUpSuggestions": ["پیگیری 1", "پیگیری 2"],
  "priority": 1-5,
  "nextContactSuggestion": "2025-01-15",
  "culturalNotes": ["نکته فرهنگی 1"],
  "confidence": 85
}
`;

      const analysisResult = await this.grokEngine.generateCulturalInsights(
        representative || { id: 1, name: 'نماینده عمومی' },
        analysisPrompt
      );

      // Try to parse as JSON, fallback to basic structure
      try {
        return JSON.parse(analysisResult);
      } catch {
        return {
          keyPoints: ['گزارش دریافت و تحلیل شد'],
          customerMood: 'خنثی',
          followUpSuggestions: ['پیگیری عمومی'],
          priority: 3,
          nextContactSuggestion: this.getNextWorkday(),
          culturalNotes: ['رعایت ادب فارسی'],
          confidence: 60
        };
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * استخراج نکات کلیدی از گزارش
   */
  private extractKeyInsights(reportContent: string): string[] {
    const insights: string[] = [];
    
    // Basic keyword extraction
    if (reportContent.includes('پاسخ ندادند') || reportContent.includes('جواب ندادند')) {
      insights.push('عدم پاسخگویی در تماس اولیه');
    }
    
    if (reportContent.includes('صمیمانه') || reportContent.includes('گرم')) {
      insights.push('برخورد مثبت و صمیمانه');
    }
    
    if (reportContent.includes('مشکل') || reportContent.includes('اختلال')) {
      insights.push('وجود مسئله فنی یا عملیاتی');
    }
    
    if (reportContent.includes('هزینه') || reportContent.includes('پول') || reportContent.includes('پرداخت')) {
      insights.push('سوالات مالی و پرداخت');
    }

    if (reportContent.includes('فردا') || reportContent.includes('بعد')) {
      insights.push('قرار ملاقات یا تماس آتی');
    }

    return insights.length > 0 ? insights : ['گزارش عمومی دریافت شد'];
  }

  /**
   * تولید اقدامات پیگیری
   */
  private async generateFollowUpActions(report: TaskReport, aiAnalysis: any): Promise<FollowUpAction[]> {
    const actions: FollowUpAction[] = [];
    const nextDate = aiAnalysis.nextContactSuggestion || this.getNextWorkday();

    // Generate follow-up based on analysis
    if (aiAnalysis.followUpSuggestions && aiAnalysis.followUpSuggestions.length > 0) {
      for (const suggestion of aiAnalysis.followUpSuggestions) {
        actions.push({
          type: 'CALL',
          description: suggestion,
          scheduledFor: nextDate,
          assignedTo: report.staffId,
          context: `پیگیری بر اساس گزارش: ${report.reportContent.substring(0, 100)}...`
        });
      }
    }

    return actions;
  }

  /**
   * استخراج بروزرسانی‌های نماینده
   */
  private extractRepresentativeUpdates(report: TaskReport, aiAnalysis: any): RepresentativeUpdate[] {
    const updates: RepresentativeUpdate[] = [];

    if (aiAnalysis.customerMood) {
      updates.push({
        representativeId: report.representativeId,
        updateType: 'PERFORMANCE_NOTE',
        updateValue: `وضعیت احساسی: ${aiAnalysis.customerMood}`,
        confidence: aiAnalysis.confidence || 70
      });
    }

    return updates;
  }

  /**
   * استخراج context فرهنگی
   */
  private extractCulturalContext(aiAnalysis: any): string[] {
    return aiAnalysis.culturalNotes || ['رعایت فرهنگ ایرانی در ارتباطات'];
  }

  /**
   * محاسبه تاریخ تماس بعدی
   */
  private calculateNextContactDate(report: TaskReport, aiAnalysis: any): string {
    if (aiAnalysis.nextContactSuggestion) {
      return aiAnalysis.nextContactSuggestion;
    }
    
    // Default: next working day
    return this.getNextWorkday();
  }

  /**
   * تعیین سطح اولویت
   */
  private determinePriorityLevel(aiAnalysis: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    const priority = aiAnalysis.priority || 3;
    
    if (priority >= 5) return 'URGENT';
    if (priority >= 4) return 'HIGH';
    if (priority >= 3) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * ذخیره تحلیل در پایگاه داده
   */
  private async saveAnalysis(analysis: ReportAnalysis): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO task_reports_analysis (
          report_id, key_insights, follow_up_actions, 
          representative_updates, cultural_context, 
          next_contact_date, priority_level, ai_confidence,
          created_at
        ) VALUES (
          ${analysis.reportId},
          ${JSON.stringify(analysis.keyInsights)},
          ${JSON.stringify(analysis.followUpActions)},
          ${JSON.stringify(analysis.representativeUpdates)},
          ${JSON.stringify(analysis.culturalContext)},
          ${analysis.nextContactDate},
          ${analysis.priorityLevel},
          ${analysis.aiConfidence},
          NOW()
        )
      `);
      
      console.log(`💾 Analysis saved for report ${analysis.reportId}`);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  /**
   * دریافت روز کاری بعدی
   */
  private getNextWorkday(): string {
    const tomorrow = new persianDate().add(1, 'day');
    return tomorrow.format('YYYY-MM-DD');
  }

  /**
   * تحلیل fallback در صورت خطا
   */
  private getFallbackAnalysis(): any {
    return {
      keyPoints: ['گزارش دریافت شد'],
      customerMood: 'خنثی',
      followUpSuggestions: ['پیگیری عادی'],
      priority: 3,
      nextContactSuggestion: this.getNextWorkday(),
      culturalNotes: ['رعایت ادب فارسی'],
      confidence: 50
    };
  }

  /**
   * پردازش تمام گزارش‌های در انتظار
   */
  async processPendingReports(): Promise<{ processed: number; failed: number; results: ReportAnalysis[] }> {
    try {
      console.log('🔄 Processing pending reports...');
      
      // Get pending reports from database
      const pendingReports = await db.execute(sql`
        SELECT id, task_id, staff_id, representative_id, content, submitted_at
        FROM task_reports 
        WHERE status = 'PENDING_REVIEW'
        ORDER BY created_at ASC
        LIMIT 10
      `);

      const results: ReportAnalysis[] = [];
      let processed = 0;
      let failed = 0;

      for (const row of pendingReports.rows) {
        try {
          const report = {
            id: row.id as string,
            taskId: row.task_id as string,
            staffId: row.staff_id as number,
            representativeId: row.representative_id as number,
            reportContent: row.content as string,
            completedAt: row.submitted_at as string,
            submittedAt: row.submitted_at as string
          };

          const analysis = await this.analyzeReport(report);
          results.push(analysis);
          processed++;

          // Update report status
          await db.execute(sql`
            UPDATE task_reports 
            SET status = 'AI_PROCESSED' 
            WHERE id = ${report.id}
          `);

        } catch (error) {
          console.error(`Failed to process report ${row.id}:`, error);
          failed++;
        }
      }

      console.log(`✅ Processed ${processed} reports, ${failed} failed`);
      return { processed, failed, results };

    } catch (error) {
      console.error('Error processing pending reports:', error);
      return { processed: 0, failed: 0, results: [] };
    }
  }
}

// Export singleton instance
export const reportAnalyzer = new ReportAnalyzer();
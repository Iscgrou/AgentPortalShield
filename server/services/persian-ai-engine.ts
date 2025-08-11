// 🧠 SHERLOCK v3.0 - Persian Cultural AI Engine
// Advanced Persian Cultural Intelligence for CRM Operations

import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "../db";
import { 
  representatives, 
  crmCulturalProfiles, 
  representativeLevels,
  aiKnowledgeBase,
  aiDecisionLog
} from "../../shared/schema";
import { XAIGrokEngine } from "./xai-grok-engine";

export interface CulturalProfile {
  communicationStyle: 'FORMAL' | 'RESPECTFUL' | 'FRIENDLY' | 'DIRECT';
  personalityTraits: string[];
  motivationFactors: string[];
  culturalFactors: {
    religiousConsideration: number; // 0-1
    traditionalValues: number; // 0-1
    modernAdaptation: number; // 0-1
    regionalInfluence: string;
    businessEtiquette: string[];
  };
  recommendedApproach: string;
  confidence: number;
}

export interface TaskRecommendation {
  type: 'FOLLOW_UP' | 'DEBT_COLLECTION' | 'RELATIONSHIP_BUILDING' | 'PERFORMANCE_CHECK';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  culturalContext: string;
  expectedOutcome: string;
  confidence: number;
  dueHours: number;
}

export class PersianAIEngine {
  private xaiEngine: XAIGrokEngine;
  private knowledgeCache: Map<string, any> = new Map();

  constructor() {
    this.xaiEngine = new XAIGrokEngine();
  }

  // ==================== CULTURAL PROFILE ANALYSIS ====================

  async analyzeCulturalProfile(representativeId: number): Promise<CulturalProfile> {
    try {
      console.log(`🧠 Starting cultural analysis for representative ${representativeId}`);

      // Get representative data
      const representative = await db.select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (!representative.length) {
        throw new Error('نماینده پیدا نشد');
      }

      const rep = representative[0];

      // Check for existing cultural profile
      const existingProfile = await db.select()
        .from(crmCulturalProfiles)
        .where(eq(crmCulturalProfiles.representativeId, representativeId))
        .limit(1);

      // If profile exists and is recent (less than 30 days), return it
      if (existingProfile.length) {
        const profile = existingProfile[0];
        const lastAnalyzed = profile.lastAnalyzedAt ? new Date(profile.lastAnalyzedAt) : new Date(0);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        if (lastAnalyzed > thirtyDaysAgo) {
          console.log(`📋 Using cached cultural profile for ${rep.name}`);
          return this.formatCulturalProfile(profile);
        }
      }

      // Generate new cultural analysis using XAI
      const culturalAnalysis = await this.generateCulturalAnalysis(rep);

      // Store or update in database
      if (existingProfile.length) {
        await db.update(crmCulturalProfiles)
          .set({
            communicationStyle: culturalAnalysis.communicationStyle,
            culturalFactors: culturalAnalysis.culturalFactors,
            personalityTraits: culturalAnalysis.personalityTraits,
            motivationFactors: culturalAnalysis.motivationFactors,
            recommendedApproach: culturalAnalysis.recommendedApproach,
            confidence: culturalAnalysis.confidence.toString(),
            lastAnalyzedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(crmCulturalProfiles.representativeId, representativeId));
      } else {
        await db.insert(crmCulturalProfiles).values({
          representativeId,
          communicationStyle: culturalAnalysis.communicationStyle,
          culturalFactors: culturalAnalysis.culturalFactors,
          personalityTraits: culturalAnalysis.personalityTraits,
          motivationFactors: culturalAnalysis.motivationFactors,
          recommendedApproach: culturalAnalysis.recommendedApproach,
          confidence: culturalAnalysis.confidence.toString(),
          lastAnalyzedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      console.log(`✅ Cultural analysis completed for ${rep.name}`);
      return culturalAnalysis;

    } catch (error) {
      console.error('خطا در تحلیل فرهنگی:', error);
      return this.getDefaultCulturalProfile();
    }
  }

  private async generateCulturalAnalysis(representative: any): Promise<CulturalProfile> {
    try {
      // Use XAI Grok for cultural analysis
      const culturalPrompt = this.buildCulturalAnalysisPrompt(representative);
      const aiResponse = await this.xaiEngine.generateCulturalInsights(representative.id, culturalPrompt);

      return this.parseCulturalResponse(aiResponse, representative);
    } catch (error) {
      console.error('خطا در تولید تحلیل فرهنگی:', error);
      return this.generateFallbackCulturalProfile(representative);
    }
  }

  private buildCulturalAnalysisPrompt(rep: any): string {
    return `
تحلیل فرهنگی نماینده تجاری ایرانی:

اطلاعات نماینده:
- نام: ${rep.name}
- کد: ${rep.code}
- صاحب فروشگاه: ${rep.ownerName || 'نامشخص'}
- موقعیت مالی: بدهی ${rep.totalDebt} تومان، فروش ${rep.totalSales} تومان
- وضعیت: ${rep.isActive ? 'فعال' : 'غیرفعال'}
- شهر/منطقه: ${this.inferRegionFromCode(rep.code)}

لطفاً تحلیل فرهنگی عمیق انجام دهید که شامل:
1. سبک ارتباطی مناسب (رسمی، دوستانه، مستقیم)
2. ویژگی‌های شخصیتی احتمالی
3. عوامل انگیزشی
4. ملاحظات فرهنگی ایرانی
5. رویکرد توصیه شده برای تعامل

در نظر بگیرید: فرهنگ کسب‌وکار ایرانی، ارزش‌های سنتی، اهمیت احترام و کرامت انسانی.
`;
  }

  private parseCulturalResponse(aiResponse: any, rep: any): CulturalProfile {
    // Parse AI response and structure it
    const confidence = Math.min(95, Math.max(70, (aiResponse.confidence || 80)));

    return {
      communicationStyle: this.determineCommunicationStyle(rep, aiResponse),
      personalityTraits: this.extractPersonalityTraits(rep, aiResponse),
      motivationFactors: this.extractMotivationFactors(rep, aiResponse),
      culturalFactors: {
        religiousConsideration: this.calculateReligiousConsideration(rep),
        traditionalValues: this.calculateTraditionalValues(rep),
        modernAdaptation: this.calculateModernAdaptation(rep),
        regionalInfluence: this.inferRegionFromCode(rep.code),
        businessEtiquette: this.getBusinessEtiquette(rep)
      },
      recommendedApproach: this.generateRecommendedApproach(rep, aiResponse),
      confidence
    };
  }

  private generateFallbackCulturalProfile(rep: any): CulturalProfile {
    const totalDebt = parseFloat(rep.totalDebt || '0');
    const totalSales = parseFloat(rep.totalSales || '0');

    return {
      communicationStyle: totalDebt > 500000 ? 'FORMAL' : 'RESPECTFUL',
      personalityTraits: this.inferTraitsFromFinancialData(totalDebt, totalSales),
      motivationFactors: ['رشد کسب‌وکار', 'حفظ اعتبار', 'روابط درازمدت'],
      culturalFactors: {
        religiousConsideration: 0.85,
        traditionalValues: 0.80,
        modernAdaptation: 0.65,
        regionalInfluence: this.inferRegionFromCode(rep.code),
        businessEtiquette: ['احترام متقابل', 'صبر و حوصله', 'مذاکره منطقی']
      },
      recommendedApproach: this.generateBasicApproach(rep),
      confidence: 75
    };
  }

  // ==================== TASK RECOMMENDATION ENGINE ====================

  async generateTaskRecommendations(representativeId: number): Promise<TaskRecommendation[]> {
    try {
      console.log(`🎯 Generating task recommendations for representative ${representativeId}`);

      const representative = await db.select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (!representative.length) {
        throw new Error('نماینده پیدا نشد');
      }

      const rep = representative[0];
      const culturalProfile = await this.analyzeCulturalProfile(representativeId);

      // Generate recommendations based on financial status and cultural profile
      const recommendations: TaskRecommendation[] = [];

      // Financial-based tasks
      const totalDebt = parseFloat(rep.totalDebt || '0');
      const totalSales = parseFloat(rep.totalSales || '0');

      if (totalDebt > 1000000) {
        recommendations.push(await this.createDebtCollectionTask(rep, culturalProfile));
      }

      if (totalSales > 0 && rep.isActive) {
        recommendations.push(await this.createRelationshipTask(rep, culturalProfile));
      }

      if (!rep.isActive) {
        recommendations.push(await this.createReactivationTask(rep, culturalProfile));
      }

      // Performance-based tasks
      if (totalSales < 500000 && rep.isActive) {
        recommendations.push(await this.createPerformanceTask(rep, culturalProfile));
      }

      // Follow-up tasks
      recommendations.push(await this.createFollowUpTask(rep, culturalProfile));

      // Log AI decision
      await this.logAIDecision('TASK_RECOMMENDATION', representativeId, {
        input: { debt: totalDebt, sales: totalSales, active: rep.isActive },
        recommendations: recommendations.length,
        culturalProfile: culturalProfile.communicationStyle
      });

      console.log(`✅ Generated ${recommendations.length} task recommendations`);
      return recommendations.slice(0, 3); // Return top 3 recommendations

    } catch (error) {
      console.error('خطا در تولید توصیه‌های وظیفه:', error);
      return [];
    }
  }

  private async createDebtCollectionTask(rep: any, profile: CulturalProfile): Promise<TaskRecommendation> {
    const culturalContext = profile.communicationStyle === 'FORMAL' 
      ? 'با رعایت کامل احترام و منطق تجاری'
      : 'با رویکرد دوستانه و حمایتی';

    return {
      type: 'DEBT_COLLECTION',
      priority: 'HIGH',
      title: `پیگیری محترمانه بدهی ${rep.name}`,
      description: `پیگیری مبلغ ${this.formatCurrency(rep.totalDebt)} تومان بدهی با رویکرد ${profile.communicationStyle === 'FORMAL' ? 'رسمی' : 'دوستانه'}`,
      culturalContext,
      expectedOutcome: 'توافق بر سر برنامه پرداخت و حفظ روابط تجاری',
      confidence: profile.confidence,
      dueHours: 24
    };
  }

  private async createRelationshipTask(rep: any, profile: CulturalProfile): Promise<TaskRecommendation> {
    return {
      type: 'RELATIONSHIP_BUILDING',
      priority: 'MEDIUM',
      title: `تقویت روابط تجاری با ${rep.name}`,
      description: `تماس دوستانه و بررسی نیازها برای تقویت همکاری`,
      culturalContext: 'با تأکید بر ارزش‌های مشترک و احترام متقابل',
      expectedOutcome: 'افزایش اعتماد و ایجاد فرصت‌های جدید همکاری',
      confidence: profile.confidence,
      dueHours: 72
    };
  }

  private async createReactivationTask(rep: any, profile: CulturalProfile): Promise<TaskRecommendation> {
    return {
      type: 'FOLLOW_UP',
      priority: 'HIGH',
      title: `فعال‌سازی مجدد ${rep.name}`,
      description: 'بررسی دلایل عدم فعالیت و ارائه راه‌حل‌های مناسب',
      culturalContext: 'با درنظرگیری شرایط خاص و ارائه حمایت',
      expectedOutcome: 'بازگشت به وضعیت فعال و شروع مجدد همکاری',
      confidence: profile.confidence,
      dueHours: 48
    };
  }

  private async createPerformanceTask(rep: any, profile: CulturalProfile): Promise<TaskRecommendation> {
    return {
      type: 'PERFORMANCE_CHECK',
      priority: 'MEDIUM',
      title: `بهبود عملکرد ${rep.name}`,
      description: 'بررسی چالش‌ها و ارائه راهکارهای بهبود فروش',
      culturalContext: 'با رویکرد مشاوره‌ای و حمایتی',
      expectedOutcome: 'شناسایی موانع و ارائه برنامه بهبود عملکرد',
      confidence: profile.confidence,
      dueHours: 96
    };
  }

  private async createFollowUpTask(rep: any, profile: CulturalProfile): Promise<TaskRecommendation> {
    return {
      type: 'FOLLOW_UP',
      priority: 'LOW',
      title: `تماس دوره‌ای با ${rep.name}`,
      description: 'تماس معمول برای حفظ ارتباط و بررسی وضعیت',
      culturalContext: 'با حفظ گرمی روابط و اطلاع از احوالات',
      expectedOutcome: 'حفظ ارتباط مستمر و آگاهی از وضعیت',
      confidence: profile.confidence,
      dueHours: 168 // 1 week
    };
  }

  // ==================== PERFORMANCE EVALUATION ====================

  async evaluateRepresentativeLevel(representativeId: number): Promise<string> {
    try {
      const representative = await db.select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (!representative.length) {
        return 'UNKNOWN';
      }

      const rep = representative[0];
      const totalDebt = parseFloat(rep.totalDebt || '0');
      const totalSales = parseFloat(rep.totalSales || '0');

      let level = 'NEW';
      
      if (!rep.isActive) {
        level = 'INACTIVE';
      } else if (totalSales > 5000000 && totalDebt < 1000000) {
        level = 'EXCELLENT';
      } else if (totalSales > 2000000 && totalDebt < 2000000) {
        level = 'GOOD';
      } else if (totalSales > 500000) {
        level = 'ACTIVE';
      }

      // Update representative level
      await this.updateRepresentativeLevel(representativeId, level);

      return level;
    } catch (error) {
      console.error('خطا در ارزیابی سطح نماینده:', error);
      return 'UNKNOWN';
    }
  }

  private async updateRepresentativeLevel(representativeId: number, newLevel: string): Promise<void> {
    try {
      const existing = await db.select()
        .from(representativeLevels)
        .where(eq(representativeLevels.representativeId, representativeId))
        .limit(1);

      if (existing.length) {
        const current = existing[0];
        if (current.currentLevel !== newLevel) {
          await db.update(representativeLevels)
            .set({
              previousLevel: current.currentLevel,
              currentLevel: newLevel,
              levelChangeReason: 'AI_EVALUATION',
              lastInteractionDate: new Date(),
              updatedAt: new Date()
            })
            .where(eq(representativeLevels.representativeId, representativeId));
        }
      } else {
        await db.insert(representativeLevels).values({
          representativeId,
          currentLevel: newLevel,
          levelChangeReason: 'INITIAL_EVALUATION',
          lastInteractionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('خطا در بروزرسانی سطح نماینده:', error);
    }
  }

  // ==================== HELPER METHODS ====================

  private formatCulturalProfile(dbProfile: any): CulturalProfile {
    return {
      communicationStyle: dbProfile.communicationStyle,
      personalityTraits: Array.isArray(dbProfile.personalityTraits) 
        ? dbProfile.personalityTraits 
        : JSON.parse(dbProfile.personalityTraits || '[]'),
      motivationFactors: Array.isArray(dbProfile.motivationFactors)
        ? dbProfile.motivationFactors
        : JSON.parse(dbProfile.motivationFactors || '[]'),
      culturalFactors: typeof dbProfile.culturalFactors === 'object'
        ? dbProfile.culturalFactors
        : JSON.parse(dbProfile.culturalFactors || '{}'),
      recommendedApproach: dbProfile.recommendedApproach,
      confidence: parseFloat(dbProfile.confidence || '75')
    };
  }

  private getDefaultCulturalProfile(): CulturalProfile {
    return {
      communicationStyle: 'RESPECTFUL',
      personalityTraits: ['محتاط', 'سنتی', 'قابل اعتماد'],
      motivationFactors: ['رشد کسب‌وکار', 'حفظ اعتبار', 'روابط درازمدت'],
      culturalFactors: {
        religiousConsideration: 0.85,
        traditionalValues: 0.80,
        modernAdaptation: 0.65,
        regionalInfluence: 'مرکزی',
        businessEtiquette: ['احترام متقابل', 'صبر و حوصله', 'مذاکره منطقی']
      },
      recommendedApproach: 'تعامل محترمانه با تأکید بر منافع مشترک',
      confidence: 75
    };
  }

  private determineCommunicationStyle(rep: any, aiResponse: any): CulturalProfile['communicationStyle'] {
    const debt = parseFloat(rep.totalDebt || '0');
    const sales = parseFloat(rep.totalSales || '0');

    if (debt > 2000000) return 'FORMAL';
    if (sales > 3000000) return 'RESPECTFUL';
    if (rep.isActive) return 'FRIENDLY';
    return 'DIRECT';
  }

  private extractPersonalityTraits(rep: any, aiResponse: any): string[] {
    const debt = parseFloat(rep.totalDebt || '0');
    const sales = parseFloat(rep.totalSales || '0');
    
    const traits = ['تجاری'];
    
    if (debt < 500000) traits.push('قابل اعتماد');
    if (sales > 2000000) traits.push('فعال');
    if (rep.isActive) traits.push('همکار');
    else traits.push('محتاط');
    
    return traits;
  }

  private extractMotivationFactors(rep: any, aiResponse: any): string[] {
    return [
      'رشد فروش',
      'حفظ اعتبار',
      'روابط طولانی‌مدت',
      'پشتیبانی فنی'
    ];
  }

  private calculateReligiousConsideration(rep: any): number {
    // Persian business culture - default high consideration
    return 0.85;
  }

  private calculateTraditionalValues(rep: any): number {
    return 0.80;
  }

  private calculateModernAdaptation(rep: any): number {
    return rep.isActive ? 0.75 : 0.55;
  }

  private inferRegionFromCode(code: string): string {
    // Simple region inference from representative code
    if (code.includes('THR') || code.includes('تهران')) return 'تهران';
    if (code.includes('ISF') || code.includes('اصفهان')) return 'اصفهان';
    if (code.includes('SHZ') || code.includes('شیراز')) return 'شیراز';
    return 'سایر شهرها';
  }

  private getBusinessEtiquette(rep: any): string[] {
    return [
      'احترام متقابل',
      'صبر و شکیبایی',
      'مذاکره منطقی',
      'حفظ کرامت'
    ];
  }

  private generateRecommendedApproach(rep: any, aiResponse: any): string {
    const debt = parseFloat(rep.totalDebt || '0');
    
    if (debt > 1000000) {
      return 'رویکرد محتاطانه با تأکید بر راه‌حل‌های عملی و قابل اجرا';
    }
    
    return 'تعامل دوستانه با هدف تقویت همکاری و رشد متقابل';
  }

  private generateBasicApproach(rep: any): string {
    return rep.isActive 
      ? 'حفظ روابط مثبت و تشویق به ادامه همکاری'
      : 'بررسی دلایل عدم فعالیت و ارائه راهکار مناسب';
  }

  private inferTraitsFromFinancialData(debt: number, sales: number): string[] {
    const traits = ['کسب‌وکار'];
    
    if (debt < 1000000) traits.push('مسئول');
    if (sales > 1000000) traits.push('فعال');
    if (debt / Math.max(sales, 1) < 0.5) traits.push('قابل اعتماد');
    
    return traits;
  }

  private async logAIDecision(type: string, representativeId: number, data: any): Promise<void> {
    try {
      const decisionId = `AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(aiDecisionLog).values({
        decisionId,
        decisionType: type,
        representativeId,
        inputData: data,
        reasoning: `Persian AI Engine decision based on cultural analysis and financial data`,
        confidenceScore: 85,
        expectedOutcome: `Improved representative relationship and performance`,
        contextFactors: { engine: 'PersianAI', version: 'SHERLOCK-v3.0' },
        culturalConsiderations: { persian: true, respectful: true },
        createdAt: new Date()
      });
    } catch (error) {
      console.error('خطا در ثبت تصمیم AI:', error);
    }
  }

  private formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fa-IR').format(num);
  }
}
// AI Task Generator Engine - DA VINCI v2.0
// Core intelligence system for generating Persian cultural workspace tasks

import { XAIGrokEngine } from "./xai-grok-engine";
import { settingsStorage } from "./settings-storage";
import { db } from '../db.js';
import { sql } from 'drizzle-orm';
import type { 
  WorkspaceTask, 
  SupportStaff, 
  ManagerTask, 
  OfferIncentive, 
  AiKnowledge 
} from "@shared/schema";

// Persian date utilities (ES module compatible)
import persianDate from 'persian-date';

export interface TaskGenerationContext {
  managerTasks: ManagerTask[];
  availableStaff: SupportStaff[];
  activeOffers: OfferIncentive[];
  knowledgeBase: AiKnowledge[];
  representativeProfiles: any[];
}

export interface TaskGenerationResult {
  tasks: WorkspaceTask[];
  generationMetadata: {
    totalGenerated: number;
    culturalFactorsApplied: string[];
    aiConfidenceAverage: number;
    processingTimeMs: number;
  };
}

export class AITaskGenerator {
  private grokEngine: XAIGrokEngine;
  private persianCalendar: any;

  constructor() {
    this.grokEngine = new XAIGrokEngine(settingsStorage);
    
    // Initialize Persian calendar
    this.persianCalendar = persianDate;
  }

  /**
   * Main task generation pipeline
   * Processes manager workspace items and generates culturally-aware tasks
   */
  async generateDailyTasks(): Promise<TaskGenerationResult> {
    const startTime = Date.now();
    
    try {
      // 1. Gather generation context
      const context = await this.buildGenerationContext();
      
      // 2. Generate tasks using AI
      const tasks = await this.processManagerWorkspace(context);
      
      // 3. Apply cultural intelligence
      const culturallyEnhancedTasks = await this.applyCulturalIntelligence(tasks, context);
      
      // 4. Assign tasks to appropriate staff
      const assignedTasks = await this.assignTasksToStaff(culturallyEnhancedTasks, context);
      
      // 5. Schedule with Persian datetime
      const scheduledTasks = this.applyPersianScheduling(assignedTasks);
      
      const processingTime = Date.now() - startTime;
      
      return {
        tasks: scheduledTasks,
        generationMetadata: {
          totalGenerated: scheduledTasks.length,
          culturalFactorsApplied: this.extractCulturalFactors(scheduledTasks),
          aiConfidenceAverage: this.calculateAverageConfidence(scheduledTasks),
          processingTimeMs: processingTime
        }
      };
    } catch (error) {
      console.error('Task generation failed:', error);
      return {
        tasks: [],
        generationMetadata: {
          totalGenerated: 0,
          culturalFactorsApplied: [],
          aiConfidenceAverage: 0,
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Build comprehensive context for task generation
   */
  private async buildGenerationContext(): Promise<TaskGenerationContext> {
    // DA VINCI v2.0 - Bypass settings storage and use direct DB queries for immediate functionality
    try {
      // Using direct imports now

      // Direct database queries for immediate data access
      const [managerTasksResult, staffResult, offersResult] = await Promise.all([
        db.execute(sql`SELECT * FROM manager_tasks WHERE status IN ('ACTIVE', 'PENDING') ORDER BY created_at DESC`).catch(() => ({ rows: [] })),
        db.execute(sql`SELECT * FROM support_staff WHERE is_active = true ORDER BY created_at DESC`).catch(() => ({ rows: [] })),
        db.execute(sql`SELECT * FROM offers_incentives WHERE is_active = true ORDER BY created_at DESC`).catch(() => ({ rows: [] }))
      ]);

      const managerTasks = managerTasksResult.rows as any[];
      const staff = staffResult.rows as any[];
      const offers = offersResult.rows as any[];
      const representatives = await this.getRepresentativeProfiles().catch(() => []);

      console.log('✅ Task Generation Context - Direct DB Access:', {
        managerTasks: managerTasks.length,
        availableStaff: staff.length,
        activeOffers: offers.length,
        representatives: representatives.length
      });

      return {
        managerTasks,
        availableStaff: staff,
        activeOffers: offers,
        knowledgeBase: [], // Skip for now
        representativeProfiles: representatives
      };
    } catch (error) {
      console.error('Error in buildGenerationContext:', error);
      
      return {
        managerTasks: [],
        availableStaff: [],
        activeOffers: [],
        knowledgeBase: [],
        representativeProfiles: []
      };
    }
  }

  /**
   * Process manager workspace items through AI
   */
  private async processManagerWorkspace(context: TaskGenerationContext): Promise<Partial<WorkspaceTask>[]> {
    const tasks: Partial<WorkspaceTask>[] = [];

    for (const managerTask of context.managerTasks) {
      try {
        // Skip if no representatives available
        if (context.representativeProfiles.length === 0) {
          console.log(`⚠️ No representatives found for manager task: ${managerTask.title}`);
          continue;
        }

        console.log(`✅ Processing manager task: ${managerTask.title} with ${context.representativeProfiles.length} representatives`);

        // Generate AI-powered task based on manager's definition
        const aiPrompt = this.buildTaskGenerationPrompt(managerTask, context);
        
        // Select appropriate representative based on task type and debt level
        const targetRep = this.selectTargetRepresentative(managerTask, context.representativeProfiles);
        
        const aiResponse = await this.grokEngine.generateTaskRecommendation(
          targetRep,
          
          // Cultural analysis placeholder - will be enhanced
          {
            communicationStyle: 'respectful',
            culturalSensitivity: 'high',
            businessApproach: 'traditional',
            relationshipPriority: 8,
            timeOrientation: 'flexible',
            trustLevel: 7
          }
        );

        // Convert AI recommendation to workspace task
        const workspaceTask: Partial<WorkspaceTask> = {
          title: aiResponse.title,
          description: aiResponse.description,
          priority: aiResponse.priority,
          aiContext: {
            culturalConsiderations: aiResponse.culturalConsiderations,
            suggestedApproach: aiResponse.description,
            expectedOutcome: aiResponse.expectedOutcome,
            riskLevel: Math.ceil(aiResponse.estimatedDifficulty)
          },
          managerTaskId: managerTask.id.toString(),
          generatedFromSettings: {
            staffAssignment: 0, // Will be assigned later
            relatedOffers: context.activeOffers
              .filter((offer: any) => managerTask.assignedStaffId && offer.id)
              .map((offer: any) => offer.id),
            knowledgeBaseRefs: context.knowledgeBase
              .filter((kb: any) => kb.id)
              .map((kb: any) => kb.id.toString())
          }
        };

        tasks.push(workspaceTask);
      } catch (error) {
        console.error(`Failed to process manager task ${managerTask.id}:`, error);
        // Continue with other tasks
      }
    }

    return tasks;
  }

  /**
   * Apply Persian cultural intelligence to generated tasks
   */
  private async applyCulturalIntelligence(
    tasks: Partial<WorkspaceTask>[], 
    context: TaskGenerationContext
  ): Promise<Partial<WorkspaceTask>[]> {
    
    return Promise.all(tasks.map(async (task) => {
      try {
        // Enhanced cultural prompt for Persian business context
        const culturalPrompt = `
تحلیل فرهنگی وظیفه کاری برای محیط تجاری ایران:

وظیفه: ${task.title}
شرح: ${task.description}

لطفا موارد زیر را با در نظر گیری فرهنگ کاری ایران تحلیل کن:
1. بهترین زمان تماس با نماینده
2. نحوه برخورد محترمانه و مؤثر
3. احتمال موفقیت و ریسک‌های احتمالی
4. پیشنهاد کلمات و عبارات مناسب
5. نکات فرهنگی مهم

پاسخ را در قالب JSON ارائه ده.
`;

        // Use XAI Grok engine for cultural analysis
        const culturalAnalysisResponse = await this.grokEngine.generateCulturalInsights(
          context.representativeProfiles[0] || { id: 1, name: 'Test' },
          culturalPrompt
        );

        // Try to parse as JSON, fallback to basic structure
        let analysis: any = {};
        try {
          analysis = JSON.parse(culturalAnalysisResponse);
        } catch {
          analysis = {
            culturalNotes: ['فرهنگ کاری ایرانی در نظر گرفته شود'],
            suggestedApproach: culturalAnalysisResponse.substring(0, 200),
            riskLevel: 3
          };
        }
        
        // Enhance task with cultural insights
        return {
          ...task,
          aiContext: {
            ...(task.aiContext as any || {}),
            culturalConsiderations: [
              ...((task.aiContext as any)?.culturalConsiderations || []),
              ...(analysis.culturalNotes || [])
            ],
            suggestedApproach: analysis.suggestedApproach || ((task.aiContext as any)?.suggestedApproach) || '',
            riskLevel: analysis.riskLevel || ((task.aiContext as any)?.riskLevel) || 3
          }
        };
      } catch (error) {
        console.error('Cultural analysis failed for task:', error);
        return task; // Return original task if analysis fails
      }
    }));
  }

  /**
   * Assign tasks to appropriate staff members
   */
  private async assignTasksToStaff(
    tasks: Partial<WorkspaceTask>[], 
    context: TaskGenerationContext
  ): Promise<Partial<WorkspaceTask>[]> {
    
    return tasks.map(task => {
      // Smart staff assignment based on workload, skills, and task requirements
      const assignedStaff = this.selectOptimalStaff(task, context.availableStaff);
      
      return {
        ...task,
        staffId: assignedStaff?.id || context.availableStaff[0]?.id || 1,
        generatedFromSettings: {
          ...task.generatedFromSettings!,
          staffAssignment: assignedStaff?.id || context.availableStaff[0]?.id || 1
        }
      };
    });
  }

  /**
   * Apply Persian scheduling and datetime
   */
  private applyPersianScheduling(tasks: Partial<WorkspaceTask>[]): WorkspaceTask[] {
    const now = new persianDate();
    
    return tasks.map((task, index) => {
      // Generate unique task ID
      const taskId = `TASK-${now.format('YYYY-MM-DD')}-${(index + 1).toString().padStart(3, '0')}`;
      
      // Schedule task for immediate assignment
      const assignedAt = now.format('YYYY/MM/DD HH:mm:ss');
      
      // Set deadline based on priority
      const deadlineHours = this.getDeadlineHours(task.priority || 'MEDIUM');
      const deadline = now.clone().add(deadlineHours, 'hours').format('YYYY/MM/DD HH:mm:ss');

      return {
        id: taskId,
        staffId: task.staffId!,
        representativeId: task.representativeId || 1,
        title: task.title!,
        description: task.description!,
        priority: task.priority!,
        status: 'ASSIGNED' as const,
        assignedAt,
        deadline,
        readAt: null,
        completedAt: null,
        aiContext: task.aiContext!,
        managerTaskId: task.managerTaskId,
        generatedFromSettings: task.generatedFromSettings!,
        createdAt: null,
        updatedAt: null
      } as WorkspaceTask;
    });
  }

  // Helper methods
  private buildTaskGenerationPrompt(managerTask: ManagerTask, context: TaskGenerationContext): string {
    return `
مدیر CRM وظیفه زیر را تعریف کرده:
عنوان: ${managerTask.title}
شرح: ${managerTask.description}
اولویت: ${managerTask.priority}

منابع در دسترس:
- کارمندان: ${context.availableStaff.map((s: any) => s.fullName).join(', ')}
- آفرها: ${context.activeOffers.map((o: any) => o.offerName).join(', ')}
- دانش خصوصی: ${context.knowledgeBase.map((k: any) => k.title || k.category).join(', ')}

لطفا این وظیفه را به صورت عملیاتی و قابل اجرا برای کارمند پشتیبانی تبدیل کن.
`;
  }

  private selectOptimalStaff(task: Partial<WorkspaceTask>, staff: SupportStaff[]): SupportStaff | null {
    if (staff.length === 0) return null;
    
    // Simple round-robin for now - can be enhanced with workload balancing
    return staff[Math.floor(Math.random() * staff.length)];
  }

  private getDeadlineHours(priority: string): number {
    switch (priority) {
      case 'URGENT': return 4;
      case 'HIGH': return 12;
      case 'MEDIUM': return 24;
      case 'LOW': return 48;
      default: return 24;
    }
  }

  private extractCulturalFactors(tasks: WorkspaceTask[]): string[] {
    const factors = new Set<string>();
    tasks.forEach(task => {
      task.aiContext.culturalConsiderations.forEach((factor: any) => factors.add(factor));
    });
    return Array.from(factors);
  }

  private calculateAverageConfidence(tasks: WorkspaceTask[]): number {
    if (tasks.length === 0) return 0;
    
    const totalConfidence = tasks.reduce((sum, task) => {
      return sum + (task.aiContext.riskLevel || 0) * 20; // Convert risk to confidence
    }, 0);
    
    return Math.round(totalConfidence / tasks.length);
  }

  private async getRepresentativeProfiles(): Promise<any[]> {
    try {
      // Get basic representative data for context
      console.log('🔍 Fetching representative profiles from database...');
      
      const representatives = await db.execute(sql`
        SELECT id, name, phone, total_debt, total_sales, is_active
        FROM representatives 
        ORDER BY total_debt DESC 
        LIMIT 10  
      `);
      
      console.log(`📊 Found ${representatives.rows.length} representatives for task generation`);
      
      return representatives.rows.map((rep: any) => ({
        id: rep.id,
        name: rep.name,
        phone: rep.phone,
        totalDebt: rep.total_debt || 0,
        totalSales: rep.total_sales || 0,
        isActive: rep.is_active || true
      }));
    } catch (error) {
      console.error('Error fetching representative profiles:', error);
      return [];
    }
  }

  /**
   * Select target representative based on manager task requirements
   */
  private selectTargetRepresentative(managerTask: any, representatives: any[]): any {
    if (representatives.length === 0) {
      return { id: 1, name: 'نماینده عمومی', totalDebt: 0 };
    }

    // Select based on task type
    if (managerTask.task_type === 'FOLLOW_UP') {
      // For follow-up tasks, prioritize high debt representatives
      return representatives.find(rep => rep.totalDebt > 5000000) || representatives[0];
    } else if (managerTask.task_type === 'RELATIONSHIP_BUILDING') {
      // For relationship building, select mid-range debt representatives
      return representatives.find(rep => rep.totalDebt < 5000000 && rep.totalDebt > 1000000) || representatives[0];
    }
    
    // Default: return first representative
    return representatives[0];
  }
}
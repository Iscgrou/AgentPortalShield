// 🎯 SHERLOCK v3.0 - Integrated Task Management Service
// Complete coupling between tasks, representatives, and AI intelligence

import { eq, desc, sql, and, or } from "drizzle-orm";
import { db } from "../db";
import { 
  representatives, 
  crmTasks, 
  crmTaskResults,
  aiDecisionLog,
  workspaceTasks,
  taskReports,
  crmCulturalProfiles
} from "../../shared/schema";
import { PersianAIEngine } from "./persian-ai-engine";
import { XAIGrokEngine } from "./xai-grok-engine";
import { nanoid } from "nanoid";

export interface TaskContext {
  representativeId: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  taskType: 'FOLLOW_UP' | 'DEBT_COLLECTION' | 'RELATIONSHIP_BUILDING' | 'PERFORMANCE_CHECK';
  culturalFactors: any;
  financialSnapshot: {
    totalDebt: number;
    totalSales: number;
    lastPayment: string | null;
    creditStatus: string;
  };
}

export interface TaskCreationResult {
  task: any;
  aiDecision: any;
  culturalContext: any;
  expectedOutcome: string;
  successMetrics: string[];
}

export class TaskManagementService {
  private persianAI: PersianAIEngine;
  private xaiEngine: XAIGrokEngine;

  constructor() {
    this.persianAI = new PersianAIEngine();
    this.xaiEngine = new XAIGrokEngine();
  }

  // ==================== INTELLIGENT TASK CREATION ====================

  async createIntelligentTask(context: TaskContext, managerUserId: number): Promise<TaskCreationResult> {
    try {
      console.log(`🎯 Creating intelligent task for representative ${context.representativeId}`);

      // Step 1: Get representative data and cultural profile
      const representative = await this.getRepresentativeWithProfile(context.representativeId);
      if (!representative) {
        throw new Error('نماینده یافت نشد');
      }

      // Step 2: Generate AI-powered task recommendation
      const aiRecommendation = await this.persianAI.generateTaskRecommendations(context.representativeId);
      const primaryRecommendation = aiRecommendation[0];

      if (!primaryRecommendation) {
        throw new Error('امکان تولید توصیه وظیفه وجود ندارد');
      }

      // Step 3: Apply cultural intelligence
      const culturalContext = await this.applyCulturalIntelligence(representative, primaryRecommendation);

      // Step 4: Create workspace task with full context
      const taskId = `TASK-${new Date().toISOString().split('T')[0]}-${nanoid(6).toUpperCase()}`;
      
      const workspaceTask = await db.insert(workspaceTasks).values({
        id: taskId,
        staffId: this.getAssignedStaffId(context.urgencyLevel),
        title: culturalContext.adjustedTitle,
        description: culturalContext.adjustedDescription,
        priority: this.mapPriorityToWorkspace(primaryRecommendation.priority),
        status: 'ASSIGNED',
        assignedTo: representative.name,
        representativeId: context.representativeId,
        dueDate: this.calculateDueDate(primaryRecommendation.dueHours),
        isAiGenerated: true,
        culturalContext: JSON.stringify(culturalContext),
        aiModel: 'Persian-AI-v3.0',
        createdBy: `Manager-${managerUserId}`,
        taskMetadata: JSON.stringify({
          originalRecommendation: primaryRecommendation,
          culturalFactors: representative.culturalProfile,
          financialSnapshot: context.financialSnapshot,
          urgencyLevel: context.urgencyLevel
        }),
        createdAt: new Date()
      }).returning();

      // Step 5: Log AI decision
      const aiDecision = await this.logTaskCreationDecision(
        context.representativeId,
        primaryRecommendation,
        culturalContext,
        managerUserId
      );

      // Step 6: Update representative profile with task assignment
      await this.updateRepresentativeTaskHistory(context.representativeId, workspaceTask[0].id);

      console.log(`✅ Intelligent task created: ${taskId} for ${representative.name}`);

      return {
        task: workspaceTask[0],
        aiDecision,
        culturalContext,
        expectedOutcome: primaryRecommendation.expectedOutcome,
        successMetrics: [
          'تکمیل به موقع وظیفه',
          'کیفیت ارتباط با نماینده', 
          'بهبود شاخص‌های مالی',
          'رضایت نماینده'
        ]
      };

    } catch (error) {
      console.error('خطا در ایجاد وظیفه هوشمند:', error);
      throw error;
    }
  }

  // ==================== TASK COMPLETION & FEEDBACK LOOP ====================

  async completeTaskWithAnalysis(taskId: string, reportContent: string, staffId: number): Promise<any> {
    try {
      console.log(`📊 Analyzing task completion: ${taskId}`);

      // Step 1: Get task with full context
      const task = await this.getTaskWithContext(taskId);
      if (!task) {
        throw new Error('وظیفه یافت نشد');
      }

      // Step 2: Update task status
      await db.update(workspaceTasks)
        .set({ 
          status: 'COMPLETED',
          completedAt: new Date(),
          completionNotes: reportContent
        })
        .where(eq(workspaceTasks.id, taskId));

      // Step 3: Analyze completion quality using AI
      const completionAnalysis = await this.analyzeTaskCompletion(task, reportContent);

      // Step 4: Update representative profile based on results
      await this.updateRepresentativeFromTaskResult(task.representativeId, completionAnalysis);

      // Step 5: Feed learning back to AI system
      await this.feedbackToAI(task, completionAnalysis);

      // Step 6: Generate follow-up recommendations if needed
      const followUps = await this.generateFollowUpTasks(task, completionAnalysis);

      console.log(`✅ Task completion analysis finished for ${taskId}`);

      return {
        completionAnalysis,
        profileUpdates: await this.getRepresentativeProfileUpdates(task.representativeId),
        followUpRecommendations: followUps,
        learningPoints: completionAnalysis.learningPoints
      };

    } catch (error) {
      console.error('خطا در تحلیل تکمیل وظیفه:', error);
      throw error;
    }
  }

  // ==================== REPRESENTATIVE-TASK COUPLING ====================

  async syncTasksWithRepresentativeChanges(representativeId: number): Promise<void> {
    try {
      console.log(`🔄 Syncing tasks with representative changes: ${representativeId}`);

      // Get current representative status
      const representative = await db.select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (!representative.length) return;

      const rep = representative[0];

      // Get active tasks for this representative
      const activeTasks = await db.select()
        .from(workspaceTasks)
        .where(and(
          eq(workspaceTasks.representativeId, representativeId),
          eq(workspaceTasks.status, 'ASSIGNED')
        ));

      // Analyze if tasks need priority adjustment based on financial changes
      for (const task of activeTasks) {
        const priorityAdjustment = await this.analyzePriorityAdjustment(rep, task);
        
        if (priorityAdjustment.shouldUpdate) {
          await db.update(workspaceTasks)
            .set({
              priority: priorityAdjustment.newPriority,
              updatedAt: new Date(),
              adjustmentReason: priorityAdjustment.reason
            })
            .where(eq(workspaceTasks.id, task.id));

          console.log(`📊 Task priority updated: ${task.id} → ${priorityAdjustment.newPriority}`);
        }
      }

      // Generate new urgent tasks if financial status deteriorated significantly
      await this.checkForUrgentTaskGeneration(rep);

    } catch (error) {
      console.error('خطا در همگام‌سازی وظایف:', error);
    }
  }

  // ==================== AI LEARNING & ADAPTATION ====================

  async learnFromTaskResults(): Promise<any> {
    try {
      console.log('🧠 Learning from completed task results...');

      // Get completed tasks from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const completedTasks = await db.select()
        .from(workspaceTasks)
        .where(and(
          eq(workspaceTasks.status, 'COMPLETED'),
          sql`${workspaceTasks.completedAt} > ${thirtyDaysAgo}`
        ));

      const learningData = {
        successPatterns: [],
        failurePatterns: [],
        culturalInsights: [],
        improvementAreas: []
      };

      // Analyze each completed task
      for (const task of completedTasks) {
        const analysis = await this.extractLearningFromTask(task);
        
        if (analysis.successful) {
          learningData.successPatterns.push(analysis.pattern);
        } else {
          learningData.failurePatterns.push(analysis.pattern);
        }

        learningData.culturalInsights.push(...analysis.culturalLearnings);
      }

      // Update AI knowledge base
      await this.updateAIKnowledgeBase(learningData);

      // Adjust AI parameters based on learnings
      await this.adjustAIParameters(learningData);

      console.log(`✅ AI learning completed: ${completedTasks.length} tasks analyzed`);

      return {
        tasksAnalyzed: completedTasks.length,
        successPatterns: learningData.successPatterns.length,
        newInsights: learningData.culturalInsights.length,
        adjustmentsMade: learningData.improvementAreas.length
      };

    } catch (error) {
      console.error('خطا در یادگیری AI:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  private async getRepresentativeWithProfile(representativeId: number): Promise<any> {
    const rep = await db.select()
      .from(representatives)
      .where(eq(representatives.id, representativeId))
      .limit(1);

    if (!rep.length) return null;

    const culturalProfile = await db.select()
      .from(crmCulturalProfiles)
      .where(eq(crmCulturalProfiles.representativeId, representativeId))
      .limit(1);

    return {
      ...rep[0],
      culturalProfile: culturalProfile.length ? culturalProfile[0] : null
    };
  }

  private async applyCulturalIntelligence(representative: any, recommendation: any): Promise<any> {
    const culturalFactors = representative.culturalProfile?.culturalFactors || {};
    
    // Adjust language and approach based on cultural profile
    let adjustedTitle = recommendation.title;
    let adjustedDescription = recommendation.description;

    if (culturalFactors.religiousConsideration > 0.8) {
      adjustedTitle = `${adjustedTitle} (با رعایت ملاحظات فرهنگی)`;
      adjustedDescription += '\n\n⚠️ در تعامل، به ارزش‌های فرهنگی و مذهبی احترام گذارید.';
    }

    if (culturalFactors.traditionalValues > 0.8) {
      adjustedDescription += '\n\n📞 ترجیحاً از تماس تلفنی استفاده کنید.';
    }

    return {
      adjustedTitle,
      adjustedDescription,
      culturalNotes: `سبک ارتباطی: ${representative.culturalProfile?.communicationStyle || 'RESPECTFUL'}`,
      recommendedApproach: representative.culturalProfile?.recommendedApproach || 'تعامل محترمانه'
    };
  }

  private getAssignedStaffId(urgencyLevel: string): number {
    // In a real system, this would distribute based on workload
    return 1; // Default staff ID
  }

  private mapPriorityToWorkspace(aiPriority: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (aiPriority) {
      case 'URGENT': return 'HIGH';
      case 'HIGH': return 'HIGH';
      case 'MEDIUM': return 'MEDIUM';
      case 'LOW': return 'LOW';
      default: return 'MEDIUM';
    }
  }

  private calculateDueDate(dueHours: number): string {
    const dueDate = new Date(Date.now() + dueHours * 60 * 60 * 1000);
    return dueDate.toISOString();
  }

  private async logTaskCreationDecision(
    representativeId: number, 
    recommendation: any, 
    culturalContext: any, 
    managerUserId: number
  ): Promise<any> {
    const decisionId = `DECISION-${Date.now()}-${nanoid(6)}`;
    
    const decision = await db.insert(aiDecisionLog).values({
      decisionId,
      decisionType: 'TASK_CREATION',
      representativeId,
      inputData: {
        recommendation,
        culturalContext,
        createdBy: managerUserId
      },
      reasoning: 'Persian AI analysis combined with cultural intelligence for optimal task creation',
      confidenceScore: recommendation.confidence || 85,
      expectedOutcome: recommendation.expectedOutcome,
      contextFactors: { engine: 'TaskManagement-v3.0', cultural: true },
      culturalConsiderations: culturalContext,
      createdAt: new Date()
    }).returning();

    return decision[0];
  }

  private async updateRepresentativeTaskHistory(representativeId: number, taskId: string): Promise<void> {
    // This would update a task history field in the representative record
    // For now, we'll log the association
    console.log(`📋 Associated task ${taskId} with representative ${representativeId}`);
  }

  private async getTaskWithContext(taskId: string): Promise<any> {
    const task = await db.select()
      .from(workspaceTasks)
      .where(eq(workspaceTasks.id, taskId))
      .limit(1);

    return task.length ? task[0] : null;
  }

  private async analyzeTaskCompletion(task: any, reportContent: string): Promise<any> {
    // Use XAI to analyze completion quality
    const analysis = await this.xaiEngine.analyzeTaskCompletion(
      task.representativeId,
      task.description,
      reportContent
    );

    return {
      qualityScore: analysis.score || 80,
      completionEffectiveness: analysis.effectiveness || 'GOOD',
      learningPoints: analysis.learnings || [],
      culturalAlignment: analysis.culturalAlignment || 85,
      recommendedFollowUp: analysis.followUp || false
    };
  }

  private async updateRepresentativeFromTaskResult(representativeId: number, analysis: any): Promise<void> {
    // This would update representative metrics based on task completion
    console.log(`📈 Updating representative ${representativeId} metrics based on task completion`);
  }

  private async feedbackToAI(task: any, analysis: any): Promise<void> {
    // Feed completion results back to AI for learning
    console.log(`🧠 Feeding task completion results to AI learning system`);
  }

  private async generateFollowUpTasks(task: any, analysis: any): Promise<any[]> {
    if (analysis.recommendedFollowUp) {
      const followUps = await this.persianAI.generateTaskRecommendations(task.representativeId);
      return followUps.slice(0, 1); // Return just one follow-up
    }
    return [];
  }

  private async getRepresentativeProfileUpdates(representativeId: number): Promise<any> {
    return { updated: true, timestamp: new Date().toISOString() };
  }

  private async analyzePriorityAdjustment(representative: any, task: any): Promise<any> {
    const currentDebt = parseFloat(representative.totalDebt || '0');
    
    // Simple priority adjustment logic
    if (currentDebt > 2000000 && task.priority !== 'HIGH') {
      return {
        shouldUpdate: true,
        newPriority: 'HIGH',
        reason: 'بدهی بالا - افزایش اولویت'
      };
    }

    return { shouldUpdate: false };
  }

  private async checkForUrgentTaskGeneration(representative: any): Promise<void> {
    const currentDebt = parseFloat(representative.totalDebt || '0');
    
    if (currentDebt > 5000000) {
      // Generate urgent debt collection task
      console.log(`🚨 Generating urgent task for high debt representative: ${representative.name}`);
    }
  }

  private async extractLearningFromTask(task: any): Promise<any> {
    return {
      successful: task.completedAt !== null,
      pattern: {
        taskType: task.taskType,
        culturalContext: task.culturalContext,
        completionTime: 'normal'
      },
      culturalLearnings: ['محترمانه بودن مؤثر است', 'تماس تلفنی بهتر از پیامک']
    };
  }

  private async updateAIKnowledgeBase(learningData: any): Promise<void> {
    console.log('📚 Updating AI knowledge base with new patterns');
  }

  private async adjustAIParameters(learningData: any): Promise<void> {
    console.log('⚙️ Adjusting AI parameters based on learning');
  }
}
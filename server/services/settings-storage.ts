import { 
  crmSettings, supportStaff, aiKnowledgeDatabase, offersIncentives, managerTasks, 
  managerTaskExecutions, aiTestResults,
  type CrmSetting, type InsertCrmSetting,
  type SupportStaff, type InsertSupportStaff,
  type AiKnowledge, type InsertAiKnowledge,
  type OfferIncentive, type InsertOfferIncentive,
  type ManagerTask, type InsertManagerTask,
  type ManagerTaskExecution, type InsertManagerTaskExecution,
  type AiTestResult, type InsertAiTestResult
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export class SettingsStorage {
  // ==================== CRM SETTINGS ====================
  
  async getCrmSettings(category?: string): Promise<CrmSetting[]> {
    try {
      const query = db.select().from(crmSettings);
      if (category) {
        return await query.where(eq(crmSettings.category, category));
      }
      return await query.orderBy(desc(crmSettings.updatedAt));
    } catch (error) {
      console.error('Error fetching CRM settings:', error);
      throw new Error('خطا در دریافت تنظیمات');
    }
  }

  async getCrmSetting(key: string): Promise<CrmSetting | undefined> {
    try {
      const result = await db.select().from(crmSettings).where(eq(crmSettings.key, key)).limit(1);
      return result[0];
    } catch (error) {
      console.error(`Error fetching CRM setting ${key}:`, error);
      throw new Error('خطا در دریافت تنظیم');
    }
  }

  async createCrmSetting(setting: InsertCrmSetting): Promise<CrmSetting> {
    try {
      const result = await db.insert(crmSettings).values(setting).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating CRM setting:', error);
      throw new Error('خطا در ایجاد تنظیم');
    }
  }

  async updateCrmSetting(key: string, setting: Partial<CrmSetting>): Promise<CrmSetting> {
    try {
      const result = await db.update(crmSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(crmSettings.key, key))
        .returning();
      
      if (result.length === 0) {
        throw new Error('تنظیم یافت نشد');
      }
      return result[0];
    } catch (error) {
      console.error(`Error updating CRM setting ${key}:`, error);
      throw new Error('خطا در بروزرسانی تنظیم');
    }
  }

  async deleteCrmSetting(key: string): Promise<void> {
    try {
      await db.delete(crmSettings).where(eq(crmSettings.key, key));
    } catch (error) {
      console.error(`Error deleting CRM setting ${key}:`, error);
      throw new Error('خطا در حذف تنظیم');
    }
  }

  // ==================== SUPPORT STAFF ====================

  async getSupportStaff(): Promise<SupportStaff[]> {
    try {
      // Use raw SQL for compatibility with manually created tables  
      const result = await db.execute(sql`
        SELECT * FROM support_staff 
        WHERE is_active = true 
        ORDER BY created_at DESC
      `);
      return result.rows as any[];
    } catch (error) {
      console.error('Error fetching support staff:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getSupportStaffById(id: number): Promise<SupportStaff | undefined> {
    try {
      const result = await db.select().from(supportStaff).where(eq(supportStaff.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error(`Error fetching support staff ${id}:`, error);
      throw new Error('خطا در دریافت کارمند');
    }
  }

  async createSupportStaff(staff: InsertSupportStaff): Promise<SupportStaff> {
    try {
      const result = await db.insert(supportStaff).values(staff).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating support staff:', error);
      throw new Error('خطا در ایجاد کارمند');
    }
  }

  async updateSupportStaff(id: number, staff: Partial<SupportStaff>): Promise<SupportStaff> {
    try {
      const result = await db.update(supportStaff)
        .set({ ...staff, updatedAt: new Date() })
        .where(eq(supportStaff.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('کارمند یافت نشد');
      }
      return result[0];
    } catch (error) {
      console.error(`Error updating support staff ${id}:`, error);
      throw new Error('خطا در بروزرسانی کارمند');
    }
  }

  // ==================== AI KNOWLEDGE DATABASE ====================

  async getAiKnowledge(category?: string): Promise<AiKnowledge[]> {
    try {
      // Use raw SQL for compatibility - check if table exists first
      const result = await db.execute(sql`
        SELECT * FROM ai_knowledge_database 
        WHERE is_active = true 
        ORDER BY usage_count DESC
        LIMIT 10
      `);
      return result.rows as any[];
    } catch (error) {
      console.error('Error fetching AI knowledge:', error);
      // Return empty array instead of throwing for missing tables
      return [];
    }
  }

  async createAiKnowledge(knowledge: InsertAiKnowledge): Promise<AiKnowledge> {
    try {
      const result = await db.insert(aiKnowledgeDatabase).values([knowledge]).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating AI knowledge:', error);
      throw new Error('خطا در ایجاد دانش');
    }
  }

  async updateAiKnowledge(id: number, knowledge: Partial<AiKnowledge>): Promise<AiKnowledge> {
    try {
      const result = await db.update(aiKnowledgeDatabase)
        .set({ ...knowledge, updatedAt: new Date() })
        .where(eq(aiKnowledgeDatabase.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('دانش یافت نشد');
      }
      return result[0];
    } catch (error) {
      console.error(`Error updating AI knowledge ${id}:`, error);
      throw new Error('خطا در بروزرسانی دانش');
    }
  }

  // ==================== OFFERS & INCENTIVES ====================

  async getOfferIncentives(): Promise<OfferIncentive[]> {
    return this.getOffers();
  }

  async getOffers(): Promise<OfferIncentive[]> {
    try {
      // Use raw SQL for compatibility with manually created tables
      const result = await db.execute(sql`
        SELECT * FROM offers_incentives 
        WHERE is_active = true 
        ORDER BY created_at DESC
      `);
      return result.rows as any[];
    } catch (error) {
      console.error('Error fetching offers:', error);
      return []; // Return empty array instead of throwing
    }
  }

  // Add getOfferIncentives method as alias
  async getOfferIncentives(): Promise<OfferIncentive[]> {
    return this.getOffers();
  }

  async createOffer(offer: InsertOfferIncentive): Promise<OfferIncentive> {
    try {
      const result = await db.insert(offersIncentives).values(offer).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating offer:', error);
      throw new Error('خطا در ایجاد آفر');
    }
  }

  async updateOffer(id: number, offer: Partial<OfferIncentive>): Promise<OfferIncentive> {
    try {
      const result = await db.update(offersIncentives)
        .set({ ...offer, updatedAt: new Date() })
        .where(eq(offersIncentives.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('آفر یافت نشد');
      }
      return result[0];
    } catch (error) {
      console.error(`Error updating offer ${id}:`, error);
      throw new Error('خطا در بروزرسانی آفر');
    }
  }

  // ==================== MANAGER TASKS ====================

  async getManagerTasks(status?: string): Promise<ManagerTask[]> {
    try {
      // Use raw SQL for compatibility with manually created tables
      const result = await db.execute(sql`
        SELECT * FROM manager_tasks 
        WHERE status IN ('ACTIVE', 'PENDING') 
        ORDER BY created_at DESC
      `);
      return result.rows as any[];
    } catch (error) {
      console.error('Error fetching manager tasks:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async createManagerTask(task: InsertManagerTask): Promise<ManagerTask> {
    try {
      const taskId = nanoid();
      const result = await db.insert(managerTasks).values({ ...task, taskId }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating manager task:', error);
      throw new Error('خطا در ایجاد وظیفه');
    }
  }

  async updateManagerTask(taskId: string, task: Partial<ManagerTask>): Promise<ManagerTask> {
    try {
      const result = await db.update(managerTasks)
        .set({ ...task, updatedAt: new Date() })
        .where(eq(managerTasks.taskId, taskId))
        .returning();
      
      if (result.length === 0) {
        throw new Error('وظیفه یافت نشد');
      }
      return result[0];
    } catch (error) {
      console.error(`Error updating manager task ${taskId}:`, error);
      throw new Error('خطا در بروزرسانی وظیفه');
    }
  }

  async deleteManagerTask(taskId: string): Promise<void> {
    try {
      await db.delete(managerTasks).where(eq(managerTasks.taskId, taskId));
    } catch (error) {
      console.error(`Error deleting manager task ${taskId}:`, error);
      throw new Error('خطا در حذف وظیفه');
    }
  }

  // ==================== MANAGER TASK EXECUTIONS ====================

  async getTaskExecutions(taskId?: string): Promise<ManagerTaskExecution[]> {
    try {
      const query = db.select().from(managerTaskExecutions);
      if (taskId) {
        return await query.where(eq(managerTaskExecutions.taskId, taskId)).orderBy(desc(managerTaskExecutions.createdAt));
      }
      return await query.orderBy(desc(managerTaskExecutions.createdAt));
    } catch (error) {
      console.error('Error fetching task executions:', error);
      throw new Error('خطا در دریافت اجرای وظایف');
    }
  }

  async createTaskExecution(execution: InsertManagerTaskExecution): Promise<ManagerTaskExecution> {
    try {
      const executionId = nanoid();
      const result = await db.insert(managerTaskExecutions).values({ ...execution, executionId }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating task execution:', error);
      throw new Error('خطا در ایجاد اجرای وظیفه');
    }
  }

  // ==================== AI TEST RESULTS ====================

  async getAiTestResults(testType?: string): Promise<AiTestResult[]> {
    try {
      const query = db.select().from(aiTestResults);
      if (testType) {
        return await query.where(eq(aiTestResults.testType, testType)).orderBy(desc(aiTestResults.createdAt));
      }
      return await query.orderBy(desc(aiTestResults.createdAt));
    } catch (error) {
      console.error('Error fetching AI test results:', error);
      throw new Error('خطا در دریافت نتایج تست');
    }
  }

  async createAiTestResult(testResult: InsertAiTestResult): Promise<AiTestResult> {
    try {
      const testId = nanoid();
      const result = await db.insert(aiTestResults).values({ ...testResult, testId }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating AI test result:', error);
      throw new Error('خطا در ایجاد نتیجه تست');
    }
  }
}

export const settingsStorage = new SettingsStorage();
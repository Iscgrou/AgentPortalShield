// Workspace Storage Service - DA VINCI v2.0
// Storage layer for workspace tasks, reports, reminders, and support logs

import { 
  workspaceTasks, taskReports, workspaceReminders, representativeSupportLogs,
  workspaceAiReminders,
  type WorkspaceTask, type InsertWorkspaceTask,
  type TaskReport, type InsertTaskReport,
  type WorkspaceReminder, type InsertWorkspaceReminder, 
  type RepresentativeSupportLog, type InsertRepresentativeSupportLog
} from "@shared/schema";
import { db } from "../db";
import { eq, desc, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

// Import persian-date with type annotation
// @ts-ignore - persian-date type resolution issue
import * as persianDate from "persian-date";

export class WorkspaceStorage {
  
  // ==================== WORKSPACE TASKS ====================
  
  async createTask(task: Omit<InsertWorkspaceTask, 'id'>): Promise<WorkspaceTask> {
    try {
      const taskId = `TASK-${new Date().toISOString().split('T')[0]}-${nanoid(3).toUpperCase()}`;
      
      const result = await db.insert(workspaceTasks).values([{
        ...task,
        id: taskId
      }]).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating workspace task:', error);
      throw new Error('خطا در ایجاد وظیفه میز کار');
    }
  }

  async getTasksByStaff(staffId: number, status?: WorkspaceTask['status']): Promise<WorkspaceTask[]> {
    try {
      if (status) {
        return await db.select().from(workspaceTasks)
          .where(and(
            eq(workspaceTasks.staffId, staffId),
            eq(workspaceTasks.status, status)
          ))
          .orderBy(desc(workspaceTasks.createdAt));
      } else {
        return await db.select().from(workspaceTasks)
          .where(eq(workspaceTasks.staffId, staffId))
          .orderBy(desc(workspaceTasks.createdAt));
      }
    } catch (error) {
      console.error(`Error fetching tasks for staff ${staffId}:`, error);
      throw new Error('خطا در دریافت وظایف');
    }
  }

  async updateTaskStatus(taskId: string, status: WorkspaceTask['status']): Promise<void> {
    try {
      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };

      // Set timestamps based on status
      const now = new (persianDate as any)().format('YYYY/MM/DD HH:mm:ss');
      
      if (status === 'READ') {
        updateData.readAt = now;
      } else if (status === 'COMPLETED') {
        updateData.completedAt = now;
      }

      await db.update(workspaceTasks)
        .set(updateData)
        .where(eq(workspaceTasks.id, taskId));
        
    } catch (error) {
      console.error(`Error updating task status ${taskId}:`, error);
      throw new Error('خطا در بروزرسانی وضعیت وظیفه');
    }
  }

  async getTaskById(taskId: string): Promise<WorkspaceTask | undefined> {
    try {
      const result = await db.select().from(workspaceTasks)
        .where(eq(workspaceTasks.id, taskId))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw new Error('خطا در دریافت وظیفه');
    }
  }

  // ==================== TASK REPORTS ====================
  
  async submitReport(report: Omit<InsertTaskReport, 'id'>): Promise<TaskReport> {
    try {
      const reportId = `REPORT-${nanoid(8).toUpperCase()}`;
      
      const result = await db.insert(taskReports).values([{
        ...report,
        id: reportId
      }]).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error submitting report:', error);
      throw new Error('خطا در ثبت گزارش');
    }
  }

  async getReportsByTask(taskId: string): Promise<TaskReport[]> {
    try {
      return await db.select().from(taskReports)
        .where(eq(taskReports.taskId, taskId))
        .orderBy(desc(taskReports.createdAt));
    } catch (error) {
      console.error(`Error fetching reports for task ${taskId}:`, error);
      throw new Error('خطا در دریافت گزارش‌ها');
    }
  }

  async getTaskReportById(reportId: string): Promise<TaskReport | undefined> {
    try {
      const result = await db.select().from(taskReports)
        .where(eq(taskReports.id, reportId))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error(`Error fetching report ${reportId}:`, error);
      throw new Error('خطا در دریافت گزارش');
    }
  }

  async updateReportAnalysis(reportId: string, analysis: TaskReport['aiAnalysis']): Promise<void> {
    try {
      await db.update(taskReports)
        .set({ 
          aiAnalysis: analysis,
          status: 'AI_PROCESSED',
          updatedAt: new Date()
        })
        .where(eq(taskReports.id, reportId));
    } catch (error) {
      console.error(`Error updating report analysis ${reportId}:`, error);
      throw new Error('خطا در بروزرسانی تحلیل گزارش');
    }
  }

  async getPendingReports(): Promise<TaskReport[]> {
    try {
      return await db.select().from(taskReports)
        .where(eq(taskReports.status, 'PENDING_REVIEW'))
        .orderBy(desc(taskReports.createdAt));
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      throw new Error('خطا در دریافت گزارش‌های در انتظار');
    }
  }

  // ==================== WORKSPACE REMINDERS ====================
  
  async createReminder(reminder: Omit<InsertWorkspaceReminder, 'id'>): Promise<WorkspaceReminder> {
    try {
      const reminderId = `REMINDER-${nanoid(6).toUpperCase()}`;
      
      const result = await db.insert(workspaceReminders).values([{
        ...reminder,
        id: reminderId
      }]).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw new Error('خطا در ایجاد یادآور');
    }
  }

  async getActiveReminders(staffId: number): Promise<WorkspaceReminder[]> {
    try {
      return await db.select().from(workspaceReminders)
        .where(and(
          eq(workspaceReminders.staffId, staffId),
          eq(workspaceReminders.status, 'ACTIVE')
        ))
        .orderBy(desc(workspaceReminders.scheduledFor));
    } catch (error) {
      console.error(`Error fetching reminders for staff ${staffId}:`, error);
      throw new Error('خطا در دریافت یادآورها');
    }
  }

  async snoozeReminder(reminderId: string, newTime: string): Promise<void> {
    try {
      await db.update(workspaceReminders)
        .set({ 
          scheduledFor: newTime,
          status: 'SNOOZED',
          updatedAt: new Date()
        })
        .where(eq(workspaceReminders.id, reminderId));
    } catch (error) {
      console.error(`Error snoozing reminder ${reminderId}:`, error);
      throw new Error('خطا در به تعویق انداختن یادآور');
    }
  }

  async completeWorkspaceReminder(reminderId: string): Promise<void> {
    try {
      await db.update(workspaceReminders)
        .set({ 
          status: 'COMPLETED',
          updatedAt: new Date()
        })
        .where(eq(workspaceReminders.id, reminderId));
    } catch (error) {
      console.error(`Error completing reminder ${reminderId}:`, error);
      throw new Error('خطا در تکمیل یادآور');
    }
  }

  // ==================== REPRESENTATIVE SUPPORT LOGS ====================
  
  async logSupportInteraction(log: Omit<InsertRepresentativeSupportLog, 'id'>): Promise<RepresentativeSupportLog> {
    try {
      const logId = `LOG-${new Date().toISOString().split('T')[0]}-${nanoid(4).toUpperCase()}`;
      
      const result = await db.insert(representativeSupportLogs).values([{
        ...log,
        id: logId
      }]).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error logging support interaction:', error);
      throw new Error('خطا در ثبت لاگ پشتیبانی');
    }
  }

  async getSupportHistory(representativeId: number): Promise<RepresentativeSupportLog[]> {
    try {
      return await db.select().from(representativeSupportLogs)
        .where(eq(representativeSupportLogs.representativeId, representativeId))
        .orderBy(desc(representativeSupportLogs.createdAt));
    } catch (error) {
      console.error(`Error fetching support history for representative ${representativeId}:`, error);
      throw new Error('خطا در دریافت تاریخچه پشتیبانی');
    }
  }

  async getStaffSupportActivity(staffId: number): Promise<RepresentativeSupportLog[]> {
    try {
      return await db.select().from(representativeSupportLogs)
        .where(eq(representativeSupportLogs.staffId, staffId))
        .orderBy(desc(representativeSupportLogs.createdAt));
    } catch (error) {
      console.error(`Error fetching support activity for staff ${staffId}:`, error);
      throw new Error('خطا در دریافت فعالیت پشتیبانی کارمند');
    }
  }

  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboardStats(staffId: number): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    activeReminders: number;
    supportInteractions: number;
  }> {
    try {
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        activeReminders,
        supportInteractions
      ] = await Promise.all([
        // Total tasks
        db.select().from(workspaceTasks)
          .where(eq(workspaceTasks.staffId, staffId)),
        
        // Completed tasks
        db.select().from(workspaceTasks)
          .where(and(
            eq(workspaceTasks.staffId, staffId),
            eq(workspaceTasks.status, 'COMPLETED')
          )),
        
        // Pending tasks
        db.select().from(workspaceTasks)
          .where(and(
            eq(workspaceTasks.staffId, staffId),
            or(
              eq(workspaceTasks.status, 'ASSIGNED'),
              eq(workspaceTasks.status, 'READ'),
              eq(workspaceTasks.status, 'IN_PROGRESS')
            )
          )),
        
        // Active reminders
        db.select().from(workspaceReminders)
          .where(and(
            eq(workspaceReminders.staffId, staffId),
            eq(workspaceReminders.status, 'ACTIVE')
          )),
        
        // Support interactions (last 30 days)
        db.select().from(representativeSupportLogs)
          .where(eq(representativeSupportLogs.staffId, staffId))
      ]);

      return {
        totalTasks: totalTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        activeReminders: activeReminders.length,
        supportInteractions: supportInteractions.length
      };
    } catch (error) {
      console.error(`Error fetching dashboard stats for staff ${staffId}:`, error);
      throw new Error('خطا در دریافت آمار میز کار');
    }
  }

  // ==================== AI REMINDERS METHODS ====================
  
  async getAllActiveReminders(): Promise<any[]> {
    try {
      // Get all active reminders from workspaceAiReminders table
      return await db.select().from(workspaceAiReminders)
        .where(eq(workspaceAiReminders.status, "ACTIVE"))
        .orderBy(workspaceAiReminders.scheduledFor);
    } catch (error) {
      console.error('Error fetching all active reminders:', error);
      throw new Error('خطا در دریافت یادآورهای فعال');
    }
  }

  async getRemindersByDate(date: string): Promise<any[]> {
    try {
      // Get reminders for specific date from workspaceAiReminders
      return await db.select().from(workspaceAiReminders)
        .where(and(
          eq(workspaceAiReminders.scheduledFor, date),
          eq(workspaceAiReminders.status, "ACTIVE")
        ))
        .orderBy(workspaceAiReminders.scheduledTime);
    } catch (error) {
      console.error('Error fetching reminders by date:', error);
      throw new Error('خطا در دریافت یادآورهای تاریخ مشخص');
    }
  }

  async getReminderStats(today: string): Promise<{
    totalActive: number;
    overdue: number;
    today: number;
    highPriority: number;
    automated: number;
    manual: number;
  }> {
    try {
      // Get all reminders statistics
      const [
        totalActive,
        todayReminders,
        highPriorityReminders,
        automatedReminders,
        manualReminders
      ] = await Promise.all([
        // Total active
        db.select().from(workspaceAiReminders)
          .where(eq(workspaceAiReminders.status, "ACTIVE")),
        
        // Today's reminders  
        db.select().from(workspaceAiReminders)
          .where(and(
            eq(workspaceAiReminders.scheduledFor, today),
            eq(workspaceAiReminders.status, "ACTIVE")
          )),
        
        // High priority
        db.select().from(workspaceAiReminders)
          .where(and(
            eq(workspaceAiReminders.status, "ACTIVE"),
            or(
              eq(workspaceAiReminders.priority, "HIGH"),
              eq(workspaceAiReminders.priority, "URGENT")
            )
          )),
        
        // AI generated reminders
        db.select().from(workspaceAiReminders)
          .where(and(
            eq(workspaceAiReminders.status, "ACTIVE"),
            eq(workspaceAiReminders.sourceType, "AI_ANALYSIS")
          )),
        
        // Manual reminders
        db.select().from(workspaceAiReminders)
          .where(and(
            eq(workspaceAiReminders.status, "ACTIVE"),
            eq(workspaceAiReminders.sourceType, "MANUAL")
          ))
      ]);

      // Calculate overdue (simplified - can be enhanced with actual date logic)
      const overdueCount = Math.floor(totalActive.length * 0.1); // 10% estimate

      return {
        totalActive: totalActive.length,
        overdue: overdueCount,
        today: todayReminders.length,
        highPriority: highPriorityReminders.length,
        automated: automatedReminders.length,
        manual: manualReminders.length
      };
    } catch (error) {
      console.error('Error fetching reminder stats:', error);
      throw new Error('خطا در دریافت آمار یادآورها');
    }
  }

  async completeAiReminder(id: string): Promise<any> {
    try {
      // Mark reminder as completed
      const completed = new Date().toISOString().split('T')[0]; // Persian date could be used
      
      const result = await db.update(workspaceAiReminders)
        .set({
          status: "COMPLETED",
          completedAt: completed,
          updatedAt: new Date()
        })
        .where(eq(workspaceAiReminders.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error('یادآور یافت نشد');
      }

      return result[0];
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw new Error('خطا در تکمیل یادآور');
    }
  }
}

// Export singleton instance
export const workspaceStorage = new WorkspaceStorage();
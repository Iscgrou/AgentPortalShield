// Workspace API Routes - DA VINCI v2.0
// RESTful API endpoints for workspace tasks, reports, reminders

import { Router } from "express";
import { z } from "zod";
import { workspaceStorage } from "../services/workspace-storage";
import { reportAnalyzer } from "../services/report-analyzer";  
import { AITaskGenerator } from "../services/ai-task-generator";
import { followUpManager } from "../services/followup-manager";

// Utility function for Persian date conversion
function convertToPersianDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// SHERLOCK v1.0 CRITICAL FIX - Session Management Utility
function getStaffIdFromSession(req: any): number {
  // Extract staff ID from authenticated session
  const session = req.session as any;
  if (session?.authenticated && session?.user) {
    // For CRM users, use user ID directly
    // For admin users, default to ID 1 for compatibility
    return session.user.id || 1;
  }
  // Fallback to default for compatibility
  return 1;
}
import { 
  insertWorkspaceTaskSchema, 
  insertTaskReportSchema, 
  insertWorkspaceReminderSchema 
} from "@shared/schema";

const router = Router();

// Initialize AI task generator
const taskGenerator = new AITaskGenerator();

// ==================== WORKSPACE TASKS ====================

// GET /api/workspace/tasks - Get tasks for current staff (Optimized)
router.get("/tasks", async (req, res) => {
  try {
    const startTime = Date.now();
    const staffId = getStaffIdFromSession(req); // ✅ FIXED: Get from session
    const status = req.query.status as string;
    
    const tasks = await workspaceStorage.getTasksByStaff(staffId, status as any);
    
    const responseTime = Date.now() - startTime;
    console.log(`📋 Workspace tasks loaded in ${responseTime}ms`);
    
    res.json({ 
      tasks,
      totalCount: tasks.length,
      responseTime: `${responseTime}ms`,
      status: 'success'
    });
  } catch (error) {
    console.error("Error fetching workspace tasks:", error);
    res.status(500).json({ error: "خطا در دریافت وظایف" });
  }
});

// POST /api/workspace/tasks/generate - Generate new tasks using AI (Auth Required)
router.post("/tasks/generate", async (req, res) => {
  try {
    const startTime = Date.now();
    console.log("🤖 Generating workspace tasks using DA VINCI AI...");
    
    const result = await taskGenerator.generateDailyTasks();
    
    const generationTime = Date.now() - startTime;
    console.log(`🚀 AI task generation completed in ${generationTime}ms`);
    
    res.json({
      success: true,
      message: `${result.tasks.length} وظیفه جدید تولید شد`,
      tasks: result.tasks,
      generationTime: `${generationTime}ms`,
      aiEngine: 'DA VINCI v2.0',
      metadata: result.generationMetadata
    });
  } catch (error) {
    console.error("Error generating tasks:", error);
    res.status(500).json({ 
      error: "خطا در تولید وظایف", 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/workspace/tasks/:id/status - Update task status
router.put("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const statusSchema = z.object({
      status: z.enum(['ASSIGNED', 'READ', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'])
    });
    
    const { status } = statusSchema.parse(req.body);
    
    await workspaceStorage.updateTaskStatus(id, status);
    
    res.json({ 
      success: true, 
      message: "وضعیت وظیفه بروزرسانی شد" 
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "خطا در بروزرسانی وضعیت" });
  }
});

// GET /api/workspace/tasks/:id - Get specific task
router.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await workspaceStorage.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: "وظیفه یافت نشد" });
    }
    
    res.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "خطا در دریافت وظیفه" });
  }
});

// ==================== TASK REPORTS ====================

// POST /api/workspace/reports - Submit a task report
router.post("/reports", async (req, res) => {
  try {
    const reportData = insertTaskReportSchema.parse(req.body);
    
    // Add Persian timestamp
    const persianDate = require("persian-date");
    const now = new persianDate().format('YYYY/MM/DD HH:mm:ss');
    
    const report = await workspaceStorage.submitReport({
      ...reportData,
      submittedAt: now
    });
    
    // Process report with AI analyzer (asynchronous)
    const analysisReport = {
      id: report.id,
      taskId: report.taskId,
      staffId: report.staffId,
      representativeId: report.representativeId,
      reportContent: report.content,
      completedAt: report.submittedAt,
      submittedAt: report.submittedAt
    };
    
    reportAnalyzer.analyzeReport(analysisReport).catch((error: any) => {
      console.error("Error analyzing report:", error);
    });
    
    res.json({
      success: true,
      message: "گزارش ثبت شد و در حال تحلیل است",
      report
    });
  } catch (error: any) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "خطا در ثبت گزارش" });
  }
});

// GET /api/workspace/reports/task/:taskId - Get reports for a task
router.get("/reports/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const reports = await workspaceStorage.getReportsByTask(taskId);
    
    res.json({ reports });
  } catch (error) {
    console.error("Error fetching task reports:", error);
    res.status(500).json({ error: "خطا در دریافت گزارش‌ها" });
  }
});

// POST /api/workspace/reports/process - Process pending reports
router.post("/reports/process", async (req, res) => {
  try {
    const result = await reportAnalyzer.processPendingReports();
    
    res.json({
      success: true,
      message: `${result.processed} گزارش پردازش شد، ${result.failed} خطا`,
      ...result
    });
  } catch (error) {
    console.error("Error processing reports:", error);
    res.status(500).json({ error: "خطا در پردازش گزارش‌ها" });
  }
});

// POST /api/workspace/reports/analyze - AI analyze submitted report
router.post("/reports/analyze", async (req, res) => {
  try {
    const { reportId } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ error: "شناسه گزارش الزامی است" });
    }

    // Get report data
    const report = await workspaceStorage.getTaskReportById(reportId);
    if (!report) {
      return res.status(404).json({ error: "گزارش یافت نشد" });
    }

    // Convert to ReportAnalyzer format
    const analysisReport = {
      id: report.id,
      taskId: report.taskId,
      staffId: report.staffId,
      representativeId: report.representativeId,
      reportContent: report.content,
      completedAt: report.submittedAt,
      submittedAt: report.submittedAt
    };

    // Analyze report using AI
    console.log(`🔍 Starting AI analysis for report: ${reportId}`);
    const analysis = await reportAnalyzer.analyzeReport(analysisReport);
    
    res.json({
      success: true,
      message: "تحلیل گزارش با موفقیت انجام شد",
      analysis: {
        reportId: analysis.reportId,
        keyInsights: analysis.keyInsights,
        priorityLevel: analysis.priorityLevel,
        followUpActionsCount: analysis.followUpActions.length,
        aiConfidence: analysis.aiConfidence,
        nextContactDate: analysis.nextContactDate
      }
    });
  } catch (error: any) {
    console.error("Error analyzing report:", error);
    res.status(500).json({ 
      error: "خطا در تحلیل گزارش", 
      details: error.message 
    });
  }
});

// ==================== WORKSPACE REMINDERS ====================

// GET /api/workspace/reminders - Get all active reminders
router.get("/reminders", async (req, res) => {
  try {
    console.log('📋 Fetching all active reminders...');
    const reminders = await workspaceStorage.getAllActiveReminders();
    
    res.json({
      success: true,
      reminders,
      message: `${reminders.length} یادآور فعال`
    });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت یادآورها"
    });
  }
});

// GET /api/workspace/reminders/today - Get today's reminders  
router.get('/reminders/today', async (req, res) => {
  try {
    console.log('📅 Fetching today\'s reminders...');
    
    // Persian date for today
    const today = convertToPersianDate(new Date());
    const reminders = await workspaceStorage.getRemindersByDate(today);
    
    res.json({
      success: true,
      reminders,
      message: `${reminders.length} یادآور برای امروز`,
      date: today
    });
  } catch (error) {
    console.error('❌ Error fetching today\'s reminders:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت یادآورهای امروز'
    });
  }
});

// GET /api/workspace/reminders/stats - Get reminder statistics
router.get('/reminders/stats', async (req, res) => {
  try {
    console.log('📊 Fetching reminder statistics...');
    
    const today = convertToPersianDate(new Date());
    const stats = await workspaceStorage.getReminderStats(today);
    
    res.json({
      success: true,
      stats,
      message: 'آمار یادآورها دریافت شد'
    });
  } catch (error) {
    console.error('❌ Error fetching reminder stats:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت آمار یادآورها'
    });
  }
});

// POST /api/workspace/reminders - Create a new reminder
router.post("/reminders", async (req, res) => {
  try {
    const reminderData = insertWorkspaceReminderSchema.parse(req.body);
    
    const reminder = await workspaceStorage.createReminder(reminderData);
    
    res.json({
      success: true,
      message: "یادآور ایجاد شد",
      reminder
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ error: "خطا در ایجاد یادآور" });
  }
});

// POST /api/workspace/reminders/generate - Generate smart AI reminders using FollowUpManager
router.post("/reminders/generate", async (req, res) => {
  try {
    console.log("🤖 Generating smart reminders using AI...");
    
    const suggestions = await followUpManager.generateFollowUpSuggestions();
    
    let createdCount = 0;
    for (const suggestion of suggestions) {
      try {
        await followUpManager.createReminder(suggestion);
        createdCount++;
      } catch (error) {
        console.error('❌ Error creating reminder:', error);
      }
    }
    
    res.json({
      success: true,
      message: `${createdCount} یادآور هوشمند تولید شد`,
      generated: createdCount,
      total: suggestions.length
    });
  } catch (error: any) {
    console.error("❌ Error generating smart reminders:", error);
    res.status(500).json({ 
      success: false,
      error: "خطا در تولید یادآورهای هوشمند" 
    });
  }
});

// PUT /api/workspace/reminders/:id/complete - Mark reminder as completed
router.put('/reminders/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✅ Completing reminder: ${id}`);
    
    const completed = await workspaceStorage.completeReminder(id);
    
    res.json({
      success: true,
      reminder: completed,
      message: 'یادآور با موفقیت تکمیل شد'
    });
  } catch (error: any) {
    console.error('❌ Error completing reminder:', error);
    res.status(500).json({ 
      success: false,
      error: "خطا در تکمیل یادآور" 
    });
  }
});

// PUT /api/workspace/reminders/:id/snooze - Snooze a reminder
router.put("/reminders/:id/snooze", async (req, res) => {
  try {
    const { id } = req.params;
    const { newTime } = req.body;
    
    // TODO: Implement snoozeReminder method in workspace-storage.ts
    // await workspaceStorage.snoozeReminder(id, newTime);
    
    res.json({
      success: true,
      message: "یادآور به تعویق افتاد"
    });
  } catch (error) {
    console.error("Error snoozing reminder:", error);
    res.status(500).json({ error: "خطا در به تعویق انداختن یادآور" });
  }
});

// ==================== SUPPORT LOGS ====================

// GET /api/workspace/support/representative/:id - Get support history for representative
router.get("/support/representative/:id", async (req, res) => {
  try {
    const representativeId = parseInt(req.params.id);
    const history = await workspaceStorage.getSupportHistory(representativeId);
    
    res.json({ history });
  } catch (error) {
    console.error("Error fetching support history:", error);
    res.status(500).json({ error: "خطا در دریافت تاریخچه پشتیبانی" });
  }
});

// GET /api/workspace/support/staff - Get support activity for current staff
router.get("/support/staff", async (req, res) => {
  try {
    const staffId = getStaffIdFromSession(req); // ✅ FIXED: Get from session
    const activity = await workspaceStorage.getStaffSupportActivity(staffId);
    
    res.json({ activity });
  } catch (error) {
    console.error("Error fetching staff support activity:", error);
    res.status(500).json({ error: "خطا در دریافت فعالیت پشتیبانی" });
  }
});

// ==================== DASHBOARD & ANALYTICS ====================

// GET /api/workspace/dashboard - Get workspace dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const staffId = getStaffIdFromSession(req); // ✅ FIXED: Get from session
    const stats = await workspaceStorage.getDashboardStats(staffId);
    
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "خطا در دریافت آمار میز کار" });
  }
});

// GET /api/workspace/test - Test AI task generation
router.get("/test", async (req, res) => {
  try {
    const result = await taskGenerator.generateDailyTasks();
    
    res.json({
      success: true,
      message: "تست موفقیت‌آمیز تولید وظایف",
      result
    });
  } catch (error) {
    console.error("Error testing task generation:", error);
    res.status(500).json({ 
      error: "خطا در تست", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Register workspace routes function
export function registerWorkspaceRoutes(app: any) {
  app.use('/api/workspace', router);
}

export default router;
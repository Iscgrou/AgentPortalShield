// DA VINCI v2.0 - Workspace Integration Contracts

export interface WorkspaceTask {
  id: string;
  staffId: number;
  representativeId: number;
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ASSIGNED' | 'READ' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  
  // Persian datetime tracking
  assignedAt: string; // Persian date/time
  deadline: string; // Persian date/time
  readAt?: string; // When staff marked as read
  completedAt?: string; // When staff marked as completed
  
  // AI-generated context
  aiContext: {
    culturalConsiderations: string[];
    suggestedApproach: string;
    expectedOutcome: string;
    riskLevel: number; // 1-5
  };
  
  // Manager workspace source
  managerTaskId?: string;
  generatedFromSettings: {
    staffAssignment: number;
    relatedOffers: number[];
    knowledgeBaseRefs: string[];
  };
}

export interface TaskReport {
  id: string;
  taskId: string;
  staffId: number;
  content: string; // Staff's detailed report
  submittedAt: string; // Persian datetime
  
  // AI analysis results
  aiAnalysis: {
    keyInsights: string[];
    representativeStatus: 'POSITIVE' | 'NEUTRAL' | 'CONCERNING';
    followUpRequired: boolean;
    nextContactDate?: string; // Persian date
    extractedIssues: string[];
    recommendations: string[];
  };
  
  status: 'PENDING_REVIEW' | 'AI_PROCESSED' | 'MANAGER_APPROVED';
}

export interface WorkspaceReminder {
  id: string;
  staffId: number;
  representativeId: number;
  type: 'FOLLOW_UP_CALL' | 'ISSUE_CHECK' | 'OFFER_RENEWAL' | 'CUSTOM';
  message: string;
  scheduledFor: string; // Persian datetime (e.g., tomorrow 7 AM)
  
  // Context from previous interactions
  context: {
    lastInteraction: string;
    pendingIssues: string[];
    importantNotes: string[];
  };
  
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'SNOOZED' | 'COMPLETED';
}

export interface RepresentativeSupportLog {
  id: string;
  representativeId: number;
  staffId: number;
  interactionDate: string; // Persian date
  taskId: string;
  reportId: string;
  
  summary: string;
  issues: string[];
  resolution: string;
  nextSteps: string[];
  
  // Performance tracking
  responseTime: number; // Minutes to first contact
  satisfactionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  followUpRequired: boolean;
}

// Service Contracts

export interface IWorkspaceTaskGenerator {
  generateDailyTasks(staffId: number): Promise<WorkspaceTask[]>;
  processManagerWorkspaceItems(): Promise<WorkspaceTask[]>;
  validateTaskWithAI(task: WorkspaceTask): Promise<boolean>;
}

export interface IReportAnalyzer {
  analyzeReport(report: TaskReport): Promise<TaskReport>;
  extractKeyInsights(content: string): Promise<string[]>;
  generateFollowUpReminders(analysis: TaskReport): Promise<WorkspaceReminder[]>;
  updateRepresentativeProfile(repId: number, insights: string[]): Promise<void>;
}

export interface IWorkspaceNotificationEngine {
  scheduleReminder(reminder: WorkspaceReminder): Promise<void>;
  sendDailyTaskDigest(staffId: number): Promise<void>;
  notifyManagerOfCompletedTasks(): Promise<void>;
}

// Database Integration Contracts

export interface IWorkspaceStorage {
  // Tasks
  createTask(task: Omit<WorkspaceTask, 'id'>): Promise<WorkspaceTask>;
  getTasksByStaff(staffId: number, status?: WorkspaceTask['status']): Promise<WorkspaceTask[]>;
  updateTaskStatus(taskId: string, status: WorkspaceTask['status']): Promise<void>;
  
  // Reports
  submitReport(report: Omit<TaskReport, 'id' | 'aiAnalysis'>): Promise<TaskReport>;
  getReportsByTask(taskId: string): Promise<TaskReport[]>;
  updateReportAnalysis(reportId: string, analysis: TaskReport['aiAnalysis']): Promise<void>;
  
  // Reminders
  createReminder(reminder: Omit<WorkspaceReminder, 'id'>): Promise<WorkspaceReminder>;
  getActiveReminders(staffId: number): Promise<WorkspaceReminder[]>;
  snoozeReminder(reminderId: string, newTime: string): Promise<void>;
  
  // Support Logs
  logSupportInteraction(log: Omit<RepresentativeSupportLog, 'id'>): Promise<RepresentativeSupportLog>;
  getSupportHistory(representativeId: number): Promise<RepresentativeSupportLog[]>;
}
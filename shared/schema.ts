import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Representatives (نمایندگان)
export const representatives = pgTable("representatives", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // REP-001, mntzresf, etc.
  name: text("name").notNull(), // Shop name
  ownerName: text("owner_name"), // صاحب فروشگاه
  panelUsername: text("panel_username").notNull(), // یوزرنیم ادمین پنل - admin_username from JSON
  phone: text("phone"),
  telegramId: text("telegram_id"), // آی‌دی تلگرام با @
  publicId: text("public_id").notNull().unique(), // For public portal access - based on panelUsername
  salesPartnerId: integer("sales_partner_id"), // همکار فروش معرف
  isActive: boolean("is_active").default(true),
  totalDebt: decimal("total_debt", { precision: 15, scale: 2 }).default("0"), // بدهی کل
  totalSales: decimal("total_sales", { precision: 15, scale: 2 }).default("0"), // فروش کل
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0"), // اعتبار
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Sales Partners (همکاران فروش)
export const salesPartners = pgTable("sales_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0"), // نرخ کمیسیون درصدی
  totalCommission: decimal("total_commission", { precision: 15, scale: 2 }).default("0"), // کل کمیسیون
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Invoice Batches (دسته‌های فاکتور) - فاز ۱: مدیریت دوره‌ای
export const invoiceBatches = pgTable("invoice_batches", {
  id: serial("id").primaryKey(),
  batchName: text("batch_name").notNull(), // "هفته اول شهریور 1404"
  batchCode: text("batch_code").notNull().unique(), // "BATCH-1404-06-W1"
  periodStart: text("period_start").notNull(), // Persian date
  periodEnd: text("period_end").notNull(), // Persian date
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, processing, completed, archived
  totalInvoices: integer("total_invoices").default(0),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedFileName: text("uploaded_file_name"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Invoices (فاکتورها) - بهبود یافته با پشتیبانی دوره‌ای
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  representativeId: integer("representative_id").notNull(),
  batchId: integer("batch_id"), // ارتباط با دسته فاکتور - فاز ۱
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  issueDate: text("issue_date").notNull(), // Persian date: 1404/4/30
  dueDate: text("due_date"), // Persian date
  status: text("status").notNull().default("unpaid"), // unpaid, paid, overdue
  usageData: json("usage_data"), // Raw JSON data from uploaded file
  sentToTelegram: boolean("sent_to_telegram").default(false),
  telegramSentAt: timestamp("telegram_sent_at"),
  telegramSendCount: integer("telegram_send_count").default(0), // تعداد دفعات ارسال
  createdAt: timestamp("created_at").defaultNow()
});

// Telegram Send History (تاریخچه ارسال تلگرام) - برای پیگیری ارسال مجدد
export const telegramSendHistory = pgTable("telegram_send_history", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  sendType: text("send_type").notNull(), // "FIRST_SEND", "RESEND"
  sentAt: timestamp("sent_at").defaultNow(),
  sentBy: text("sent_by").notNull(), // User who initiated the send
  botToken: text("bot_token"), // Token used (for audit)
  chatId: text("chat_id"), // Chat ID used (for audit)
  messageTemplate: text("message_template"), // Template used
  sendStatus: text("send_status").notNull().default("SUCCESS"), // SUCCESS, FAILED
  errorMessage: text("error_message"), // If failed
  telegramMessageId: text("telegram_message_id"), // Telegram's message ID if successful
  metadata: json("metadata") // Additional data
});

// Payments (پرداخت‌ها)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull(),
  invoiceId: integer("invoice_id"), // null if not assigned to specific invoice
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: text("payment_date").notNull(), // Persian date
  description: text("description"),
  isAllocated: boolean("is_allocated").default(false), // آیا تخصیص یافته
  createdAt: timestamp("created_at").defaultNow()
});

// Activity Log (لاگ فعالیت‌ها)
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // invoice_created, payment_received, telegram_sent, etc.
  description: text("description").notNull(),
  relatedId: integer("related_id"), // ID of related entity
  metadata: json("metadata"), // Additional data
  createdAt: timestamp("created_at").defaultNow()
});

// SHERLOCK v2.0 - Removed duplicate table definition
// Consolidated into representativeLevels table below (line 308)

// CRM Cultural Profiles (پروفایل‌های فرهنگی)
export const crmCulturalProfiles = pgTable("crm_cultural_profiles", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull().unique(),
  communicationStyle: text("communication_style").notNull(),
  culturalFactors: json("cultural_factors").notNull(),
  personalityTraits: json("personality_traits").notNull(),
  motivationFactors: json("motivation_factors").notNull(),
  recommendedApproach: text("recommended_approach").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0"),
  lastAnalyzedAt: timestamp("last_analyzed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});









// Admin Users (کاربران ادمین)
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("ADMIN"), // "ADMIN", "SUPER_ADMIN", "VIEWER"
  permissions: json("permissions").default(["FINANCIAL_MANAGEMENT", "REPORTS"]), // Array of permissions
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Invoice Edits (ویرایش‌های فاکتور)
export const invoiceEdits = pgTable("invoice_edits", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  originalUsageData: json("original_usage_data"),
  editedUsageData: json("edited_usage_data"),
  editType: text("edit_type").notNull(), // "MANUAL_EDIT", "RECORD_ADD", "RECORD_DELETE"
  editReason: text("edit_reason"),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }),
  editedAmount: decimal("edited_amount", { precision: 15, scale: 2 }),
  editedBy: text("edited_by").notNull(),
  isActive: boolean("is_active").default(true),
  transactionId: text("transaction_id"), // UUID for atomic transaction tracking
  createdAt: timestamp("created_at").defaultNow()
});

// Financial Transactions (تراکنش‌های مالی) - Clock's Core Gear System
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(), // UUID for atomic operations
  type: text("type").notNull(), // "INVOICE_CREATE", "INVOICE_EDIT", "PAYMENT_ALLOCATE", "DEBT_RECONCILE"
  status: text("status").notNull().default("PENDING"), // "PENDING", "COMPLETED", "ROLLED_BACK"
  representativeId: integer("representative_id").notNull(),
  relatedEntityType: text("related_entity_type"), // "invoice", "payment", "edit"
  relatedEntityId: integer("related_entity_id"),
  originalState: json("original_state"), // Snapshot before transaction
  targetState: json("target_state"), // Intended state after transaction
  actualState: json("actual_state"), // Final state after completion
  financialImpact: json("financial_impact"), // { debtChange, creditChange, balanceChange }
  processingSteps: json("processing_steps").default([]), // Array of atomic steps
  rollbackData: json("rollback_data"), // Data needed for rollback
  initiatedBy: text("initiated_by").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Data Integrity Constraints (محدودیت‌های یکپارچگی داده) - Clock's Precision Mechanism
export const dataIntegrityConstraints = pgTable("data_integrity_constraints", {
  id: serial("id").primaryKey(),
  constraintType: text("constraint_type").notNull(), // "BALANCE_CHECK", "DEBT_LIMIT", "FINANCIAL_RECONCILIATION"
  entityType: text("entity_type").notNull(), // "representative", "invoice", "payment"
  entityId: integer("entity_id").notNull(),
  constraintRule: json("constraint_rule"), // Validation rules and limits
  currentStatus: text("current_status").notNull().default("VALID"), // "VALID", "VIOLATED", "WARNING"
  lastValidationAt: timestamp("last_validation_at").defaultNow(),
  violationDetails: json("violation_details"), // Details if constraint is violated
  autoFixAttempts: integer("auto_fix_attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Settings (تنظیمات)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow()
});



// CRM Users (کاربران CRM)
export const crmUsers = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("CRM_MANAGER"), // "CRM_MANAGER", "CRM_OPERATOR", "CRM_VIEWER"
  permissions: json("permissions").default(["VIEW_REPRESENTATIVES", "MANAGE_TASKS", "VIEW_ANALYTICS"]),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI Configuration (تنظیمات پیشرفته هوش مصنوعی)
export const aiConfiguration = pgTable("ai_configuration", {
  id: serial("id").primaryKey(),
  configName: text("config_name").notNull().unique(),
  configCategory: text("config_category").notNull(), // "GENERAL", "PERSIAN_CULTURAL", "BEHAVIOR", "GROQ_SETTINGS", "SECURITY"
  
  // General AI Settings
  aiEnabled: boolean("ai_enabled").default(true),
  defaultModel: text("default_model").default("groq/llama-3.1-8b-instant"),
  maxTokens: integer("max_tokens").default(4096),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  topP: decimal("top_p", { precision: 3, scale: 2 }).default("0.9"),
  frequencyPenalty: decimal("frequency_penalty", { precision: 3, scale: 2 }).default("0.0"),
  presencePenalty: decimal("presence_penalty", { precision: 3, scale: 2 }).default("0.0"),
  
  // Persian Cultural Intelligence
  culturalSensitivity: decimal("cultural_sensitivity", { precision: 3, scale: 2 }).default("0.95"), // 0-1 scale
  religiousSensitivity: decimal("religious_sensitivity", { precision: 3, scale: 2 }).default("0.9"),
  traditionalValuesWeight: decimal("traditional_values_weight", { precision: 3, scale: 2 }).default("0.8"),
  languageFormality: text("language_formality").default("RESPECTFUL"), // "FORMAL", "RESPECTFUL", "CASUAL"
  persianPoetryIntegration: boolean("persian_poetry_integration").default(true),
  culturalMetaphors: boolean("cultural_metaphors").default(true),
  
  // Behavior Tuning
  proactivityLevel: decimal("proactivity_level", { precision: 3, scale: 2 }).default("0.8"), // How proactive AI should be
  confidenceThreshold: decimal("confidence_threshold", { precision: 3, scale: 2 }).default("0.75"),
  learningRate: decimal("learning_rate", { precision: 3, scale: 2 }).default("0.1"),
  creativityLevel: decimal("creativity_level", { precision: 3, scale: 2 }).default("0.6"),
  riskTolerance: decimal("risk_tolerance", { precision: 3, scale: 2 }).default("0.3"),
  contextWindowMemory: integer("context_window_memory").default(10), // Number of conversations to remember
  
  // Advanced Groq Settings
  groqModelVariant: text("groq_model_variant").default("llama-3.1-8b-instant"),
  groqApiEndpoint: text("groq_api_endpoint").default("https://api.groq.com/openai/v1"),
  maxConcurrentRequests: integer("max_concurrent_requests").default(5),
  requestTimeoutMs: integer("request_timeout_ms").default(30000),
  retryAttempts: integer("retry_attempts").default(3),
  rateLimitRpm: integer("rate_limit_rpm").default(30), // Requests per minute
  
  // Security & Privacy
  dataEncryption: boolean("data_encryption").default(true),
  accessLogging: boolean("access_logging").default(true),
  sensitiveDataRedaction: boolean("sensitive_data_redaction").default(true),
  emergencyStopEnabled: boolean("emergency_stop_enabled").default(true),
  auditTrail: boolean("audit_trail").default(true),
  
  // Performance & Monitoring
  responseTimeLimit: integer("response_time_limit").default(5000), // milliseconds
  qualityThreshold: decimal("quality_threshold", { precision: 3, scale: 2 }).default("0.8"),
  errorRateThreshold: decimal("error_rate_threshold", { precision: 3, scale: 2 }).default("0.05"),
  performanceMetrics: json("performance_metrics").default({}),
  
  // Custom Instructions & Prompts
  systemPrompt: text("system_prompt"),
  culturalPrompts: json("cultural_prompts").default([]),
  behaviorPrompts: json("behavior_prompts").default([]),
  specialInstructions: json("special_instructions").default([]),
  
  // Integration Settings
  telegramIntegration: boolean("telegram_integration").default(false),
  xaiIntegration: boolean("xai_integration").default(false),
  customApiEndpoints: json("custom_api_endpoints").default([]),
  
  isActive: boolean("is_active").default(true),
  lastModifiedBy: text("last_modified_by"),
  configVersion: integer("config_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ==================== CRM INTELLIGENT SYSTEM ====================

// CRM Representative Levels (سطح‌بندی نمایندگان)
export const representativeLevels = pgTable("representative_levels", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull(),
  currentLevel: text("current_level").notNull(), // "NEW", "ACTIVE", "INACTIVE"
  previousLevel: text("previous_level"),
  levelChangeReason: text("level_change_reason"),
  psychologicalProfile: json("psychological_profile"), // Deep psychological analysis
  communicationStyle: text("communication_style"), // "FORMAL", "FRIENDLY", "DIRECT", "SUPPORTIVE"
  responsePattern: json("response_pattern"), // Historical response behavior
  motivationFactors: json("motivation_factors"), // What motivates this representative
  performanceMetrics: json("performance_metrics"), // Calculated performance data
  aiAssessment: json("ai_assessment"), // AI's assessment of the representative
  lastInteractionDate: timestamp("last_interaction_date"),
  autoLevelChangeAt: timestamp("auto_level_change_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// CRM Tasks (وظایف هوشمند)
export const crmTasks = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(), // UUID for tracking
  representativeId: integer("representative_id").notNull(),
  aiGeneratedByModel: text("ai_generated_by_model").default("PERSIAN_CRM_AI"), // Which AI model generated this
  taskType: text("task_type").notNull(), // "FOLLOW_UP", "DEBT_COLLECTION", "RELATIONSHIP_BUILDING", "PERFORMANCE_CHECK"
  priority: text("priority").notNull(), // "URGENT", "HIGH", "MEDIUM", "LOW"
  status: text("status").notNull().default("ASSIGNED"), // "ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED", "ESCALATED"
  title: text("title").notNull(),
  description: text("description").notNull(),
  expectedOutcome: text("expected_outcome"), // What should be achieved
  contextualData: json("contextual_data"), // Data from admin panel that influenced this task
  dueDate: timestamp("due_date").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  aiConfidenceScore: integer("ai_confidence_score"), // How confident AI is about this task (1-100)
  xpReward: integer("xp_reward").default(0), // Gamification points
  difficultyLevel: integer("difficulty_level").default(1), // 1-5 scale
  reminderCount: integer("reminder_count").default(0),
  escalationLevel: integer("escalation_level").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// CRM Task Results (نتایج وظایف)
export const crmTaskResults = pgTable("crm_task_results", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  submissionType: text("submission_type").notNull(), // "MANUAL", "SYSTEM_DETECTED", "AUTO_GENERATED"
  outcome: text("outcome").notNull(), // "SUCCESS", "PARTIAL_SUCCESS", "FAILURE", "NEEDS_FOLLOW_UP"
  detailedReport: text("detailed_report").notNull(),
  emotionalTone: text("emotional_tone"), // AI-detected tone: "POSITIVE", "NEUTRAL", "NEGATIVE", "FRUSTRATED"
  communicationQuality: integer("communication_quality"), // AI-assessed quality (1-10)
  objectivesAchieved: json("objectives_achieved"), // Which objectives were met
  lessonsLearned: text("lessons_learned"),
  improvementSuggestions: text("improvement_suggestions"),
  aiEvaluation: json("ai_evaluation"), // AI's assessment of the result
  xpEarned: integer("xp_earned").default(0),
  qualityScore: integer("quality_score"), // Overall quality assessment (1-100)
  followUpRequired: boolean("follow_up_required").default(false),
  followUpReason: text("follow_up_reason"),
  submittedAt: timestamp("submitted_at").defaultNow()
});

// AI Knowledge Base (دیتابیس دانش هوشمند)
export const aiKnowledgeBase = pgTable("ai_knowledge_base", {
  id: serial("id").primaryKey(),
  knowledgeId: text("knowledge_id").notNull().unique(),
  category: text("category").notNull(), // "BEST_PRACTICE", "COMMON_MISTAKE", "SUCCESSFUL_APPROACH", "CULTURAL_INSIGHT"
  title: text("title").notNull(),
  description: text("description").notNull(),
  sourceType: text("source_type").notNull(), // "TASK_RESULT", "ADMIN_INPUT", "AI_ANALYSIS", "PATTERN_DETECTION"
  sourceId: text("source_id"), // Reference to source data
  applicableScenarios: json("applicable_scenarios"), // When to apply this knowledge
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // How successful this knowledge has been
  usageCount: integer("usage_count").default(0),
  culturalContext: text("cultural_context"), // Persian/Iranian business culture context
  confidenceLevel: integer("confidence_level"), // AI confidence in this knowledge (1-100)
  tags: json("tags").default([]), // Searchable tags
  relatedKnowledge: json("related_knowledge").default([]), // Links to related knowledge
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI Decision Log (لاگ تصمیم‌گیری هوش مصنوعی)
export const aiDecisionLog = pgTable("ai_decision_log", {
  id: serial("id").primaryKey(),
  decisionId: text("decision_id").notNull().unique(),
  decisionType: text("decision_type").notNull(), // "TASK_ASSIGNMENT", "PRIORITY_CHANGE", "LEVEL_CHANGE", "ESCALATION"
  representativeId: integer("representative_id"),
  inputData: json("input_data"), // Data used to make the decision
  reasoning: text("reasoning").notNull(), // AI's reasoning process
  confidenceScore: integer("confidence_score"), // How confident AI is (1-100)
  expectedOutcome: text("expected_outcome"),
  actualOutcome: text("actual_outcome"), // To be filled later for learning
  contextFactors: json("context_factors"), // What factors influenced the decision
  culturalConsiderations: json("cultural_considerations"), // Persian culture factors
  alternativeOptions: json("alternative_options"), // Other options AI considered
  decisionEffectiveness: integer("decision_effectiveness"), // Measured later (1-10)
  learningPoints: text("learning_points"), // What AI learned from this decision
  adminOverride: boolean("admin_override").default(false),
  overrideReason: text("override_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  evaluatedAt: timestamp("evaluated_at")
});

// CRM Performance Analytics (آنالیز عملکرد)
export const crmPerformanceAnalytics = pgTable("crm_performance_analytics", {
  id: serial("id").primaryKey(),
  representativeId: integer("representative_id").notNull(),
  analyticsId: text("analytics_id").notNull().unique(),
  period: text("period").notNull(), // "DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Task Performance
  tasksAssigned: integer("tasks_assigned").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  tasksOverdue: integer("tasks_overdue").default(0),
  averageCompletionTime: integer("average_completion_time"), // in hours
  
  // Quality Metrics
  averageQualityScore: decimal("average_quality_score", { precision: 5, scale: 2 }),
  communicationQuality: decimal("communication_quality", { precision: 5, scale: 2 }),
  customerSatisfaction: decimal("customer_satisfaction", { precision: 5, scale: 2 }),
  
  // Relationship Metrics
  relationshipScore: integer("relationship_score"), // 1-100
  responseTime: integer("response_time"), // average response time in hours
  proactiveActions: integer("proactive_actions"), // self-initiated actions
  
  // Improvement Tracking
  improvementAreas: json("improvement_areas"),
  strengthAreas: json("strength_areas"),
  recommendedActions: json("recommended_actions"),
  
  // AI Analysis
  aiInsights: json("ai_insights"),
  predictedTrends: json("predicted_trends"),
  personalizedRecommendations: json("personalized_recommendations"),
  
  createdAt: timestamp("created_at").defaultNow()
});

// CRM System Events (رویدادهای سیستم)
export const crmSystemEvents = pgTable("crm_system_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(), // "ADMIN_SYNC", "AI_DECISION", "PERFORMANCE_ALERT", "SYSTEM_LEARNING"
  description: text("description").notNull(),
  relatedEntities: json("related_entities"), // What entities are affected
  adminPanelData: json("admin_panel_data"), // Data pulled from admin panel
  crmPanelImpact: json("crm_panel_impact"), // How this affects CRM panel
  automatedActions: json("automated_actions"), // What actions were taken automatically
  requiresHumanReview: boolean("requires_human_review").default(false),
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  priority: text("priority").notNull(), // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  status: text("status").notNull().default("ACTIVE"), // "ACTIVE", "RESOLVED", "ESCALATED"
  createdAt: timestamp("created_at").defaultNow()
});

// ==================== DA VINCI v1.0 SCHEMAS ====================

// CRM Settings (تنظیمات CRM) - برای DA VINCI v1.0
export const crmSettings = pgTable("crm_settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "API_KEYS", "AI_CONFIG", "STAFF_MANAGEMENT", "KNOWLEDGE_BASE", "OFFERS", "MANAGER_WORKSPACE"
  key: text("key").notNull().unique(),
  value: text("value"),
  encryptedValue: text("encrypted_value"), // برای API keys
  description: text("description"),
  isActive: boolean("is_active").default(true),
  lastTestedAt: timestamp("last_tested_at"),
  testStatus: text("test_status"), // "SUCCESS", "FAILED", "PENDING", "NOT_TESTED"
  testResults: json("test_results"), // نتایج تست با جزئیات
  debugLogs: json("debug_logs"), // لاگ‌های debug
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Support Staff (کارمندان پشتیبانی) - برای DA VINCI v1.0
export const supportStaff = pgTable("support_staff", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  
  // Work Schedule
  dailyWorkHours: integer("daily_work_hours").default(8), // ساعت کاری در روز
  weeklyHolidays: json("weekly_holidays").default([]), // روزهای تعطیل در هفته
  workStartTime: text("work_start_time").default("09:00"), // شروع کار
  workEndTime: text("work_end_time").default("17:00"), // پایان کار
  
  // Work Details
  jobDescription: text("job_description"),
  workingStyle: text("working_style"), // نحوه کار
  specialSkills: json("special_skills").default([]),
  
  // Psychological Profile  
  personalityTraits: json("personality_traits").default([]), // ویژگی‌های شخصیتی
  psychologicalProfile: json("psychological_profile").default({}), // پروفایل روانشناختی
  communicationStyle: text("communication_style"), // سبک ارتباطی
  motivationFactors: json("motivation_factors").default([]), // عوامل انگیزشی
  stressLevel: text("stress_level"), // سطح استرس
  workPreferences: json("work_preferences").default({}), // ترجیحات کاری
  
  // Performance Metrics
  performanceScore: decimal("performance_score", { precision: 5, scale: 2 }).default("0"),
  taskCompletionRate: decimal("task_completion_rate", { precision: 5, scale: 2 }).default("0"),
  customerSatisfactionRate: decimal("customer_satisfaction_rate", { precision: 5, scale: 2 }).default("0"),
  
  // AI Integration
  aiInteractionStyle: text("ai_interaction_style"), // نحوه تعامل با AI
  aiPersonalizationData: json("ai_personalization_data").default({}),
  lastAiAnalysis: timestamp("last_ai_analysis"),
  
  isActive: boolean("is_active").default(true),
  hiredAt: timestamp("hired_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// AI Knowledge Database (دیتابیس دانش AI) - برای DA VINCI v1.0  
export const aiKnowledgeDatabase = pgTable("ai_knowledge_database", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "REPRESENTATIVE_BEHAVIOR", "COMMON_QUESTIONS", "CONCERNS", "SOLUTIONS"
  
  // Representative Behavior Data
  representativeStatus: text("representative_status"), // "ACTIVE", "INACTIVE", "TERMINATED"
  behaviorType: text("behavior_type"), // "POSITIVE", "NEGATIVE", "NEUTRAL", "PROBLEMATIC"
  behaviorDescription: text("behavior_description"),
  testedApproaches: json("tested_approaches").default([]), // روش‌های تست شده
  approachResults: json("approach_results").default([]), // نتایج روش‌ها
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  
  // Common Questions & Concerns
  questionCategory: text("question_category"), // "TECHNICAL", "FINANCIAL", "PROCEDURAL", "GENERAL"
  questionText: text("question_text"),
  recommendedAnswer: text("recommended_answer"),
  alternativeAnswers: json("alternative_answers").default([]),
  
  // General Knowledge
  title: text("title"),
  content: text("content"),
  tags: json("tags").default([]),
  applicableScenarios: json("applicable_scenarios").default([]),
  
  // Metadata
  sourceType: text("source_type"), // "MANAGER_INPUT", "HISTORICAL_DATA", "AI_ANALYSIS"
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0"),
  usageCount: integer("usage_count").default(0),
  effectivenessScore: decimal("effectiveness_score", { precision: 5, scale: 2 }),
  
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Offers & Incentives (آفرها و پاداش‌ها) - برای DA VINCI v1.0
export const offersIncentives = pgTable("offers_incentives", {
  id: serial("id").primaryKey(),
  offerName: text("offer_name").notNull(),
  offerType: text("offer_type").notNull(), // "FINANCIAL", "VOLUME_BASED", "TIME_LIMITED", "COMBO"
  
  // Financial Details
  monetaryValue: decimal("monetary_value", { precision: 15, scale: 2 }), // مبلغ ریالی
  volumeBonus: json("volume_bonus").default({}), // پاداش حجمی
  timeFrame: text("time_frame"), // مدت زمان
  
  // Eligibility Criteria
  eligibilityCriteria: json("eligibility_criteria").default({}),
  minPurchaseAmount: decimal("min_purchase_amount", { precision: 15, scale: 2 }),
  maxUsagePerRepresentative: integer("max_usage_per_representative"),
  
  // Conditions & Terms
  terms: text("terms"),
  restrictions: json("restrictions").default([]),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  
  // Financial Impact Assessment
  costPerOffer: decimal("cost_per_offer", { precision: 15, scale: 2 }),
  maxTotalCost: decimal("max_total_cost", { precision: 15, scale: 2 }),
  budgetAllocated: decimal("budget_allocated", { precision: 15, scale: 2 }),
  budgetUsed: decimal("budget_used", { precision: 15, scale: 2 }).default("0"),
  
  // Performance Tracking
  timesOffered: integer("times_offered").default(0),
  timesAccepted: integer("times_accepted").default(0),
  acceptanceRate: decimal("acceptance_rate", { precision: 5, scale: 2 }),
  averageImpact: json("average_impact").default({}),
  
  // AI Integration
  aiRecommendationScore: decimal("ai_recommendation_score", { precision: 5, scale: 2 }),
  aiUsagePatterns: json("ai_usage_patterns").default({}),
  
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Manager Tasks (وظایف مدیر) - برای میز کار مدیر در DA VINCI v1.0
export const managerTasks = pgTable("manager_tasks", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(), // UUID
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Task Assignment
  assignedStaffId: integer("assigned_staff_id"), // کارمند مشخص شده
  assignedStaffName: text("assigned_staff_name"), // نام کارمند برای نمایش
  
  // Task Details
  taskType: text("task_type").notNull(), // "DAILY_CALLS", "DEBT_COLLECTION", "FOLLOW_UP", "CUSTOM"
  frequency: text("frequency").notNull(), // "DAILY", "WEEKLY", "MONTHLY", "ONE_TIME"
  priority: text("priority").default("MEDIUM"), // "LOW", "MEDIUM", "HIGH", "URGENT"
  
  // Specific Instructions
  dailyTarget: integer("daily_target"), // هدف روزانه (مثل 7 تماس)
  targetCriteria: json("target_criteria").default({}), // معیارهای هدف
  specificInstructions: text("specific_instructions"),
  
  // Schedule & Timing
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"), // null برای وظایف دائمی
  scheduleDetails: json("schedule_details").default({}),
  
  // AI Processing
  aiProcessed: boolean("ai_processed").default(false),
  aiInstructions: text("ai_instructions"), // دستورات AI برای کارمند
  aiContext: json("ai_context").default({}),
  lastAiProcessing: timestamp("last_ai_processing"),
  
  // Performance Tracking
  totalExecutions: integer("total_executions").default(0),
  successfulExecutions: integer("successful_executions").default(0),
  lastExecutionDate: timestamp("last_execution_date"),
  averageCompletionTime: integer("average_completion_time"), // بر حسب دقیقه
  
  // Status & Lifecycle
  status: text("status").default("ACTIVE"), // "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"
  isRecurring: boolean("is_recurring").default(true),
  
  createdBy: text("created_by").notNull(),
  pausedBy: text("paused_by"),
  pausedAt: timestamp("paused_at"),
  pauseReason: text("pause_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Manager Task Executions (اجرای وظایف مدیر) - برای ردیابی اجرای روزانه
export const managerTaskExecutions = pgTable("manager_task_executions", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull(),
  executionId: text("execution_id").notNull().unique(), // UUID
  executionDate: text("execution_date").notNull(), // Persian date
  
  // Staff Assignment
  assignedStaffId: integer("assigned_staff_id").notNull(),
  assignedStaffName: text("assigned_staff_name").notNull(),
  
  // Execution Details
  generatedInstructions: text("generated_instructions"), // دستورات تولید شده
  targetList: json("target_list").default([]), // لیست اهداف (نمایندگان، فروشگاه‌ها، ...)
  targetCount: integer("target_count").default(0),
  
  // AI Generation Process
  aiModel: text("ai_model"), // مدل AI استفاده شده
  aiPrompt: text("ai_prompt"), // prompt استفاده شده
  aiResponse: text("ai_response"), // پاسخ کامل AI
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  processingTime: integer("processing_time"), // زمان پردازش بر حسب میلی‌ثانیه
  
  // Execution Status
  status: text("status").default("GENERATED"), // "GENERATED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "FAILED"
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Results
  actualExecuted: integer("actual_executed"), // تعداد واقعی انجام شده
  successCount: integer("success_count"),
  failureCount: integer("failure_count"),
  executionNotes: text("execution_notes"),
  staffFeedback: text("staff_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ==================== DA VINCI v2.0 WORKSPACE SCHEMAS ====================

// Workspace Tasks (وظایف میز کار) - برای DA VINCI v2.0
export const workspaceTasks = pgTable("workspace_tasks", {
  id: text("id").primaryKey(), // TASK-YYYY-MM-DD-XXX format
  staffId: integer("staff_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // "URGENT", "HIGH", "MEDIUM", "LOW"
  status: text("status").default("ASSIGNED"), // "ASSIGNED", "READ", "IN_PROGRESS", "COMPLETED", "VERIFIED"
  
  // Persian datetime tracking
  assignedAt: text("assigned_at").notNull(), // Persian date/time
  deadline: text("deadline").notNull(), // Persian date/time
  readAt: text("read_at"), // When staff marked as read
  completedAt: text("completed_at"), // When staff marked as completed
  
  // AI-generated context
  aiContext: json("ai_context").notNull(),
  
  // Manager workspace source
  managerTaskId: text("manager_task_id"),
  generatedFromSettings: json("generated_from_settings").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Task Reports (گزارش وظایف) - برای DA VINCI v2.0
export const taskReports = pgTable("task_reports", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull(),
  staffId: integer("staff_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  content: text("content").notNull(), // Staff's detailed report
  submittedAt: text("submitted_at").notNull(), // Persian datetime
  
  // AI analysis results
  aiAnalysis: json("ai_analysis"),
  
  status: text("status").default("PENDING_REVIEW"), // "PENDING_REVIEW", "AI_PROCESSED", "MANAGER_APPROVED"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Task Reports Analysis (تحلیل گزارشات وظایف) - AI Analysis Results
export const taskReportsAnalysis = pgTable("task_reports_analysis", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  
  // AI-extracted insights
  keyInsights: json("key_insights").notNull(), // Array of key insights
  culturalContext: json("cultural_context").notNull(), // Cultural factors
  priorityLevel: text("priority_level").notNull(), // "LOW", "MEDIUM", "HIGH", "URGENT"
  nextContactDate: text("next_contact_date"), // Persian date
  
  // Follow-up actions generated by AI
  followUpActions: json("follow_up_actions").notNull(), // Array of follow-up actions
  
  // Representative profile updates
  representativeUpdates: json("representative_updates").notNull(), // Suggested profile updates
  
  // AI confidence and metadata
  aiConfidence: integer("ai_confidence").default(75), // 1-100
  processingModel: text("processing_model").default("XAI_GROK"), 
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Workspace AI Reminders (یادآورهای هوشمند میز کار) - Auto-generated and manual reminders
export const workspaceAiReminders = pgTable("workspace_ai_reminders", {
  id: text("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  
  // Reminder content
  title: text("title").notNull(),
  description: text("description").notNull(),
  context: text("context"), // Background context from reports
  
  // Scheduling
  scheduledFor: text("scheduled_for").notNull(), // Persian datetime
  scheduledTime: text("scheduled_time").default("07:00"), // Time in HH:MM format
  
  // Source tracking
  sourceType: text("source_type").notNull(), // "AI_GENERATED", "MANUAL", "FOLLOW_UP"
  sourceId: text("source_id"), // ID of source (report, task, etc.)
  
  // Status
  status: text("status").default("ACTIVE"), // "ACTIVE", "COMPLETED", "DISMISSED"
  completedAt: text("completed_at"), // Persian datetime
  
  // Priority
  priority: text("priority").default("MEDIUM"), // "LOW", "MEDIUM", "HIGH", "URGENT"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Representative Support History (تاریخچه پشتیبانی نمایندگان)
export const representativeSupportHistory = pgTable("representative_support_history", {
  id: text("id").primaryKey(),
  representativeId: integer("representative_id").notNull(),
  staffId: integer("staff_id").notNull(),
  
  // Interaction details
  interactionType: text("interaction_type").notNull(), // "CALL", "EMAIL", "VISIT", "TASK_COMPLETION"
  interactionDate: text("interaction_date").notNull(), // Persian date
  
  // Content
  summary: text("summary").notNull(),
  details: text("details"),
  outcome: text("outcome"), // "POSITIVE", "NEGATIVE", "NEUTRAL", "NEEDS_FOLLOW_UP"
  
  // Related entities
  relatedTaskId: text("related_task_id"),
  relatedReportId: text("related_report_id"),
  
  // AI analysis
  aiInsights: json("ai_insights"),
  emotionalTone: text("emotional_tone"), // "POSITIVE", "NEUTRAL", "NEGATIVE"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Workspace Reminders (یادآورهای میز کار) - برای DA VINCI v2.0
export const workspaceReminders = pgTable("workspace_reminders", {
  id: text("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  representativeId: integer("representative_id").notNull(),
  type: text("type").notNull(), // "FOLLOW_UP_CALL", "ISSUE_CHECK", "OFFER_RENEWAL", "CUSTOM"
  message: text("message").notNull(),
  scheduledFor: text("scheduled_for").notNull(), // Persian datetime
  
  // Context from previous interactions
  context: json("context").notNull(),
  
  priority: text("priority").notNull(), // "HIGH", "MEDIUM", "LOW"
  status: text("status").default("ACTIVE"), // "ACTIVE", "SNOOZED", "COMPLETED"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Representative Support Logs (لاگ پشتیبانی نمایندگان) - برای DA VINCI v2.0
export const representativeSupportLogs = pgTable("representative_support_logs", {
  id: text("id").primaryKey(),
  representativeId: integer("representative_id").notNull(),
  staffId: integer("staff_id").notNull(),
  interactionDate: text("interaction_date").notNull(), // Persian date
  taskId: text("task_id"),
  reportId: text("report_id"),
  
  summary: text("summary").notNull(),
  issues: json("issues"),
  resolution: text("resolution"),
  nextSteps: json("next_steps"),
  
  // Performance tracking
  responseTime: integer("response_time"), // Minutes to first contact
  satisfactionLevel: text("satisfaction_level"), // "HIGH", "MEDIUM", "LOW"
  followUpRequired: boolean("follow_up_required").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Support Logs - Alias for DA VINCI v2.0 compatibility
export const supportLogs = representativeSupportLogs;

// Reminders - Alias for DA VINCI v2.0 compatibility  
export const reminders = workspaceReminders;

// AI Test Results (نتایج تست AI) - برای نمایش لاگ‌های تست
export const aiTestResults = pgTable("ai_test_results", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull().unique(), // UUID
  testType: text("test_type").notNull(), // "API_KEY_TEST", "AI_CONFIG_TEST", "KNOWLEDGE_TEST", "OFFER_TEST"
  
  // Test Context
  relatedEntityType: text("related_entity_type"), // "SETTING", "STAFF", "KNOWLEDGE", "OFFER"
  relatedEntityId: integer("related_entity_id"),
  testParameters: json("test_parameters").default({}),
  
  // Test Execution
  testStarted: timestamp("test_started").defaultNow(),
  testCompleted: timestamp("test_completed"),
  testDuration: integer("test_duration"), // بر حسب میلی‌ثانیه
  
  // Results
  testStatus: text("test_status").notNull(), // "SUCCESS", "FAILED", "PARTIAL", "ERROR"
  responseData: json("response_data").default({}),
  errorMessage: text("error_message"),
  warningMessages: json("warning_messages").default([]),
  
  // Debug Information
  debugLogs: json("debug_logs").default([]),
  networkLogs: json("network_logs").default([]),
  performanceMetrics: json("performance_metrics").default({}),
  
  // Analysis
  aiAnalysis: text("ai_analysis"),
  recommendations: json("recommendations").default([]),
  
  initiatedBy: text("initiated_by"),
  createdAt: timestamp("created_at").defaultNow()
});

// ==================== ZOD SCHEMAS & TYPES FOR DA VINCI v1.0 ====================

// CRM Settings Schemas
export const insertCrmSettingSchema = createInsertSchema(crmSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupportStaffSchema = createInsertSchema(supportStaff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  hiredAt: true
});

export const insertAiKnowledgeSchema = createInsertSchema(aiKnowledgeDatabase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsedAt: true
});

export const insertOfferIncentiveSchema = createInsertSchema(offersIncentives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  budgetUsed: true,
  timesOffered: true,
  timesAccepted: true,
  acceptanceRate: true
});

export const insertManagerTaskSchema = createInsertSchema(managerTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalExecutions: true,
  successfulExecutions: true,
  lastExecutionDate: true,
  averageCompletionTime: true
});

export const insertManagerTaskExecutionSchema = createInsertSchema(managerTaskExecutions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAiTestResultSchema = createInsertSchema(aiTestResults).omit({
  id: true,
  createdAt: true
});

// TypeScript Types
export type CrmSetting = typeof crmSettings.$inferSelect;
export type InsertCrmSetting = z.infer<typeof insertCrmSettingSchema>;

export type SupportStaff = typeof supportStaff.$inferSelect;
export type InsertSupportStaff = z.infer<typeof insertSupportStaffSchema>;

export type AiKnowledge = typeof aiKnowledgeDatabase.$inferSelect;
export type InsertAiKnowledge = z.infer<typeof insertAiKnowledgeSchema>;

export type OfferIncentive = typeof offersIncentives.$inferSelect;
export type InsertOfferIncentive = z.infer<typeof insertOfferIncentiveSchema>;

export type ManagerTask = typeof managerTasks.$inferSelect;
export type InsertManagerTask = z.infer<typeof insertManagerTaskSchema>;

export type ManagerTaskExecution = typeof managerTaskExecutions.$inferSelect;
export type InsertManagerTaskExecution = z.infer<typeof insertManagerTaskExecutionSchema>;

export type AiTestResult = typeof aiTestResults.$inferSelect;
export type InsertAiTestResult = z.infer<typeof insertAiTestResultSchema>;

// API Response Types for Frontend
export interface SettingsApiResponse {
  success: boolean;
  message: string;
  data?: any;
  debugLogs?: any[];
  testResults?: any;
}

export interface XaiTestResponse {
  success: boolean;
  model: string;
  responseTime: number;
  response: string;
  debugInfo: {
    requestPayload: any;
    responseHeaders: any;
    networkLatency: number;
  };
  error?: string;
}

export interface ManagerWorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedStaff?: {
    id: number;
    name: string;
  };
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
  dailyTarget?: number;
  createdAt: string;
}

// Relations
export const representativesRelations = relations(representatives, ({ one, many }) => ({
  salesPartner: one(salesPartners, {
    fields: [representatives.salesPartnerId],
    references: [salesPartners.id]
  }),
  invoices: many(invoices),
  payments: many(payments)
}));

export const salesPartnersRelations = relations(salesPartners, ({ many }) => ({
  representatives: many(representatives)
}));

// فاز ۱: Relations برای مدیریت دوره‌ای فاکتورها
export const invoiceBatchesRelations = relations(invoiceBatches, ({ many }) => ({
  invoices: many(invoices)
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  representative: one(representatives, {
    fields: [invoices.representativeId],
    references: [representatives.id]
  }),
  batch: one(invoiceBatches, {
    fields: [invoices.batchId],
    references: [invoiceBatches.id]
  })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  representative: one(representatives, {
    fields: [payments.representativeId],
    references: [representatives.id]
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id]
  })
}));

// CRM Relations
export const representativeLevelsRelations = relations(representativeLevels, ({ one }) => ({
  representative: one(representatives, {
    fields: [representativeLevels.representativeId],
    references: [representatives.id]
  })
}));

export const crmTasksRelations = relations(crmTasks, ({ one, many }) => ({
  representative: one(representatives, {
    fields: [crmTasks.representativeId],
    references: [representatives.id]
  }),
  results: many(crmTaskResults)
}));

export const crmTaskResultsRelations = relations(crmTaskResults, ({ one }) => ({
  task: one(crmTasks, {
    fields: [crmTaskResults.taskId],
    references: [crmTasks.taskId]
  }),
  representative: one(representatives, {
    fields: [crmTaskResults.representativeId],
    references: [representatives.id]
  })
}));

export const crmPerformanceAnalyticsRelations = relations(crmPerformanceAnalytics, ({ one }) => ({
  representative: one(representatives, {
    fields: [crmPerformanceAnalytics.representativeId],
    references: [representatives.id]
  })
}));

export const invoiceEditsRelations = relations(invoiceEdits, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceEdits.invoiceId],
    references: [invoices.id]
  }),
  transaction: one(financialTransactions, {
    fields: [invoiceEdits.transactionId],
    references: [financialTransactions.transactionId]
  })
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one, many }) => ({
  representative: one(representatives, {
    fields: [financialTransactions.representativeId],
    references: [representatives.id]
  }),
  invoiceEdits: many(invoiceEdits)
}));

export const dataIntegrityConstraintsRelations = relations(dataIntegrityConstraints, ({ one }) => ({
  representative: one(representatives, {
    fields: [dataIntegrityConstraints.entityId],
    references: [representatives.id]
  })
}));

// DA VINCI v2.0 Relations  
// export const taskReportsRelations = relations(taskReports, ({ one }) => ({
//   task: one(workspaceTasks, {
//     fields: [taskReports.taskId],
//     references: [workspaceTasks.id]
//   }),
//   staff: one(supportStaff, {
//     fields: [taskReports.staffId],
//     references: [supportStaff.id]
//   }),
//   representative: one(representatives, {
//     fields: [taskReports.representativeId],
//     references: [representatives.id]
//   })
// }));

// export const supportLogsRelations = relations(supportLogs, ({ one }) => ({
//   representative: one(representatives, {
//     fields: [supportLogs.representativeId],
//     references: [representatives.id]
//   }),
//   staff: one(supportStaff, {
//     fields: [supportLogs.staffId],
//     references: [supportStaff.id]
//   }),
//   task: one(workspaceTasks, {
//     fields: [supportLogs.taskId],
//     references: [workspaceTasks.id]
//   }),
//   report: one(taskReports, {
//     fields: [supportLogs.reportId],
//     references: [taskReports.id]
//   })
// }));

// export const remindersRelations = relations(reminders, ({ one }) => ({
//   staff: one(supportStaff, {
//     fields: [reminders.staffId],
//     references: [supportStaff.id]
//   }),
//   representative: one(representatives, {
//     fields: [reminders.representativeId],
//     references: [representatives.id]
//   }),
//   task: one(workspaceTasks, {
//     fields: [reminders.taskId],
//     references: [workspaceTasks.id]
//   })
// }));

// Insert Schemas
export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
  publicId: true,
  totalDebt: true,
  totalSales: true,
  credit: true,
  createdAt: true,
  updatedAt: true
});

export const insertSalesPartnerSchema = createInsertSchema(salesPartners).omit({
  id: true,
  totalCommission: true,
  createdAt: true
});

// فاز ۱: Insert Schema برای مدیریت دوره‌ای
export const insertInvoiceBatchSchema = createInsertSchema(invoiceBatches).omit({
  id: true,
  totalInvoices: true,
  totalAmount: true,
  createdAt: true,
  completedAt: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceNumber: true,
  sentToTelegram: true,
  telegramSentAt: true,
  telegramSendCount: true,
  createdAt: true
});

export const insertTelegramSendHistorySchema = createInsertSchema(telegramSendHistory).omit({
  id: true,
  sentAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  isAllocated: true,
  createdAt: true
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true
});

export const insertInvoiceEditSchema = createInsertSchema(invoiceEdits).omit({
  id: true,
  createdAt: true
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  status: true,
  completedAt: true,
  createdAt: true
});

export const insertDataIntegrityConstraintSchema = createInsertSchema(dataIntegrityConstraints).omit({
  id: true,
  currentStatus: true,
  lastValidationAt: true,
  autoFixAttempts: true,
  createdAt: true,
  updatedAt: true
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true
});

export const insertCrmUserSchema = createInsertSchema(crmUsers).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertAiConfigurationSchema = createInsertSchema(aiConfiguration).omit({
  id: true,
  configVersion: true,
  createdAt: true,
  updatedAt: true
});

// CRM Insert Schemas
export const insertRepresentativeLevelSchema = createInsertSchema(representativeLevels).omit({
  id: true,
  autoLevelChangeAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertCrmTaskSchema = createInsertSchema(crmTasks).omit({
  id: true,
  assignedAt: true,
  startedAt: true,
  completedAt: true,
  reminderCount: true,
  escalationLevel: true,
  createdAt: true
});

export const insertCrmTaskResultSchema = createInsertSchema(crmTaskResults).omit({
  id: true,
  submittedAt: true
});

export const insertAiKnowledgeBaseSchema = createInsertSchema(aiKnowledgeBase).omit({
  id: true,
  usageCount: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertAiDecisionLogSchema = createInsertSchema(aiDecisionLog).omit({
  id: true,
  actualOutcome: true,
  decisionEffectiveness: true,
  learningPoints: true,
  adminOverride: true,
  overrideReason: true,
  createdAt: true,
  evaluatedAt: true
});

export const insertCrmPerformanceAnalyticsSchema = createInsertSchema(crmPerformanceAnalytics).omit({
  id: true,
  createdAt: true
});

export const insertCrmSystemEventSchema = createInsertSchema(crmSystemEvents).omit({
  id: true,
  reviewedBy: true,
  reviewNotes: true,
  reviewedAt: true,
  createdAt: true
});

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// فاز ۱: Types برای مدیریت دوره‌ای فاکتورها
export type InvoiceBatch = typeof invoiceBatches.$inferSelect;
export type InsertInvoiceBatch = z.infer<typeof insertInvoiceBatchSchema>;

export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = z.infer<typeof insertRepresentativeSchema>;

export type SalesPartner = typeof salesPartners.$inferSelect;
export type InsertSalesPartner = z.infer<typeof insertSalesPartnerSchema>;

// Extended SalesPartner with calculated fields (for API responses)
export interface SalesPartnerWithCount extends SalesPartner {
  representativesCount?: number;
}

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type InvoiceEdit = typeof invoiceEdits.$inferSelect;
export type InsertInvoiceEdit = z.infer<typeof insertInvoiceEditSchema>;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;

export type DataIntegrityConstraint = typeof dataIntegrityConstraints.$inferSelect;
export type InsertDataIntegrityConstraint = z.infer<typeof insertDataIntegrityConstraintSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type CrmUser = typeof crmUsers.$inferSelect;
export type InsertCrmUser = z.infer<typeof insertCrmUserSchema>;

export type AiConfiguration = typeof aiConfiguration.$inferSelect;
export type InsertAiConfiguration = z.infer<typeof insertAiConfigurationSchema>;

// CRM Types
export type RepresentativeLevel = typeof representativeLevels.$inferSelect;
export type InsertRepresentativeLevel = z.infer<typeof insertRepresentativeLevelSchema>;

export type CrmTask = typeof crmTasks.$inferSelect;
export type InsertCrmTask = z.infer<typeof insertCrmTaskSchema>;

export type CrmTaskResult = typeof crmTaskResults.$inferSelect;
export type InsertCrmTaskResult = z.infer<typeof insertCrmTaskResultSchema>;

export type AiKnowledgeBase = typeof aiKnowledgeBase.$inferSelect;
export type InsertAiKnowledgeBase = z.infer<typeof insertAiKnowledgeBaseSchema>;

export type AiDecisionLog = typeof aiDecisionLog.$inferSelect;
export type InsertAiDecisionLog = z.infer<typeof insertAiDecisionLogSchema>;

export type CrmPerformanceAnalytics = typeof crmPerformanceAnalytics.$inferSelect;
export type InsertCrmPerformanceAnalytics = z.infer<typeof insertCrmPerformanceAnalyticsSchema>;

export type CrmSystemEvent = typeof crmSystemEvents.$inferSelect;
export type InsertCrmSystemEvent = z.infer<typeof insertCrmSystemEventSchema>;

export type TelegramSendHistory = typeof telegramSendHistory.$inferSelect;
export type InsertTelegramSendHistory = z.infer<typeof insertTelegramSendHistorySchema>;



// DA VINCI v2.0 Insert Schemas
export const insertWorkspaceTaskSchema = createInsertSchema(workspaceTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTaskReportSchema = createInsertSchema(taskReports).omit({
  id: true,
  aiAnalysis: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

// New DA VINCI v2.0 Analysis Schemas
export const insertTaskReportsAnalysisSchema = createInsertSchema(taskReportsAnalysis).omit({
  id: true,
  aiConfidence: true,
  processingModel: true,
  createdAt: true,
  updatedAt: true
});

export const insertWorkspaceAiReminderSchema = createInsertSchema(workspaceAiReminders).omit({
  id: true,
  status: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertRepresentativeSupportHistorySchema = createInsertSchema(representativeSupportHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupportLogSchema = createInsertSchema(supportLogs).omit({
  id: true,
  createdAt: true
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true
});

export const insertWorkspaceReminderSchema = createInsertSchema(workspaceReminders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRepresentativeSupportLogSchema = createInsertSchema(representativeSupportLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});



// DA VINCI v2.0 Types
export type WorkspaceTask = typeof workspaceTasks.$inferSelect;
export type InsertWorkspaceTask = z.infer<typeof insertWorkspaceTaskSchema>;

export type TaskReport = typeof taskReports.$inferSelect;
export type InsertTaskReport = z.infer<typeof insertTaskReportSchema>;

export type SupportLog = typeof supportLogs.$inferSelect;
export type InsertSupportLog = z.infer<typeof insertSupportLogSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// SupportStaff types already defined above - removed duplicate

export type WorkspaceReminder = typeof workspaceReminders.$inferSelect;
export type InsertWorkspaceReminder = z.infer<typeof insertWorkspaceReminderSchema>;

export type RepresentativeSupportLog = typeof representativeSupportLogs.$inferSelect;
export type InsertRepresentativeSupportLog = z.infer<typeof insertRepresentativeSupportLogSchema>;

// New DA VINCI v2.0 Analysis Types
export type TaskReportsAnalysis = typeof taskReportsAnalysis.$inferSelect;
export type InsertTaskReportsAnalysis = z.infer<typeof insertTaskReportsAnalysisSchema>;

export type WorkspaceAiReminder = typeof workspaceAiReminders.$inferSelect;
export type InsertWorkspaceAiReminder = z.infer<typeof insertWorkspaceAiReminderSchema>;

export type RepresentativeSupportHistory = typeof representativeSupportHistory.$inferSelect;
export type InsertRepresentativeSupportHistory = z.infer<typeof insertRepresentativeSupportHistorySchema>;

// ★CRITICAL NEW ARTIFACT★ - NEXUS PROTOCOL CONTRACTS

export interface RepresentativeLevel {
  NEW: "تازه‌کار - نیازمند راهنمایی کامل";
  ACTIVE: "فعال - در حال انجام وظایف";
  INACTIVE: "غیرفعال - نیازمند بازگردانی";
}

export interface AIManagerPersonality {
  role: "مدیر ارشد واحد ارتباطات با مشتری";
  capabilities: {
    deepPsychologicalUnderstanding: boolean;
    emotionalIntelligence: boolean;
    culturalAdaptation: boolean;
    experientialLearning: boolean;
    performanceEvaluation: boolean;
    strategicDecisionMaking: boolean;
  };
  decisionMakingProcess: {
    analyzeRepresentativeProfile: () => Promise<PsychProfile>;
    reviewHistoricalData: () => Promise<HistoricalInsights>;
    generateContextualTask: () => Promise<IntelligentTask>;
    evaluateTaskResult: () => Promise<PerformanceAssessment>;
    provideFeedback: () => Promise<DevelopmentPlan>;
  };
}

// Authentication & Access Control Contract
export interface AuthenticationContract {
  validateDualAccess(credentials: LoginCredentials): Promise<UserSession>;
  enforceRoleBasedAccess(role: 'ADMIN' | 'CRM', resource: string): boolean;
  maintainSessionIntegrity(sessionId: string): Promise<boolean>;
  auditSecurityEvents(event: SecurityEvent): Promise<void>;
}

export interface LoginCredentials {
  username: 'mgr' | 'crm';
  password: '8679';
  sessionContext?: 'ADMIN_PANEL' | 'CRM_PANEL';
}

// Data Synchronization Contract - Critical for Panel Integration
export interface DataSyncContract {
  syncRepresentativeFinancials(): Promise<{
    representativeId: number;
    debtAmount: number;
    creditScore: number;
    lastPaymentDate: string;
    restrictedFinancialData: boolean; // CRM can't see full sales
  }[]>;
  
  syncRepresentativeProfiles(): Promise<{
    representativeId: number;
    basicProfile: RepresentativeBasicProfile;
    psychologicalProfile?: PsychologicalProfile; // Only if analysis exists
    performanceMetrics: PublicPerformanceMetrics; // Safe metrics only
  }[]>;
  
  restrictSensitiveData(role: 'ADMIN' | 'CRM', data: any): any;
  validateDataAccess(role: string, dataType: string): boolean;
}

// AI Intelligence Contract - Persian Cultural Intelligence
export interface PersianCulturalAIContract {
  analyzeRepresentativePsychology(repId: number): Promise<{
    communicationStyle: 'محترمانه' | 'دوستانه' | 'مستقیم' | 'حمایتی';
    motivationFactors: string[];
    culturalContext: PersianBusinessCulture;
    responsePatterns: HistoricalBehavior;
    recommendedApproach: CommunicationStrategy;
  }>;

  generateIntelligentTask(context: {
    representativeLevel: RepresentativeLevel;
    psychProfile: PsychologicalProfile;
    currentFinancialStatus: FinancialContext;
    historicalPerformance: PerformanceHistory;
    culturalFactors: PersianCulturalFactors;
  }): Promise<IntelligentCrmTask>;

  evaluateTaskOutcome(result: {
    taskId: string;
    outcome: TaskOutcome;
    representativeResponse: RepresentativeResponse;
    emotionalTone: EmotionalTone;
    culturalAdaptation: CulturalFeedback;
  }): Promise<AILearningInsights>;

  updateKnowledgeBase(insights: AILearningInsights): Promise<void>;
}

// Clock Mechanism Integration Contract - Atomic Operations
export interface ClockMechanismContract {
  // Hour Hand: Financial-CRM Atomic Operations
  executeAtomicFinancialCrmOperation(operation: {
    type: 'DEBT_UPDATE_WITH_CRM_TASK' | 'PAYMENT_WITH_PERFORMANCE_IMPACT';
    financialData: FinancialTransactionData;
    crmData: CrmOperationData;
    rollbackStrategy: RollbackPlan;
  }): Promise<AtomicOperationResult>;

  // Minute Hand: Representative Management Synchronization
  synchronizeRepresentativeState(changes: {
    financialChanges?: FinancialStateChange;
    crmLevelChanges?: LevelStateChange;
    performanceChanges?: PerformanceStateChange;
  }): Promise<SynchronizationResult>;

  // Second Hand: Real-time Monitoring & Audit
  monitorSystemIntegrity(): Promise<SystemHealthReport>;
  auditCrossSystemOperations(): Promise<AuditTrailReport>;
}

// Team Performance Reporting Contract - Admin Panel Extension
export interface TeamPerformanceContract {
  generateTeamAnalytics(period: AnalyticsPeriod): Promise<{
    overallTeamHealth: TeamHealthMetrics;
    individualPerformanceRankings: RepresentativeRanking[];
    improvementRecommendations: TeamImprovementPlan;
    culturalInsights: TeamCulturalAnalysis;
    predictiveAnalytics: TeamPerformancePredictions;
    crmSystemEffectiveness: CrmEffectivenessReport;
  }>;

  identifyHighPerformers(): Promise<HighPerformerAnalysis[]>;
  identifyUnderPerformers(): Promise<UnderPerformerAnalysis[]>;
  generateDevelopmentPlans(): Promise<DevelopmentPlan[]>;
}

// Performance Analytics Contract
export interface PerformanceAnalyticsContract {
  calculateRepresentativeScore(repId: number): Promise<{
    overallScore: number; // 1-100
    taskCompletionRate: number;
    qualityScore: number;
    culturalAdaptationScore: number;
    improvementTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    personalizedFeedback: string;
  }>;

  predictFuturePerformance(repId: number): Promise<PerformancePrediction>;
  identifyTrainingNeeds(repId: number): Promise<TrainingRecommendations>;
}

// Security & Privacy Contract
export interface SecurityContract {
  enforceDataSegregation(role: 'ADMIN' | 'CRM'): DataSegregationRules;
  validateSensitiveDataAccess(dataRequest: DataAccessRequest): boolean;
  logSecurityEvents(event: SecurityEvent): Promise<void>;
  encryptSensitiveData(data: any): Promise<EncryptedData>;
}

// Types for the contracts
export type TaskOutcome = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE' | 'NEEDS_FOLLOW_UP';
export type EmotionalTone = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'FRUSTRATED' | 'MOTIVATED';
export type AnalyticsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface PersianBusinessCulture {
  respectHierarchy: boolean;
  valueRelationships: boolean;
  indirectCommunication: boolean;
  familyOriented: boolean;
  hospitalityFocused: boolean;
}

export interface IntelligentCrmTask {
  taskId: string;
  type: 'FOLLOW_UP' | 'DEBT_COLLECTION' | 'RELATIONSHIP_BUILDING' | 'PERFORMANCE_CHECK';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  culturallyAdaptedContent: {
    title: string;
    description: string;
    suggestedApproach: string;
    culturalConsiderations: string[];
  };
  expectedOutcome: string;
  aiConfidenceScore: number;
  personalizedForRepresentative: boolean;
}

export interface AILearningInsights {
  whatWorked: string[];
  whatDidntWork: string[];
  culturalFactorsObserved: string[];
  improvementSuggestions: string[];
  knowledgeToAdd: KnowledgeBaseEntry[];
}

// ========== CRM ENHANCEMENT CONTRACTS v9.0 ==========

// Voice Processing Pipeline Contract (Groq + xAI Grok Integration)
export interface VoiceProcessingPipeline {
  // Stage 1: Groq Speech-to-Text (Farsi support)
  transcribeAudio(audioFile: File, language: 'fa' | 'en'): Promise<TranscriptionResult>;
  
  // Stage 2: xAI Grok Processing & Analysis
  processTranscription(text: string, context: AIProcessingContext): Promise<ProcessedContent>;
  
  // Stage 3: Content Storage & Integration
  saveProcessedContent(content: ProcessedContent, targetType: 'biography' | 'support_report' | 'task_assignment'): Promise<ContentStorage>;
  
  // Quality Control & Validation
  validateTranscription(result: TranscriptionResult): Promise<ValidationResult>;
  reviewProcessedContent(content: ProcessedContent): Promise<ReviewResult>;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  segments: AudioSegment[];
  metadata: {
    duration: number;
    speakerCount: number;
    backgroundNoise: boolean;
  };
}

export interface AudioSegment {
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

export interface AIProcessingContext {
  representativeId?: number;
  contextType: 'biography' | 'support_status' | 'task_assignment' | 'performance_review';
  existingData?: any;
  culturalContext?: PersianBusinessCulture;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProcessedContent {
  originalText: string;
  processedText: string;
  aiInsights: string[];
  suggestedActions: ActionRecommendation[];
  culturalAnalysis: CulturalAnalysis;
  confidence: number;
  processingTime: number;
}

export interface ActionRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  culturalConsiderations: string[];
  estimatedImpact: number;
}

export interface CulturalAnalysis {
  communicationStyle: string;
  emotionalTone: string;
  culturalMarkers: string[];
  recommendedApproach: string;
  sensitivityLevel: 'low' | 'medium' | 'high';
}

// Currency Display Contract (Rial to Toman Conversion)
export interface CurrencyFormatterContract {
  formatToTomans(rialAmount: number | string): string;
  formatToPersianTomans(rialAmount: number | string): string;
  convertRialsToTomans(rialAmount: number): number;
  formatCurrency(amount: number, unit: 'rial' | 'toman', locale: 'fa-IR' | 'en-US'): string;
  validateCurrencyInput(input: string): boolean;
}

// Enhanced AI CRM Manager Contract
export interface CRMManagerAIContract {
  // Representative Analysis & Management
  analyzeRepresentativeBehavior(repId: number, biography?: string, historicalData?: HistoricalData): Promise<RepresentativeAnalysis>;
  
  // Dynamic Task Generation
  generatePersonalizedTask(repId: number, analysis: RepresentativeAnalysis, context: TaskContext): Promise<EnhancedTask>;
  
  // Support Team Performance Monitoring
  evaluateSupportPerformance(supportUserId: number, period: AnalyticsPeriod): Promise<SupportPerformanceReport>;
  
  // Offer & Strategy Recommendations
  recommendOptimalOffer(repId: number, context: OfferContext): Promise<OfferRecommendation>;
  
  // Learning & Adaptation
  learnFromInteractions(interactionData: InteractionData[]): Promise<LearningInsights>;
  
  // Real-time Decision Making
  makeRealTimeDecision(situation: BusinessSituation): Promise<AIDecision>;
}

export interface RepresentativeAnalysis {
  personalityProfile: PersonalityProfile;
  communicationPreferences: CommunicationPreferences;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  paymentBehavior: PaymentBehaviorAnalysis;
  relationshipStatus: RelationshipStatus;
  recommendedStrategy: EngagementStrategy;
  culturalFactors: CulturalFactors;
  lastUpdated: Date;
}

export interface PersonalityProfile {
  dominantTraits: string[];
  communicationStyle: 'direct' | 'indirect' | 'formal' | 'casual' | 'mixed';
  decisionMakingStyle: 'analytical' | 'intuitive' | 'consensus' | 'authoritative';
  stressResponses: string[];
  motivationFactors: string[];
}

export interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: TaskCategory;
  estimatedDuration: number;
  deadline: Date;
  aiReasoning: string;
  culturalConsiderations: string[];
  visualPresentation: TaskVisualStyle;
  checkpoints: TaskCheckpoint[];
  successMetrics: SuccessMetric[];
  followUpActions: FollowUpAction[];
}

export interface TaskVisualStyle {
  colorScheme: string;
  icon: string;
  animationType: 'pulse' | 'bounce' | 'slide' | 'glow' | 'fade';
  priorityIndicator: PriorityIndicator;
  progressVisualization: 'linear' | 'circular' | 'milestone' | 'kanban';
}

export interface PriorityIndicator {
  color: string;
  intensity: number;
  blinkRate?: number;
  glowEffect?: boolean;
}

export interface TaskCheckpoint {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  requiredActions: string[];
  validationCriteria: string[];
}

// Dynamic Workspace Contract
export interface DynamicWorkspaceContract {
  // Context Management
  loadWorkspaceContext(userId: number, contextType: 'representative' | 'support' | 'manager'): Promise<WorkspaceContext>;
  
  // Real-time Updates
  subscribeToRealTimeUpdates(workspaceId: string): EventStream;
  
  // Task Management
  trackTaskProgress(taskId: string, progress: TaskProgress): Promise<ProgressUpdateResult>;
  
  // Reminder & Scheduling System
  scheduleIntelligentReminder(reminder: IntelligentReminder): Promise<ReminderScheduleResult>;
  
  // Performance Visualization
  generateLivePerformanceVisuals(filters: PerformanceFilters): Promise<VisualizationData>;
  
  // Collaborative Features
  enableCollaboration(workspaceId: string, participants: CollaborationParticipant[]): Promise<CollaborationSession>;
}

export interface WorkspaceContext {
  userId: number;
  userRole: 'support' | 'manager' | 'admin';
  activeRepresentatives: number[];
  pendingTasks: EnhancedTask[];
  priorities: WorkspacePriority[];
  personalizedSettings: WorkspaceSettings;
  aiAssistantContext: AIAssistantContext;
}

export interface IntelligentReminder {
  taskId: string;
  reminderType: 'follow_up' | 'deadline' | 'check_in' | 'escalation';
  scheduledDate: Date;
  recipients: string[];
  content: ReminderContent;
  escalationRules: EscalationRule[];
}

export interface ReminderContent {
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  culturallyAdapted: boolean;
}

// Advanced Reporting & Analytics Contract
export interface AdvancedReportingContract {
  generateExecutiveReport(period: AnalyticsPeriod, metrics: ReportMetric[]): Promise<ExecutiveReport>;
  createCustomVisualization(data: AnalyticsData, visualizationType: VisualizationType): Promise<CustomVisualization>;
  performPredictiveAnalysis(dataSet: AnalyticsDataSet, predictionType: PredictionType): Promise<PredictiveInsights>;
  exportReport(report: any, format: 'pdf' | 'excel' | 'powerpoint' | 'json'): Promise<ExportResult>;
}

// Offer Management System Contract
export interface OfferManagementContract {
  analyzeRepresentativeFinancials(repId: number): Promise<FinancialAnalysis>;
  calculateOfferImpact(offer: ProposedOffer, repProfile: RepresentativeAnalysis): Promise<OfferImpactAnalysis>;
  generateCustomizedOffer(repId: number, constraints: OfferConstraints): Promise<CustomizedOffer>;
  trackOfferPerformance(offerId: string): Promise<OfferPerformanceMetrics>;
}

export interface ProposedOffer {
  type: 'payment_plan' | 'discount' | 'credit_extension' | 'custom';
  terms: OfferTerms;
  validityPeriod: number;
  conditions: OfferCondition[];
  expectedOutcome: ExpectedOutcome;
}

export interface OfferImpactAnalysis {
  financialImpact: {
    shortTerm: number;
    longTerm: number;
    riskAdjusted: number;
  };
  relationshipImpact: {
    trustScore: number;
    loyaltyScore: number;
    futureBusinessPotential: number;
  };
  recommendationScore: number;
  alternativeOffers: ProposedOffer[];
}

// System Integration Health Contract
export interface SystemHealthContract {
  monitorCrossSystemIntegrity(): Promise<SystemHealthReport>;
  validateDataConsistency(): Promise<ConsistencyReport>;
  performHealthChecks(): Promise<HealthCheckResult>;
  generateSystemPerformanceReport(): Promise<PerformanceReport>;
}
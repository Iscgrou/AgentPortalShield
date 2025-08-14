
# سند فنی مهندسی معکوس - سامانه مدیریت مالی و CRM هوشمند

## 1. نمای کلی و فلسفه

### مأموریت و ارزش پیشنهادی
**مأموریت**: ایجاد اکوسیستم یکپارچه مدیریت مالی و CRM مبتنی بر هوش مصنوعی برای بهبود روابط تجاری با نمایندگان فروش.

**ارزش‌های پیشنهادی**:
- **یکپارچگی**: ادغام عمیق داده‌های مالی و CRM در یک پلتفرم
- **هوشمندی**: استفاده از XAI Grok Engine برای تحلیل رفتار مشتری
- **شفافیت**: پرتال عمومی برای مشاهده فاکتورها توسط نمایندگان
- **خودکارسازی**: تولید وظایف و پیگیری‌های هوشمند

### شاخص‌های موفقیت
```typescript
interface SuccessMetrics {
  financial: {
    debt_collection_rate: number; // > 85%
    invoice_accuracy: number;     // > 99%
    payment_time_reduction: number; // < 30 days
  };
  crm: {
    representative_satisfaction: number; // > 4.5/5
    task_completion_rate: number;       // > 90%
    ai_recommendation_accuracy: number; // > 80%
  };
  operational: {
    system_uptime: number;        // > 99.5%
    response_time_api: number;    // < 200ms
    concurrent_users: number;     // > 100
  };
}
```

### معماری منتخب: Layered + Service-Oriented
**دلیل انتخاب**:
- **Layered**: جداسازی منطق تجاری از داده و رابط کاربری
- **Service-Oriented**: قابلیت مقیاس‌پذیری مستقل هر بخش
- **Event-Driven**: برای همگام‌سازی داده‌های مالی و CRM

### مرزهای دامنه (Bounded Contexts)
1. **Financial Domain**: فاکتورسازی، مدیریت بدهی، پرداخت
2. **CRM Domain**: مدیریت نمایندگان، وظایف، پیگیری
3. **AI Domain**: تحلیل داده، تولید محتوا، پیشنهادات
4. **Portal Domain**: نمایش عمومی فاکتورها
5. **Authentication Domain**: مدیریت هویت و دسترسی

## 2. مدل C4 و دیاگرام‌ها

### سطح System Context
```mermaid
C4Context
  title System Context - سامانه مدیریت مالی و CRM

  Person(admin, "مدیر مالی", "مدیریت فاکتور و بدهی")
  Person(crm_manager, "مدیر CRM", "نظارت بر فروش")
  Person(crm_staff, "پشتیبان CRM", "پیگیری نمایندگان")
  Person(representative, "نماینده فروش", "مشاهده فاکتور")

  System(main_system, "سامانه مدیریت", "وب‌اپلیکیشن یکپارچه")
  
  System_Ext(xai_grok, "XAI Grok API", "هوش مصنوعی")
  System_Ext(telegram, "Telegram Bot", "اعلان‌رسانی")
  System_Ext(sms_provider, "SMS Gateway", "پیامک")

  Rel(admin, main_system, "مدیریت مالی", "HTTPS")
  Rel(crm_manager, main_system, "داشبورد CRM", "HTTPS")
  Rel(crm_staff, main_system, "وظایف CRM", "HTTPS")
  Rel(representative, main_system, "پرتال عمومی", "HTTPS")
  
  Rel(main_system, xai_grok, "تحلیل AI", "REST API")
  Rel(main_system, telegram, "ارسال اعلان", "Bot API")
  Rel(main_system, sms_provider, "پیامک", "REST API")
```

### سطح Container
```mermaid
C4Container
  title Container Diagram - معماری کانتینرها

  Person(users, "کاربران", "ادمین، CRM، نمایندگان")

  Container(web_app, "React Web App", "TypeScript, Vite", "رابط کاربری")
  Container(api_gateway, "Express.js API", "Node.js, TypeScript", "API Gateway")
  
  Container(auth_service, "Authentication Service", "Session-based", "مدیریت هویت")
  Container(financial_service, "Financial Engine", "Node.js", "منطق مالی")
  Container(crm_service, "CRM Engine", "Node.js + AI", "منطق CRM")
  Container(ai_service, "AI Processing", "XAI Integration", "هوش مصنوعی")
  
  ContainerDb(postgres_db, "PostgreSQL", "Database", "ذخیره داده")
  Container(file_storage, "File Storage", "Multer", "فایل‌های آپلود")

  Rel(users, web_app, "استفاده", "HTTPS")
  Rel(web_app, api_gateway, "API calls", "REST/JSON")
  
  Rel(api_gateway, auth_service, "احراز هویت", "Session")
  Rel(api_gateway, financial_service, "عملیات مالی", "Internal")
  Rel(api_gateway, crm_service, "عملیات CRM", "Internal")
  
  Rel(crm_service, ai_service, "تحلیل هوشمند", "Internal")
  
  Rel(financial_service, postgres_db, "داده مالی", "SQL")
  Rel(crm_service, postgres_db, "داده CRM", "SQL")
  Rel(auth_service, postgres_db, "نشست‌ها", "SQL")
  
  Rel(api_gateway, file_storage, "آپلود فایل", "Multipart")
```

### سطح Component - Financial Service
```mermaid
C4Component
  title Financial Service Components

  Component(invoice_controller, "Invoice Controller", "Express Router", "مدیریت فاکتور")
  Component(payment_controller, "Payment Controller", "Express Router", "مدیریت پرداخت")
  Component(debt_controller, "Debt Controller", "Express Router", "مدیریت بدهی")
  
  Component(standardized_engine, "Standardized Invoice Engine", "Business Logic", "پردازش استاندارد فاکتور")
  Component(currency_intelligence, "Currency Intelligence", "Business Logic", "هوش ارزی")
  Component(financial_integrity, "Financial Integrity", "Validation", "کنترل یکپارچگی")
  
  Component(storage_service, "Storage Service", "Data Access", "دسترسی به داده")
  
  ComponentDb(invoices_table, "Invoices", "PostgreSQL Table")
  ComponentDb(representatives_table, "Representatives", "PostgreSQL Table")
  ComponentDb(payments_table, "Payments", "PostgreSQL Table")

  Rel(invoice_controller, standardized_engine, "پردازش فاکتور")
  Rel(payment_controller, currency_intelligence, "تحلیل ارزی")
  Rel(debt_controller, financial_integrity, "کنترل یکپارچگی")
  
  Rel(standardized_engine, storage_service, "ذخیره داده")
  Rel(storage_service, invoices_table, "CRUD عملیات", "SQL")
  Rel(storage_service, representatives_table, "CRUD عملیات", "SQL")
  Rel(storage_service, payments_table, "CRUD عملیات", "SQL")
```

## 3. دامنه‌ها، موجودیت‌ها و مدل داده (ERD)

### Entity Relationship Diagram
```mermaid
erDiagram
  ADMIN_USERS {
    id SERIAL PK
    username VARCHAR(50)
    password_hash VARCHAR(255)
    role VARCHAR(20)
    permissions TEXT[]
    is_active BOOLEAN
    last_login_at TIMESTAMP
    created_at TIMESTAMP
  }

  CRM_USERS {
    id SERIAL PK
    username VARCHAR(50)
    password_hash VARCHAR(255)
    full_name VARCHAR(100)
    email VARCHAR(100)
    role VARCHAR(20)
    permissions TEXT[]
    is_active BOOLEAN
    last_login_at TIMESTAMP
    created_at TIMESTAMP
  }

  SALES_PARTNERS {
    id SERIAL PK
    name VARCHAR(100)
    contact_info JSONB
    commission_rate DECIMAL(5,2)
    is_active BOOLEAN
    created_at TIMESTAMP
  }

  REPRESENTATIVES {
    id SERIAL PK
    name VARCHAR(100)
    code VARCHAR(50)
    panel_username VARCHAR(50)
    public_id VARCHAR(50)
    phone VARCHAR(20)
    email VARCHAR(100)
    total_sales DECIMAL(15,2)
    total_debt DECIMAL(15,2)
    sales_partner_id INTEGER FK
    is_active BOOLEAN
    created_at TIMESTAMP
    updated_at TIMESTAMP
  }

  INVOICES {
    id SERIAL PK
    invoice_number VARCHAR(50)
    representative_id INTEGER FK
    batch_id INTEGER FK
    amount DECIMAL(15,2)
    issue_date DATE
    due_date DATE
    status VARCHAR(20)
    usage_data JSONB
    created_at TIMESTAMP
    updated_at TIMESTAMP
  }

  INVOICE_BATCHES {
    id SERIAL PK
    batch_name VARCHAR(100)
    batch_code VARCHAR(50)
    period_start DATE
    period_end DATE
    description TEXT
    status VARCHAR(20)
    total_invoices INTEGER
    total_amount DECIMAL(15,2)
    uploaded_by VARCHAR(50)
    uploaded_file_name VARCHAR(255)
    created_at TIMESTAMP
    completed_at TIMESTAMP
  }

  PAYMENTS {
    id SERIAL PK
    invoice_id INTEGER FK
    amount DECIMAL(15,2)
    payment_date DATE
    payment_method VARCHAR(50)
    reference_number VARCHAR(100)
    notes TEXT
    created_at TIMESTAMP
  }

  WORKSPACE_TASKS {
    id SERIAL PK
    staff_id INTEGER FK
    representative_id INTEGER FK
    title VARCHAR(200)
    description TEXT
    type VARCHAR(50)
    priority VARCHAR(20)
    status VARCHAR(20)
    due_date DATE
    ai_generated BOOLEAN
    ai_confidence DECIMAL(3,2)
    created_at TIMESTAMP
    completed_at TIMESTAMP
  }

  TASK_REPORTS {
    id SERIAL PK
    task_id INTEGER FK
    staff_id INTEGER FK
    representative_id INTEGER FK
    content TEXT
    status VARCHAR(20)
    submitted_at TIMESTAMP
    created_at TIMESTAMP
  }

  TASK_REPORTS_ANALYSIS {
    id SERIAL PK
    report_id INTEGER FK
    key_insights JSONB
    follow_up_actions JSONB
    representative_updates JSONB
    cultural_context JSONB
    next_contact_date DATE
    priority_level VARCHAR(20)
    ai_confidence DECIMAL(3,2)
    created_at TIMESTAMP
  }

  REPRESENTATIVES ||--o{ INVOICES : "has_invoices"
  SALES_PARTNERS ||--o{ REPRESENTATIVES : "manages"
  INVOICES ||--o{ PAYMENTS : "receives_payments"
  INVOICE_BATCHES ||--o{ INVOICES : "contains"
  CRM_USERS ||--o{ WORKSPACE_TASKS : "assigned_to"
  REPRESENTATIVES ||--o{ WORKSPACE_TASKS : "target_of"
  WORKSPACE_TASKS ||--o{ TASK_REPORTS : "generates"
  TASK_REPORTS ||--|| TASK_REPORTS_ANALYSIS : "analyzed_by"
```

### نمونه داده‌های واقعی

#### Representative Sample
```json
{
  "id": 123,
  "name": "فروشگاه رضا احمدی",
  "code": "SHOP_001",
  "panel_username": "reza_shop",
  "public_id": "reza001",
  "phone": "09123456789",
  "email": "reza@shop.com",
  "total_sales": "12500000.00",
  "total_debt": "3200000.00",
  "sales_partner_id": 1,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-10T14:20:00Z"
}
```

#### Invoice Sample
```json
{
  "id": 456,
  "invoice_number": "INV-2024-001234",
  "representative_id": 123,
  "batch_id": 78,
  "amount": "850000.00",
  "issue_date": "1403-01-15",
  "due_date": "1403-02-15",
  "status": "unpaid",
  "usage_data": {
    "period": "1403-01-01 to 1403-01-31",
    "services": [
      {
        "name": "پلتفرم فروش",
        "usage": 1250,
        "rate": 680,
        "amount": 850000
      }
    ]
  },
  "created_at": "2024-02-05T09:15:00Z"
}
```

#### Workspace Task Sample
```json
{
  "id": 789,
  "staff_id": 5,
  "representative_id": 123,
  "title": "پیگیری وضعیت پرداخت فاکتور شماره INV-2024-001234",
  "description": "نماینده تاخیر در پرداخت دارد. بررسی علت و ارائه راهکار",
  "type": "PAYMENT_FOLLOW_UP",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "due_date": "1403-02-20",
  "ai_generated": true,
  "ai_confidence": 0.87,
  "created_at": "2024-02-10T08:30:00Z"
}
```

## 4. گردش‌های کاری کلیدی (Workflows)

### 4.1 گردش صدور فاکتور استاندارد
```mermaid
sequenceDiagram
  participant Admin as مدیر مالی
  participant API as API Gateway
  participant InvEngine as Invoice Engine
  participant Storage as Storage Service
  participant DB as PostgreSQL

  Admin->>API: POST /api/invoices/generate-standard
  Note over Admin,API: فایل JSON + پارامترهای batch
  
  API->>InvEngine: parseStandardJsonData()
  InvEngine->>InvEngine: validateStandardUsageData()
  Note over InvEngine: تشخیص رکوردهای معتبر/نامعتبر
  
  InvEngine->>Storage: createInvoiceBatch()
  Storage->>DB: INSERT INTO invoice_batches
  DB-->>Storage: batch_id
  
  loop برای هر نماینده
    InvEngine->>Storage: getOrCreateRepresentative()
    alt نماینده جدید
      Storage->>DB: INSERT INTO representatives
    end
    
    InvEngine->>Storage: createInvoice()
    Storage->>DB: INSERT INTO invoices
    
    InvEngine->>Storage: updateRepresentativeFinancials()
    Storage->>DB: UPDATE representatives SET total_debt
  end
  
  InvEngine->>Storage: updateInvoiceBatch(completed)
  Storage->>DB: UPDATE invoice_batches SET status='completed'
  
  API-->>Admin: {success: true, createdInvoices: count}
```

**ورودی**: فایل JSON حاوی داده‌های مصرف نمایندگان
**خروجی**: تعداد فاکتورهای ایجادشده + خلاصه آماری
**SLA**: < 30 ثانیه برای 1000 فاکتور
**پیش‌شرط**: فایل JSON با فرمت استاندارد
**پس‌شرط**: فاکتورها در دیتابیس + بروزرسانی بدهی نمایندگان

### 4.2 گردش CRM هوشمند - تولید وظیفه
```mermaid
sequenceDiagram
  participant Staff as پشتیبان CRM
  participant CRM as CRM Service
  participant AI as XAI Grok Engine
  participant TaskMgr as Task Manager
  participant DB as PostgreSQL

  Staff->>CRM: درخواست وظایف روزانه
  CRM->>AI: تحلیل وضعیت نمایندگان
  
  loop برای هر نماینده
    AI->>AI: generateTaskRecommendations()
    Note over AI: بررسی: بدهی، تاریخ آخرین تماس، وضعیت فاکتور
    
    AI->>CRM: توصیه وظیفه + سطح اولویت
    CRM->>TaskMgr: createTask()
    TaskMgr->>DB: INSERT INTO workspace_tasks
  end
  
  CRM-->>Staff: لیست وظایف هوشمند
```

### 4.3 گردش پرتال عمومی نمایندگان
```mermaid
sequenceDiagram
  participant Rep as نماینده فروش
  participant Portal as Portal Service
  participant Auth as Auth Service
  participant Storage as Storage Service

  Rep->>Portal: /portal/:publicId
  Portal->>Auth: validatePublicAccess()
  Auth->>Storage: getRepresentativeByPublicId()
  
  alt نماینده معتبر
    Storage-->>Auth: representative data
    Auth-->>Portal: access granted
    
    Portal->>Storage: getRepresentativeInvoices()
    Storage-->>Portal: فهرست فاکتورهای نماینده
    Portal-->>Rep: نمایش فاکتورها
  else نماینده نامعتبر
    Auth-->>Portal: access denied
    Portal-->>Rep: 404 - صفحه یافت نشد
  end
```

## 5. قراردادهای API و یکپارچه‌سازی

### 5.1 Core Financial APIs

#### صدور فاکتور استاندارد
```typescript
POST /api/invoices/generate-standard
Content-Type: multipart/form-data
Authorization: Session Cookie

Request:
{
  file: File, // JSON file
  batchName: string,
  periodStart: string, // "1403-01-01"
  periodEnd: string,   // "1403-01-31"
  description?: string,
  invoiceDateMode: "auto" | "custom",
  customInvoiceDate?: string
}

Response 200:
{
  success: true,
  message: string,
  data: {
    createdInvoices: number,
    newRepresentatives: number,
    batchId: number,
    totalAmount: number,
    statistics: {
      totalRecords: number,
      processedInvoices: number,
      successfulInvoices: number
    }
  }
}

Response 400:
{
  success: false,
  error: string,
  details?: any
}
```

#### مشاهده داشبورد مالی
```typescript
GET /api/dashboard/data
Authorization: Session Cookie

Response 200:
{
  totalRevenue: string,
  totalDebt: string,
  totalInvoices: number,
  activeRepresentatives: number,
  recentActivity: Activity[],
  monthlyStats: MonthlyStats[]
}

interface Activity {
  id: number,
  type: "invoice" | "payment" | "representative",
  description: string,
  timestamp: string,
  amount?: string
}
```

### 5.2 CRM APIs

#### تولید وظایف هوشمند
```typescript
POST /api/crm/tasks/generate
Authorization: Session Cookie (CRM User)

Request:
{
  staffId: number,
  targetDate?: string, // default: today
  representativeIds?: number[] // specific reps or all
}

Response 200:
{
  success: true,
  tasks: WorkspaceTask[],
  aiInsights: {
    totalGenerated: number,
    highPriority: number,
    aiConfidenceAverage: number
  }
}
```

#### ثبت گزارش وظیفه
```typescript
POST /api/crm/tasks/:taskId/report
Authorization: Session Cookie (CRM User)

Request:
{
  content: string,
  status: "completed" | "in_progress" | "blocked",
  nextSteps?: string[]
}

Response 200:
{
  success: true,
  reportId: string,
  aiAnalysis?: {
    keyInsights: string[],
    followUpRecommended: boolean,
    priorityLevel: string
  }
}
```

### 5.3 Portal APIs

#### دسترسی عمومی نماینده
```typescript
GET /api/portal/:publicId/invoices
No Authorization Required

Response 200:
{
  representative: {
    name: string,
    code: string,
    totalDebt: string
  },
  invoices: {
    id: number,
    invoiceNumber: string,
    amount: string,
    issueDate: string,
    dueDate: string,
    status: string,
    usageData: any
  }[]
}

Response 404:
{
  error: "نماینده یافت نشد"
}
```

### 5.4 External Integrations

#### XAI Grok Integration
```typescript
// Internal Service Call
interface GrokRequest {
  prompt: string,
  context: {
    representative: Representative,
    recentTasks: Task[],
    financialStatus: FinancialStatus
  },
  type: "task_generation" | "report_analysis" | "cultural_insights"
}

// Rate Limiting: 100 requests/minute
// Timeout: 30 seconds
// Retry Policy: 3 attempts with exponential backoff
```

#### Telegram Notifications
```typescript
// Webhook Configuration
POST https://api.telegram.org/bot{token}/setWebhook
{
  url: "https://yourapp.com/api/telegram/webhook",
  allowed_updates: ["message", "callback_query"]
}

// Send Message
POST https://api.telegram.org/bot{token}/sendMessage
{
  chat_id: string,
  text: string,
  parse_mode: "Markdown"
}
```

## 6. منطق‌های عملیاتی و قوانین کسب‌وکار

### 6.1 قوانین مالی

#### محاسبه بدهی نماینده
```typescript
function calculateRepresentativeDebt(representativeId: number): number {
  // مجموع فاکتورهای پرداخت نشده منهای پرداخت‌های جزئی
  const unpaidInvoices = getUnpaidInvoices(representativeId);
  const partialPayments = getPartialPayments(representativeId);
  
  return unpaidInvoices.reduce((total, invoice) => {
    const invoicePayments = partialPayments.filter(p => p.invoiceId === invoice.id);
    const paidAmount = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    return total + (invoice.amount - paidAmount);
  }, 0);
}
```

#### تولید شماره فاکتور
```typescript
async function generateInvoiceNumber(issueDate: string): Promise<string> {
  const persianYear = getPersianYear(issueDate); // مثل 1403
  const sequence = await getNextSequenceNumber(persianYear);
  return `INV-${persianYear}-${sequence.toString().padStart(6, '0')}`;
  // Result: "INV-1403-001234"
}
```

#### قوانین انتقال وضعیت فاکتور
```typescript
enum InvoiceStatus {
  DRAFT = "draft",
  ISSUED = "unpaid", 
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled"
}

// State Transitions
const allowedTransitions = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.ISSUED, InvoiceStatus.CANCELLED],
  [InvoiceStatus.ISSUED]: [InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
  [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE],
  [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID],
  [InvoiceStatus.PAID]: [], // Terminal state
  [InvoiceStatus.CANCELLED]: [] // Terminal state
};
```

### 6.2 قوانین CRM

#### امتیازدهی لید
```typescript
function calculateLeadScore(representative: Representative): number {
  let score = 0;
  
  // امتیاز بر اساس حجم فروش
  if (representative.totalSales > 50000000) score += 40;
  else if (representative.totalSales > 20000000) score += 25;
  else if (representative.totalSales > 5000000) score += 15;
  
  // امتیاز بر اساس نسبت بدهی
  const debtRatio = representative.totalDebt / representative.totalSales;
  if (debtRatio < 0.1) score += 30;
  else if (debtRatio < 0.3) score += 20;
  else if (debtRatio < 0.5) score += 10;
  else score -= 10; // جریمه برای بدهی بالا
  
  // امتیاز بر اساس فعالیت اخیر
  const daysSinceLastContact = getDaysSinceLastContact(representative.id);
  if (daysSinceLastContact > 30) score += 20; // نیاز به پیگیری
  
  return Math.max(0, Math.min(100, score));
}
```

#### SLA پاسخگویی
```typescript
interface ResponseSLA {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  maxResponseTime: number; // ساعت
  escalationTime: number;  // ساعت
}

const slaRules: Record<string, ResponseSLA> = {
  'HIGH': { priority: 'HIGH', maxResponseTime: 2, escalationTime: 4 },
  'MEDIUM': { priority: 'MEDIUM', maxResponseTime: 8, escalationTime: 24 },
  'LOW': { priority: 'LOW', maxResponseTime: 24, escalationTime: 72 }
};
```

### 6.3 قوانین هوش مصنوعی

#### اولویت‌بندی وظایف
```typescript
function prioritizeTask(
  representative: Representative,
  taskType: string,
  aiContext: AIContext
): TaskPriority {
  
  // قوانین اولویت‌بندی
  if (representative.totalDebt > 10000000 && taskType === 'PAYMENT_FOLLOW_UP') {
    return 'HIGH';
  }
  
  if (aiContext.customerMood === 'negative' && taskType === 'RELATIONSHIP_BUILDING') {
    return 'HIGH';
  }
  
  const daysSinceLastContact = getDaysSinceLastContact(representative.id);
  if (daysSinceLastContact > 45) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}
```

## 7. کوپلینگ‌ها و وابستگی‌ها

### 7.1 ماتریس وابستگی‌ها

| Component | Financial Service | CRM Service | AI Service | Auth Service | Storage |
|-----------|-------------------|-------------|------------|--------------|---------|
| **Financial Service** | - | Data Sync | - | Authentication | High |
| **CRM Service** | Read-only Data | - | High | Authentication | High |
| **AI Service** | Context Data | High | - | - | Medium |
| **Auth Service** | Session Validation | Session Validation | - | - | High |
| **Portal Service** | Read-only Data | - | - | Public Access | Medium |

### 7.2 نوع کوپلینگ‌ها

#### کوپلینگ داده‌ای (Data Coupling)
```typescript
// مثال: CRM Service نیاز به داده‌های مالی دارد
interface RepresentativeFinancialContext {
  representativeId: number;
  totalDebt: number;
  lastPaymentDate: string;
  overdueInvoices: number;
}

// این داده از Financial Service به CRM منتقل می‌شود
```

#### کوپلینگ زمانی (Temporal Coupling)
```typescript
// مثال: ایجاد فاکتور باید قبل از بروزرسانی بدهی نماینده اتفاق بیفتد
async function createInvoiceWorkflow(invoiceData: InvoiceData) {
  // Step 1: Create invoice (must happen first)
  const invoice = await storage.createInvoice(invoiceData);
  
  // Step 2: Update representative debt (depends on step 1)
  await storage.updateRepresentativeFinancials(invoiceData.representativeId);
  
  // Step 3: Trigger CRM notification (can happen async)
  crmService.notifyNewInvoice(invoice.id).catch(console.error);
}
```

### 7.3 استراتژی‌های کاهش کوپلینگ

#### Event-Driven Architecture
```typescript
// Event Publisher
class FinancialEventPublisher {
  async publishInvoiceCreated(invoice: Invoice) {
    await eventBus.publish('invoice.created', {
      invoiceId: invoice.id,
      representativeId: invoice.representativeId,
      amount: invoice.amount,
      timestamp: new Date().toISOString()
    });
  }
}

// Event Subscriber در CRM Service
class CRMEventHandler {
  @EventHandler('invoice.created')
  async handleInvoiceCreated(event: InvoiceCreatedEvent) {
    // Generate follow-up task
    await taskGenerator.createPaymentFollowUpTask(
      event.representativeId,
      event.invoiceId
    );
  }
}
```

#### Anti-Corruption Layer
```typescript
// ACL for AI Service Integration
class AIServiceAdapter {
  async generateTaskRecommendations(representative: Representative): Promise<Task[]> {
    // Transform internal data to AI service format
    const aiRequest = this.transformToAIFormat(representative);
    
    // Call external AI service
    const aiResponse = await xaiGrok.analyze(aiRequest);
    
    // Transform AI response back to internal format
    return this.transformFromAIFormat(aiResponse);
  }
  
  private transformToAIFormat(rep: Representative): GrokAnalysisRequest {
    return {
      customer_id: rep.id,
      financial_status: {
        debt: rep.totalDebt,
        sales: rep.totalSales
      },
      metadata: {
        culture: "persian_business",
        domain: "b2b_sales"
      }
    };
  }
}
```

## 8. امنیت، هویت و مجوزدهی

### 8.1 مدل RBAC (Role-Based Access Control)

#### تعریف نقش‌ها
```typescript
enum UserRole {
  SUPER_ADMIN = "super_admin",
  FINANCIAL_ADMIN = "admin",
  CRM_MANAGER = "crm_manager", 
  CRM_STAFF = "crm_staff",
  REPRESENTATIVE = "representative" // پرتال عمومی
}

interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}
```

#### ماتریس دسترسی‌ها
| نقش | فاکتورها | نمایندگان | CRM وظایف | گزارشات | تنظیمات |
|-----|-----------|-------------|------------|----------|-----------|
| **Super Admin** | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Financial Admin** | CRUD | CRUD | Read | CRUD | Config |
| **CRM Manager** | Read | CRUD | CRUD | CRUD | CRM Settings |
| **CRM Staff** | Read | Read | Own Tasks | Own Reports | Profile |
| **Representative** | Own Invoices | Own Profile | - | - | - |

### 8.2 جریان احراز هویت

#### Session-Based Authentication
```mermaid
sequenceDiagram
  participant User as کاربر
  participant Auth as Auth Service
  participant Session as Session Store
  participant DB as User Database

  User->>Auth: POST /api/auth/login
  Note over User,Auth: {username, password}
  
  Auth->>DB: validateCredentials()
  DB-->>Auth: user data
  
  Auth->>Auth: generateSessionId()
  Auth->>Session: storeSession(sessionId, userData)
  
  Auth-->>User: Set-Cookie: sessionId
  Note over User,Auth: HttpOnly, Secure, SameSite

  User->>Auth: Protected Request
  Note over User,Auth: Cookie: sessionId
  
  Auth->>Session: validateSession(sessionId)
  Session-->>Auth: user data | null
  
  alt Session Valid
    Auth-->>User: Allow Request
  else Session Invalid
    Auth-->>User: 401 Unauthorized
  end
```

#### Session Configuration
```typescript
interface SessionConfig {
  name: string;           // "auth_session"
  secret: string;         // از environment
  resave: false;
  saveUninitialized: false;
  cookie: {
    secure: boolean;      // true در production
    httpOnly: true;
    maxAge: number;       // 7 days
    sameSite: 'strict';
  };
}
```

### 8.3 مجوزدهی در سطح API

#### Middleware Authorization
```typescript
function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ error: "احراز هویت نشده" });
    }
    
    const hasPermission = checkUserPermission(user, resource, action);
    if (!hasPermission) {
      return res.status(403).json({ error: "دسترسی غیرمجاز" });
    }
    
    next();
  };
}

// Usage
app.post("/api/invoices", 
  requirePermission("invoices", "create"),
  invoiceController.create
);
```

### 8.4 امنیت پرتال عمومی

#### Public Access Validation
```typescript
// پرتال عمومی نمایندگان بدون احراز هویت کلاسیک
function validatePublicAccess(publicId: string): boolean {
  // publicId should be:
  // 1. Alphanumeric only
  // 2. Not contain sensitive info
  // 3. Be mapped to actual representative
  const isValidFormat = /^[a-z0-9]+$/.test(publicId);
  const exists = representativeExists(publicId);
  
  return isValidFormat && exists;
}

// Rate limiting for public portal
const publicPortalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "درخواست‌های بیش از حد"
});
```

### 8.5 ممیزی امنیتی

#### Audit Logging
```typescript
interface AuditLog {
  id: string;
  userId: number;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// Events to audit
const auditableActions = [
  'invoice.create',
  'invoice.update', 
  'invoice.delete',
  'payment.create',
  'representative.create',
  'representative.update',
  'user.login',
  'user.logout',
  'settings.update'
];
```

## 9. لایه AI/LLM (برای پنل CRM)

### 9.1 نقش‌های عامل‌ها (AI Agents)

#### Task Generator Agent
```typescript
class TaskGeneratorAgent {
  private grokEngine: XAIGrokEngine;
  
  async generateDailyTasks(staffId: number): Promise<WorkspaceTask[]> {
    const representatives = await this.getAssignedRepresentatives(staffId);
    const tasks: WorkspaceTask[] = [];
    
    for (const rep of representatives) {
      const aiAnalysis = await this.analyzeRepresentative(rep);
      const suggestedTasks = await this.grokEngine.generateTasks({
        representative: rep,
        context: aiAnalysis,
        culture: "persian_business"
      });
      
      tasks.push(...suggestedTasks);
    }
    
    return this.prioritizeTasks(tasks);
  }
  
  private async analyzeRepresentative(rep: Representative): Promise<RepresentativeContext> {
    return {
      financialHealth: this.calculateFinancialHealth(rep),
      lastContactDays: this.getDaysSinceLastContact(rep.id),
      outstandingIssues: await this.getOutstandingIssues(rep.id),
      salesTrend: await this.calculateSalesTrend(rep.id)
    };
  }
}
```

#### Cultural Adaptation Agent
```typescript
class PersianCulturalAgent {
  async adaptTaskToPersianCulture(task: Task, representative: Representative): Promise<Task> {
    const culturalPrompt = `
    لطفاً این وظیفه را برای فرهنگ کسب‌وکار ایرانی تطبیق دهید:
    
    وظیفه: ${task.description}
    نماینده: ${representative.name}
    
    نکات مهم:
    - احترام و ادب فارسی
    - در نظر گیری تعطیلات و اوقات کاری
    - استفاده از اصطلاحات تجاری مناسب
    `;
    
    const adaptedDescription = await this.grokEngine.generateResponse(culturalPrompt);
    
    return {
      ...task,
      description: adaptedDescription,
      culturalContext: ["persian_business_etiquette", "formal_communication"]
    };
  }
}
```

### 9.2 طراحی پرامپت‌ها

#### Task Generation Prompt Template
```typescript
const TASK_GENERATION_PROMPT = `
شما یک دستیار هوشمند CRM برای کسب‌وکار ایرانی هستید. 
بر اساس اطلاعات زیر، وظایف مناسب برای پیگیری نماینده تولید کنید:

اطلاعات نماینده:
- نام: {representative.name}
- کد: {representative.code}
- مجموع فروش: {representative.totalSales} ریال
- مجموع بدهی: {representative.totalDebt} ریال
- آخرین تماس: {lastContactDays} روز پیش

وضعیت مالی:
{financialAnalysis}

مسائل معوق:
{outstandingIssues}

لطفاً ۱-۳ وظیفه مناسب پیشنهاد دهید. هر وظیفه شامل:
1. عنوان مختصر و روشن
2. توضیح کامل اقدام لازم
3. سطح اولویت (HIGH/MEDIUM/LOW)
4. تخمین زمان انجام

خروجی را در فرمت JSON ارائه دهید:
{
  "tasks": [
    {
      "title": "...",
      "description": "...", 
      "priority": "...",
      "estimatedHours": number,
      "type": "PAYMENT_FOLLOW_UP|RELATIONSHIP_BUILDING|TECHNICAL_SUPPORT|SALES_OPPORTUNITY"
    }
  ],
  "reasoning": "دلیل انتخاب این وظایف",
  "culturalNotes": ["نکات فرهنگی مهم"]
}
`;
```

#### Report Analysis Prompt Template
```typescript
const REPORT_ANALYSIS_PROMPT = `
تحلیل گزارش پشتیبانی مشتری:

اطلاعات نماینده:
- نام: {representative.name}
- بدهی: {representative.totalDebt} ریال
- فروش: {representative.totalSales} ریال

گزارش کارمند پشتیبانی:
"{reportContent}"

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
  "nextContactSuggestion": "1403-02-15",
  "culturalNotes": ["نکته فرهنگی 1"],
  "confidence": 85
}
`;
```

### 9.3 Memory و Knowledge Management

#### Conversation Memory
```typescript
interface ConversationMemory {
  representativeId: number;
  conversationHistory: {
    timestamp: string;
    type: 'task' | 'report' | 'analysis';
    content: string;
    aiResponse: string;
    confidence: number;
  }[];
  insights: {
    personalityTraits: string[];
    communicationPreferences: string[];
    businessChallenges: string[];
  };
  lastUpdated: string;
}

class ConversationMemoryManager {
  async updateMemory(representativeId: number, interaction: Interaction): Promise<void> {
    const memory = await this.getMemory(representativeId);
    
    // Add new interaction
    memory.conversationHistory.push(interaction);
    
    // Keep only last 50 interactions to prevent memory bloat
    if (memory.conversationHistory.length > 50) {
      memory.conversationHistory = memory.conversationHistory.slice(-50);
    }
    
    // Update insights based on new interaction
    await this.updateInsights(memory, interaction);
    
    await this.saveMemory(memory);
  }
}
```

#### RAG (Retrieval Augmented Generation)
```typescript
class KnowledgeRAG {
  private vectorStore: VectorDatabase;
  
  async searchRelevantContext(query: string, representativeId: number): Promise<string[]> {
    // Search in multiple knowledge sources
    const contexts = await Promise.all([
      this.searchRepresentativeHistory(representativeId),
      this.searchSimilarCases(query),
      this.searchBusinessRules(query),
      this.searchCulturalGuidelines(query)
    ]);
    
    return contexts.flat().slice(0, 5); // Top 5 most relevant
  }
  
  private async searchRepresentativeHistory(repId: number): Promise<string[]> {
    const recentTasks = await this.storage.getRecentTasks(repId, 10);
    const recentReports = await this.storage.getRecentReports(repId, 5);
    
    return [...recentTasks, ...recentReports].map(item => 
      `Previous interaction: ${item.content.substring(0, 200)}...`
    );
  }
}
```

### 9.4 AI Risk Management

#### Request Rate Limiting
```typescript
interface AIRateLimits {
  requestsPerMinute: number;    // 10
  requestsPerHour: number;      // 100
  requestsPerDay: number;       // 500
  tokensPerRequest: number;     // 4000
  maxConcurrent: number;        // 3
}

class AIRequestManager {
  private rateLimiter: RateLimiter;
  private activeRequests: Map<string, number> = new Map();
  
  async makeRequest(request: AIRequest): Promise<AIResponse> {
    // Check rate limits
    await this.rateLimiter.checkLimit(request.userId);
    
    // Check concurrent requests
    const userConcurrent = this.activeRequests.get(request.userId) || 0;
    if (userConcurrent >= this.limits.maxConcurrent) {
      throw new Error("حداکثر درخواست‌های همزمان");
    }
    
    try {
      this.activeRequests.set(request.userId, userConcurrent + 1);
      
      // Make actual AI request with timeout
      const response = await Promise.race([
        this.xaiGrok.generate(request),
        this.timeoutPromise(30000) // 30 second timeout
      ]);
      
      // Validate response quality
      return await this.validateResponse(response);
      
    } finally {
      this.activeRequests.set(request.userId, userConcurrent);
    }
  }
}
```

#### Response Quality Validation
```typescript
class ResponseValidator {
  async validateResponse(response: AIResponse): Promise<AIResponse> {
    const validations = [
      this.checkResponseLength(response),
      this.checkLanguageAppropriate(response), 
      this.checkBusinessContext(response),
      this.checkCulturalSensitivity(response)
    ];
    
    const results = await Promise.all(validations);
    const passed = results.every(r => r.valid);
    
    if (!passed) {
      console.warn('AI Response quality issues:', results);
      return this.getFallbackResponse();
    }
    
    return response;
  }
  
  private checkCulturalSensitivity(response: AIResponse): ValidationResult {
    const inappropriateTerms = ['نامناسب۱', 'نامناسب۲']; // real inappropriate terms
    const hasInappropriate = inappropriateTerms.some(term => 
      response.content.includes(term)
    );
    
    return {
      valid: !hasInappropriate,
      issue: hasInappropriate ? 'Cultural sensitivity violation' : null
    };
  }
}
```

## 10. تجربه کاربری اطلاعاتی (UX محتوایی)

### 10.1 نقشه صفحات و Navigation

#### Site Map
```mermaid
graph TD
  A[صفحه ورود مشترک] --> B[پنل مدیریت مالی]
  A --> C[پنل CRM]
  
  B --> D[داشبورد مالی]
  B --> E[مدیریت فاکتورها]
  B --> F[مدیریت نمایندگان]
  B --> G[گزارشات مالی]
  B --> H[تنظیمات سیستم]
  
  C --> I[داشبورد CRM]
  C --> J[فضای کاری - وظایف]
  C --> K[مدیریت نمایندگان CRM]
  C --> L[گزارشات و تحلیل‌ها]
  C --> M[تنظیمات CRM]
  
  N[پرتال عمومی] --> O[/portal/:publicId]
  O --> P[مشاهده فاکتورهای شخصی]
  O --> Q[جزئیات هر فاکتور]
```

#### صفحه ورود مشترک
```typescript
interface LoginPageState {
  activeTab: 'admin' | 'crm';
  credentials: {
    username: string;
    password: string;
  };
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
}

const loginValidation = {
  username: {
    required: true,
    minLength: 3,
    pattern: /^[a-zA-Z0-9_]+$/, // Only alphanumeric and underscore
    errorMessage: "نام کاربری باید حداقل ۳ کاراکتر باشد"
  },
  password: {
    required: true,
    minLength: 6,
    errorMessage: "رمز عبور باید حداقل ۶ کاراکتر باشد"
  }
};
```

### 10.2 فرم‌ها و اعتبارسنجی

#### فرم صدور فاکتور استاندارد
```typescript
interface InvoiceGenerationForm {
  file: File | null;
  batchName: string;
  periodStart: string;    // Persian date: "1403/01/01"
  periodEnd: string;      // Persian date: "1403/01/31"
  description: string;
  invoiceDateMode: 'auto' | 'custom';
  customInvoiceDate: string;
}

const formValidation = {
  file: {
    required: true,
    accept: ['.json'],
    maxSize: 10 * 1024 * 1024, // 10MB
    validate: (file: File) => {
      try {
        const content = file.text();
        JSON.parse(content); // Must be valid JSON
        return true;
      } catch {
        return "فایل باید در فرمت JSON معتبر باشد";
      }
    }
  },
  batchName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    errorMessage: "نام دسته باید بین ۳ تا ۱۰۰ کاراکتر باشد"
  },
  periodStart: {
    required: true,
    format: 'persian_date',
    errorMessage: "تاریخ شروع الزامی است"
  }
};
```

#### فرم ثبت گزارش وظیفه CRM
```typescript
interface TaskReportForm {
  taskId: string;
  content: string;
  status: 'completed' | 'in_progress' | 'blocked';
  nextSteps: string[];
  followUpRequired: boolean;
  attachments: File[];
}

// Real-time validation with Persian support
const contentValidation = {
  minLength: 50,
  maxLength: 2000,
  requiredKeywords: ['تماس', 'نماینده', 'وضعیت'], // Must contain these
  errorMessage: "گزارش باید حداقل ۵۰ کاراکتر و شامل اطلاعات تماس باشد"
};
```

### 10.3 جداول و نمایش داده

#### جدول فاکتورها
```typescript
interface InvoiceTableColumn {
  key: string;
  title: string;
  sortable: boolean;
  filterable: boolean;
  format?: 'currency' | 'date' | 'status';
  width?: string;
}

const invoiceColumns: InvoiceTableColumn[] = [
  { key: 'invoiceNumber', title: 'شماره فاکتور', sortable: true, width: '150px' },
  { key: 'representativeName', title: 'نماینده', sortable: true, filterable: true },
  { key: 'amount', title: 'مبلغ', format: 'currency', sortable: true },
  { key: 'issueDate', title: 'تاریخ صدور', format: 'date', sortable: true },
  { key: 'status', title: 'وضعیت', format: 'status', filterable: true },
  { key: 'actions', title: 'عملیات', sortable: false, width: '120px' }
];

// Status display mapping
const statusDisplay = {
  'unpaid': { label: 'پرداخت نشده', color: 'red', icon: 'clock' },
  'paid': { label: 'پرداخت شده', color: 'green', icon: 'check' },
  'overdue': { label: 'سررسید گذشته', color: 'orange', icon: 'warning' },
  'partially_paid': { label: 'پرداخت جزئی', color: 'blue', icon: 'partial' }
};
```

### 10.4 Empty States و Error Handling

#### Empty States
```typescript
interface EmptyState {
  icon: string;
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const emptyStates = {
  noInvoices: {
    icon: 'invoice',
    title: 'هیچ فاکتوری یافت نشد',
    description: 'برای ایجاد اولین فاکتور، از دکمه "صدور فاکتور" استفاده کنید',
    actionButton: {
      text: 'صدور فاکتور جدید',
      onClick: () => navigate('/invoices/create')
    }
  },
  noTasks: {
    icon: 'tasks',
    title: 'وظیفه‌ای برای امروز ندارید',
    description: 'همه وظایف شما تکمیل شده است. کار عالی!',
    actionButton: {
      text: 'مشاهده وظایف قبلی',
      onClick: () => navigate('/tasks/history')
    }
  }
};
```

#### Error Messages
```typescript
const errorMessages = {
  network: "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.",
  unauthorized: "دسترسی غیرمجاز. لطفاً دوباره وارد شوید.",
  validation: "اطلاعات وارد شده صحیح نیست. لطفاً بررسی کنید.",
  serverError: "خطای سرور. لطفاً چند لحظه بعد تلاش کنید.",
  fileFormat: "فرمت فایل پشتیبانی نمی‌شود. لطفاً فایل JSON بارگذاری کنید.",
  fileSizeExceeded: "حجم فایل بیش از حد مجاز است. حداکثر ۱۰ مگابایت."
};
```

### 10.5 دسترس‌پذیری و i18n

#### Persian Date و Currency Formatting
```typescript
class PersianFormatter {
  static formatDate(date: string | Date): string {
    // Convert to Persian calendar
    const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }).format(new Date(date));
    
    return persianDate; // "1403/02/15"
  }
  
  static formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('fa-IR', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(numAmount) + ' ریال';
    
    // Result: "1,250,000 ریال"
  }
}
```

#### Accessibility Features
```typescript
interface AccessibilityFeatures {
  keyboardNavigation: boolean;    // Full keyboard support
  screenReaderSupport: boolean;   // ARIA labels and roles
  highContrast: boolean;          // High contrast mode
  textScaling: boolean;           // Responsive text sizes
  focusIndicators: boolean;       // Clear focus indicators
}

// ARIA Labels for Persian
const ariaLabels = {
  loginForm: "فرم ورود به سیستم",
  invoiceTable: "جدول فاکتورهای صادر شده", 
  searchBox: "جستجو در فاکتورها",
  filterDropdown: "فیلتر وضعیت فاکتور",
  statusBadge: (status: string) => `وضعیت فاکتور: ${statusDisplay[status].label}`
};
```

## 11. عملکرد، مقیاس‌پذیری و قابلیت اتکا

### 11.1 Caching Strategy

#### Application-Level Caching
```typescript
interface CacheConfig {
  ttl: number;           // Time to live in seconds
  maxSize: number;       // Maximum cache size
  strategy: 'LRU' | 'TTL' | 'LFU';
}

const cacheConfigs = {
  representativeData: { ttl: 300, maxSize: 1000, strategy: 'LRU' },      // 5 minutes
  invoiceList: { ttl: 60, maxSize: 500, strategy: 'TTL' },              // 1 minute
  dashboardStats: { ttl: 180, maxSize: 50, strategy: 'TTL' },           // 3 minutes
  aiResponses: { ttl: 3600, maxSize: 200, strategy: 'LFU' },            // 1 hour
  publicPortalData: { ttl: 600, maxSize: 10000, strategy: 'LRU' }       // 10 minutes
};

class ApplicationCache {
  private cache = new Map();
  
  async get<T>(key: string, fetcher: () => Promise<T>, config: CacheConfig): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < config.ttl * 1000) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Cleanup if cache is too large
    if (this.cache.size > config.maxSize) {
      this.cleanup(config.strategy);
    }
    
    return data;
  }
}
```

#### Database Query Optimization
```sql
-- Essential indexes for performance
CREATE INDEX CONCURRENTLY idx_invoices_representative_status 
ON invoices (representative_id, status) 
WHERE status IN ('unpaid', 'overdue');

CREATE INDEX CONCURRENTLY idx_invoices_date_range 
ON invoices (issue_date DESC) 
WHERE issue_date >= CURRENT_DATE - INTERVAL '6 months';

CREATE INDEX CONCURRENTLY idx_representatives_debt 
ON representatives (total_debt DESC) 
WHERE total_debt > 0;

CREATE INDEX CONCURRENTLY idx_tasks_staff_status 
ON workspace_tasks (staff_id, status, due_date) 
WHERE status IN ('pending', 'in_progress');

-- Composite index for complex queries
CREATE INDEX CONCURRENTLY idx_invoices_complex 
ON invoices (representative_id, status, issue_date DESC, amount);
```

### 11.2 Background Jobs و Queues

#### Task Queue System
```typescript
interface QueueJob {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  createdAt: Date;
}

class JobProcessor {
  private queues = {
    email: new Queue('email', { defaultJobOptions: { removeOnComplete: 10 } }),
    ai: new Queue('ai_processing', { defaultJobOptions: { removeOnComplete: 5 } }),
    reports: new Queue('report_generation', { defaultJobOptions: { removeOnComplete: 20 } }),
    sync: new Queue('data_sync', { defaultJobOptions: { removeOnComplete: 50 } })
  };

  async processAITask(job: QueueJob) {
    const { representativeId, taskType } = job.data;
    
    try {
      const aiResult = await aiService.generateTask(representativeId, taskType);
      await storage.saveAIGeneratedTask(aiResult);
      return { success: true, taskId: aiResult.id };
      
    } catch (error) {
      if (job.attempts < job.maxAttempts) {
        // Exponential backoff retry
        const delay = Math.min(1000 * Math.pow(2, job.attempts), 30000);
        throw new Error(`Retry after ${delay}ms: ${error.message}`);
      }
      
      // Final failure - log and notify
      await this.handleJobFailure(job, error);
      throw error;
    }
  }
}
```

### 11.3 Performance Budgets

#### Response Time SLAs
```typescript
interface PerformanceBudget {
  endpoint: string;
  method: string;
  p50: number;    // 50th percentile (ms)
  p95: number;    // 95th percentile (ms)
  p99: number;    // 99th percentile (ms)
  errorRate: number; // max error rate %
}

const performanceBudgets: PerformanceBudget[] = [
  {
    endpoint: '/api/auth/login',
    method: 'POST',
    p50: 200,
    p95: 500,
    p99: 1000,
    errorRate: 0.1
  },
  {
    endpoint: '/api/invoices/generate-standard', 
    method: 'POST',
    p50: 2000,
    p95: 8000,
    p99: 15000,
    errorRate: 1.0
  },
  {
    endpoint: '/api/dashboard/data',
    method: 'GET',
    p50: 150,
    p95: 400,
    p99: 800,
    errorRate: 0.5
  },
  {
    endpoint: '/api/crm/tasks/generate',
    method: 'POST',
    p50: 1000,
    p95: 3000,
    p99: 8000,
    errorRate: 2.0
  }
];
```

#### Rate Limiting Configuration
```typescript
const rateLimits = {
  global: {
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 1000                    // requests per window
  },
  
  auth: {
    windowMs: 15 * 60 * 1000,    // 15 minutes  
    max: 10,                     // login attempts
    skipSuccessfulRequests: true
  },
  
  api: {
    windowMs: 1 * 60 * 1000,     // 1 minute
    max: 60                      // API calls per minute
  },
  
  upload: {
    windowMs: 10 * 60 * 1000,    // 10 minutes
    max: 5                       // file uploads
  },
  
  ai: {
    windowMs: 1 * 60 * 1000,     // 1 minute
    max: 10                      // AI requests per minute
  },
  
  publicPortal: {
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 100                     // per IP for public portal
  }
};
```

### 11.4 Monitoring و Observability

#### Key Metrics
```typescript
interface SystemMetrics {
  // Application metrics
  requestLatency: HistogramMetric;
  requestCount: CounterMetric;
  errorRate: GaugeMetric;
  activeUsers: GaugeMetric;
  
  // Business metrics
  dailyInvoicesCreated: CounterMetric;
  totalRevenue: GaugeMetric;
  averageDebtPerRepresentative: GaugeMetric;
  
  // AI metrics
  aiRequestLatency: HistogramMetric;
  aiAccuracyRate: GaugeMetric;
  taskCompletionRate: GaugeMetric;
  
  // Infrastructure metrics
  dbConnectionPool: GaugeMetric;
  memoryUsage: GaugeMetric;
  cpuUsage: GaugeMetric;
}

// Alerting thresholds
const alertThresholds = {
  criticalErrors: {
    errorRate: 5,              // > 5% error rate
    responseTime: 10000,       // > 10 seconds
    dbConnections: 0.9         // > 90% of pool used
  },
  
  warningThresholds: {
    errorRate: 2,              // > 2% error rate  
    responseTime: 2000,        // > 2 seconds
    diskUsage: 0.8,           // > 80% disk usage
    aiResponseTime: 30000     // > 30 seconds for AI
  }
};
```

#### Structured Logging
```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  traceId?: string;
  userId?: number;
  representativeId?: number;
  
  // Contextual data
  context?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    userAgent?: string;
    ip?: string;
  };
  
  // Error details
  error?: {
    name: string;
    message: string;
    stack: string;
    code?: string;
  };
}

class StructuredLogger {
  info(message: string, context?: any) {
    this.log('info', message, context);
  }
  
  error(message: string, error?: Error, context?: any) {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
  
  private log(level: string, message: string, context?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'financial-crm',
      traceId: this.getCurrentTraceId(),
      ...context
    };
    
    console.log(JSON.stringify(logEntry));
  }
}
```

## 12. استقرار، محیط‌ها و CI/CD

### 12.1 محیط‌های استقرار

#### Environment Configuration
```typescript
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  DATABASE_URL: string;
  SESSION_SECRET: string;
  
  // External API keys
  XAI_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  SMS_API_KEY: string;
  
  // Feature flags
  ENABLE_AI_FEATURES: boolean;
  ENABLE_TELEGRAM_NOTIFICATIONS: boolean;
  ENABLE_RATE_LIMITING: boolean;
  
  // Performance settings
  DB_POOL_SIZE: number;
  CACHE_TTL: number;
  UPLOAD_MAX_SIZE: number;
  
  // Security settings
  CORS_ORIGINS: string[];
  TRUSTED_PROXIES: string[];
  SESSION_MAX_AGE: number;
}

const environmentConfigs = {
  development: {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://localhost:5432/financial_crm_dev',
    ENABLE_AI_FEATURES: false,      // Disable AI in dev to save costs
    ENABLE_RATE_LIMITING: false,    // Disable rate limiting for dev
    DB_POOL_SIZE: 5,
    CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:5173']
  },
  
  staging: {
    NODE_ENV: 'staging',
    DATABASE_URL: process.env.DATABASE_URL,
    ENABLE_AI_FEATURES: true,       // Test AI features
    ENABLE_RATE_LIMITING: true,     // Test rate limiting
    DB_POOL_SIZE: 10,
    CORS_ORIGINS: ['https://staging-app.example.com']
  },
  
  production: {
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL,
    ENABLE_AI_FEATURES: true,
    ENABLE_RATE_LIMITING: true,
    DB_POOL_SIZE: 20,
    CORS_ORIGINS: ['https://app.example.com']
  }
};
```

### 12.2 Database Migrations

#### Migration Strategy
```typescript
// Migration file example: 001_initial_schema.sql
/*
-- Invoice management tables
CREATE TABLE sales_partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_info JSONB,
    commission_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE representatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    panel_username VARCHAR(50) UNIQUE,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    total_sales DECIMAL(15,2) DEFAULT 0.00,
    total_debt DECIMAL(15,2) DEFAULT 0.00,
    sales_partner_id INTEGER REFERENCES sales_partners(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_representatives_code ON representatives(code);
CREATE INDEX idx_representatives_public_id ON representatives(public_id);
CREATE INDEX idx_representatives_total_debt ON representatives(total_debt) WHERE total_debt > 0;
*/

interface MigrationScript {
  version: string;
  description: string;
  up: string;      // SQL for applying migration
  down: string;    // SQL for reverting migration
  checksum: string;
}

class MigrationRunner {
  async runMigrations(): Promise<void> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = await this.getPendingMigrations(appliedMigrations);
    
    for (const migration of pendingMigrations) {
      console.log(`Applying migration: ${migration.version} - ${migration.description}`);
      
      await this.db.transaction(async (trx) => {
        await trx.raw(migration.up);
        await trx.table('schema_migrations').insert({
          version: migration.version,
          description: migration.description,
          checksum: migration.checksum,
          applied_at: new Date()
        });
      });
    }
  }
}
```

#### Seed Data
```typescript
// seed-data.ts - Initial data for fresh installations
const seedData = {
  adminUsers: [
    {
      username: 'admin',
      password_hash: await hashPassword('admin123'),
      role: 'super_admin',
      permissions: ['*'],
      is_active: true
    }
  ],
  
  salesPartners: [
    {
      name: 'Default Partner',
      contact_info: { email: 'partner@company.com' },
      commission_rate: 5.00,
      is_active: true
    }
  ],
  
  crmUsers: [
    {
      username: 'crm_manager',
      password_hash: await hashPassword('crm123'),
      full_name: 'مدیر CRM',
      role: 'crm_manager',
      permissions: ['crm.*'],
      is_active: true
    },
    {
      username: 'crm_staff',
      password_hash: await hashPassword('staff123'), 
      full_name: 'کارمند پشتیبانی',
      role: 'crm_staff',
      permissions: ['crm.tasks.*', 'crm.reports.*'],
      is_active: true
    }
  ],
  
  // Sample representative for testing
  representatives: [
    {
      name: 'فروشگاه نمونه',
      code: 'SAMPLE_001',
      panel_username: 'sample_shop',
      public_id: 'sample001',
      phone: '09123456789',
      total_sales: '5000000.00',
      total_debt: '1200000.00',
      sales_partner_id: 1,
      is_active: true
    }
  ]
};
```

### 12.3 CI/CD Pipeline

#### Build Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: financial_crm_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run database migrations
      run: npm run db:migrate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/financial_crm_test
    
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/financial_crm_test
    
    - name: Build application
      run: npm run build
      
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/financial_crm_test

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Replit deployment commands
        
  deploy-production:
    needs: test
    runs-on: ubuntu-latest  
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # Replit production deployment
```

### 12.4 Testing Strategy

#### Test Categories
```typescript
// Unit Tests - Business Logic
describe('Financial Engine', () => {
  describe('calculateRepresentativeDebt', () => {
    it('should calculate total debt correctly', async () => {
      const representative = createMockRepresentative({
        id: 1,
        totalSales: 10000000
      });
      
      const unpaidInvoices = [
        { id: 1, amount: 500000, representativeId: 1 },
        { id: 2, amount: 300000, representativeId: 1 }
      ];
      
      const partialPayments = [
        { invoiceId: 1, amount: 100000 }
      ];
      
      jest.spyOn(storage, 'getUnpaidInvoices').mockResolvedValue(unpaidInvoices);
      jest.spyOn(storage, 'getPartialPayments').mockResolvedValue(partialPayments);
      
      const debt = await financialEngine.calculateRepresentativeDebt(1);
      
      expect(debt).toBe(700000); // 500000 - 100000 + 300000
    });
  });
});

// Integration Tests - API Endpoints
describe('Invoice API', () => {
  let app: Application;
  let testDb: Database;
  
  beforeAll(async () => {
    app = createTestApp();
    testDb = await setupTestDatabase();
  });
  
  it('should generate invoices from JSON file', async () => {
    const testFile = createTestJSONFile([
      {
        representativeCode: 'TEST_001',
        usageData: { amount: 850000, period: '1403-01' }
      }
    ]);
    
    const response = await request(app)
      .post('/api/invoices/generate-standard')
      .attach('usageFile', testFile)
      .field('batchName', 'Test Batch')
      .field('periodStart', '1403-01-01')
      .field('periodEnd', '1403-01-31')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.createdInvoices).toBe(1);
    
    // Verify database state
    const invoice = await testDb.invoices.findFirst({
      where: { representativeId: expect.any(Number) }
    });
    expect(invoice.amount).toBe('850000.00');
  });
});

// E2E Tests - Full User Workflows
describe('CRM Workflow', () => {
  let browser: Browser;
  let page: Page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });
  
  it('should complete full task workflow', async () => {
    // Login as CRM user
    await page.goto('http://localhost:5000/login');
    await page.click('[data-testid="crm-tab"]');
    await page.type('[data-testid="username"]', 'crm_staff');
    await page.type('[data-testid="password"]', 'staff123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForSelector('[data-testid="crm-dashboard"]');
    
    // Generate daily tasks
    await page.click('[data-testid="generate-tasks"]');
    await page.waitForSelector('[data-testid="task-list"]');
    
    // Complete a task
    const firstTask = await page.$('[data-testid="task-card"]:first-child');
    await firstTask.click();
    
    await page.type('[data-testid="report-content"]', 'تماس برقرار شد. نماینده وضعیت خوبی دارد.');
    await page.select('[data-testid="task-status"]', 'completed');
    await page.click('[data-testid="submit-report"]');
    
    // Verify completion
    await page.waitForSelector('[data-testid="success-message"]');
    const message = await page.$eval('[data-testid="success-message"]', el => el.textContent);
    expect(message).toContain('گزارش با موفقیت ثبت شد');
  });
});
```

## 13. ریسک‌ها، فرضیات، قیود و موارد خارج از دامنه

### 13.1 ریسک‌های فنی و طرح‌های کاهش

#### ریسک‌های با اولویت بالا
```typescript
interface TechnicalRisk {
  id: string;
  title: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'performance' | 'security' | 'integration' | 'data';
  mitigationPlan: string;
  ownerRole: string;
}

const technicalRisks: TechnicalRisk[] = [
  {
    id: 'RISK-001',
    title: 'AI Service Outage یا Rate Limiting',
    probability: 'MEDIUM',
    impact: 'HIGH',
    category: 'integration',
    mitigationPlan: `
      - Fallback mechanism: تولید وظایف بدون AI
      - Cache کردن پاسخ‌های AI برای استفاده مجدد
      - Circuit Breaker pattern برای XAI API
      - Queue system برای retry درخواست‌های AI
    `,
    ownerRole: 'Backend Developer'
  },
  
  {
    id: 'RISK-002', 
    title: 'Database Performance با رشد داده‌ها',
    probability: 'HIGH',
    impact: 'MEDIUM',
    category: 'performance',
    mitigationPlan: `
      - Partitioning جداول بزرگ بر اساس تاریخ
      - Archive قدیمی‌ترین داده‌ها (> 2 سال)
      - Read Replica برای گزارشات
      - Connection pooling و query optimization
    `,
    ownerRole: 'Database Administrator'
  },
  
  {
    id: 'RISK-003',
    title: 'Session Hijacking در پرتال عمومی',
    probability: 'LOW',
    impact: 'HIGH',
    category: 'security',
    mitigationPlan: `
      - HTTPS اجباری برای همه endpoints
      - Secure cookie settings
      - Rate limiting برای public portal
      - IP whitelisting برای admin panel
    `,
    ownerRole: 'Security Engineer'
  },
  
  {
    id: 'RISK-004',
    title: 'Data Corruption در فرایند JSON Upload',
    probability: 'MEDIUM',
    impact: 'HIGH',
    category: 'data',
    mitigationPlan: `
      - Transaction rollback در صورت خطا
      - Validation چندمرحله‌ای قبل از commit
      - Backup خودکار قبل از bulk operations
      - Dry-run mode برای تست فایل‌های بزرگ
    `,
    ownerRole: 'Backend Developer'
  }
];
```

### 13.2 فرضیات صریح سیستم

#### فرضیات تجاری
```typescript
interface BusinessAssumptions {
  currency: {
    primary: 'IRR';           // تومان/ریال ایران
    supportMultiple: false;   // فقط یک ارز پشتیبانی می‌شود
  };
  
  geography: {
    region: 'Iran';
    timezone: 'Asia/Tehran';
    calendar: 'Persian';      // تقویم شمسی
    workingDays: [1, 2, 3, 4, 5]; // شنبه تا چهارشنبه
  };
  
  businessModel: {
    b2bOnly: true;           // فقط B2B، نه B2C
    creditBased: true;       // مدل اعتباری برای نمایندگان
    subscriptionFree: true;  // بدون مدل subscription
  };
  
  scale: {
    maxRepresentatives: 10000;
    maxInvoicesPerMonth: 100000;
    maxConcurrentUsers: 100;
    maxFileUploadSize: '10MB';
  };
  
  compliance: {
    taxIntegration: false;   // عدم یکپارچگی با سیستم مالیاتی
    bankingIntegration: false; // عدم اتصال مستقیم به بانک
    auditTrail: true;        // ضروری برای audit
  };
}
```

#### فرضیات فنی
```typescript
interface TechnicalAssumptions {
  infrastructure: {
    singleTenant: true;      // نه multi-tenant
    cloudProvider: 'Replit';
    database: 'PostgreSQL';
    sessionStore: 'in-memory'; // نه Redis در فاز اولیه
  };
  
  userBehavior: {
    peakHours: '9AM-6PM Iran Time';
    averageSessionDuration: 30; // minutes
    bulkUploadFrequency: 'monthly';
    mobileUsage: 20; // درصد استفاده موبایل
  };
  
  ai: {
    provider: 'XAI Grok';
    responseTime: '<30 seconds';
    accuracyTarget: 80;      // درصد دقت مورد انتظار
    fallbackRequired: true;  // الزام fallback بدون AI
  };
}
```

### 13.3 محدودیت‌های سیستم

#### محدودیت‌های عملکردی
```typescript
interface SystemLimitations {
  fileProcessing: {
    maxFileSize: '10MB';
    supportedFormats: ['JSON'];
    maxRecordsPerFile: 10000;
    processingTimeout: '5 minutes';
  };
  
  api: {
    rateLimitPerUser: '60 requests/minute';
    maxConcurrentAIRequests: 3;
    maxBulkOperationSize: 1000;
    sessionTimeout: '24 hours';
  };
  
  storage: {
    fileRetention: '2 years';
    logRetention: '1 year';
    maxDatabaseSize: 'No hard limit';
    backupFrequency: 'daily';
  };
  
  ui: {
    supportedBrowsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+'];
    mobileOptimization: 'responsive only';
    offlineSupport: false;
    printingSupport: 'basic';
  };
}
```

### 13.4 موارد خارج از دامنه (Out of Scope)

#### ویژگی‌های خارج از دامنه
```typescript
interface OutOfScopeFeatures {
  financial: [
    'یکپارچگی با سیستم‌های حسابداری خارجی',
    'پردازش پرداخت آنلاین مستقیم',
    'صدور فاکتور رسمی/مالیاتی', 
    'مدیریت انبار و موجودی',
    'سیستم حقوق و دستمزد',
    'گزارشات مالیاتی پیچیده'
  ];
  
  crm: [
    'ادغام با CRMهای خارجی (Salesforce, HubSpot)',
    'کمپین‌های ایمیل مارکتینگ', 
    'سیستم ticket/helpdesk پیچیده',
    'تحلیل sentiment متن فارسی',
    'پیش‌بینی churn مشتری',
    'سیستم امتیازدهی gamification پیچیده'
  ];
  
  technical: [
    'Multi-tenancy (SaaS برای چند شرکت)',
    'Mobile app (iOS/Android)',
    'Real-time chat/messaging',
    'Video conferencing integration',
    'Advanced BI/Analytics dashboard',
    'Machine Learning model training',
    'Blockchain integration',
    'API marketplace/third-party ecosystem'
  ];
  
  operational: [
    'نسخه On-premises',
    'White-labeling برای reseller',
    'Advanced user management (LDAP/AD)',
    'SOC 2/ISO compliance',
    'Multi-region deployment',
    'CDN برای static assets',
    'Load balancing پیچیده'
  ];
}
```

### 13.5 Migration Path و Legacy System

#### استراتژی مهاجرت
```typescript
interface MigrationStrategy {
  phase1: {
    duration: '2 weeks';
    scope: 'پایه‌گذاری سیستم و migration داده‌های پایه';
    steps: [
      'نصب و راه‌اندازی database',
      'import اولیه نمایندگان از Excel/CSV',
      'ایجاد اولین admin user',
      'تست اولیه عملکرد'
    ];
    rollbackPlan: 'بازگشت به سیستم قبلی تا 48 ساعت';
  };
  
  phase2: {
    duration: '4 weeks';
    scope: 'تست تولید و تدوین فرایندهای استاندارد';
    steps: [
      'تست صدور فاکتور با داده‌های واقعی محدود',
      'آموزش team مالی',
      'تدوین workflow‌های استاندارد',
      'Parallel run با سیستم قبلی'
    ];
    rollbackPlan: 'Export داده‌ها و بازگشت به سیستم قبلی';
  };
  
  phase3: {
    duration: '6 weeks';
    scope: 'پیاده‌سازی کامل CRM و AI';
    steps: [
      'تست AI features با داده‌های واقعی',
      'آموزش team پشتیبانی',
      'تنظیم نهایی پرتال عمومی',
      'Go-live کامل'
    ];
    rollbackPlan: 'پیچیده - نیاز به planning اضافی';
  };
}
```

---

## پرسش‌های تکمیلی

برای تکمیل کامل این سند، اطلاعات زیر مفید خواهد بود:

### کسب‌وکار و عملیاتی
• **مدل درآمد دقیق**: آیا از نمایندگان کمیسیون دریافت می‌شود؟ مدل قیمت‌گذاری چگونه است؟
• **انواع فاکتور**: آیا انواع مختلف فاکتور وجود دارد؟ (خدماتی، کالایی، اشتراک)
• **فرایند تسویه**: آیا پرداخت‌های جزئی، تخفیف، جریمه دیرکرد پشتیبانی می‌شود؟
• **تعاملات نماینده**: آیا نمایندگان می‌توانند مستقیماً پرداخت کنند یا فقط مشاهده؟

### فنی و معماری  
• **حجم داده مورد انتظار**: چه تعداد نماینده، فاکتور، تراکنش در ماه؟
• **یکپارچگی‌های خارجی**: آیا نیاز به اتصال به بانک، SMS gateway، accounting software هست؟
• **Backup و Disaster Recovery**: سیاست پشتیبان‌گیری و بازیابی چیست؟
• **Security requirements**: آیا نیاز به رمزگذاری داده‌ها، 2FA، audit logs هست؟

### AI و CRM
• **نوع داده‌های AI**: چه نوع داده‌هایی برای تحلیل AI در دسترس است؟
• **مدل‌های مخصوص**: آیا نیاز به fine-tuning مدل برای domain خاص هست؟
• **Integration requirements**: آیا باید با Telegram، WhatsApp، Email یکپارچه شود؟
• **Reporting needs**: چه نوع گزارش‌هایی مد نظر است؟ Dashboard، Export، Schedule؟

### محیط استقرار
• **Cloud vs On-premises**: ترجیح استقرار کجاست؟  
• **Budget constraints**: محدودیت‌های بودجه برای infrastructure و third-party services؟
• **Team size**: اندازه تیم توسعه و نگهداری چقدر است؟
• **Timeline**: زمان‌بندی مورد انتظار برای MVP و full deployment چیست؟

پر کردن این اطلاعات، سند را کامل‌تر و قابل پیاده‌سازی‌تر خواهد کرد.

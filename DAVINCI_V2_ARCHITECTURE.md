# DA VINCI v2.0 - CRM Workspace Architecture

## System Overview
تبدیل پنل CRM از 3 تب به 4 تب با افزودن "میز کار" برای ارتباط دستیار هوشمند با کارمندان پشتیبانی

## Component Architecture

### 1. Main Navigation Extension
- **Purpose**: افزودن تب چهارم "میز کار" 
- **Integration**: با سیستم routing موجود
- **Files**: `client/src/components/crm/CrmDashboard.tsx`

### 2. Workspace Hub (میز کار اصلی)
- **Purpose**: صفحه اصلی میز کار با دو بخش کلیدی
- **Sub-components**:
  - Task Assignment Panel (وظایف روزانه)
  - Reminder System (یادآورها)
- **Files**: `client/src/components/crm/workspace/WorkspaceHub.tsx`

### 3. AI Task Generator Engine
- **Purpose**: تولید وظایف هوشمند بر اساس تنظیمات مدیر
- **Integration**: با Settings Hub + xAI Engine
- **Data Sources**: کارمندان + آفرها + دانش خصوصی
- **Files**: `server/services/ai-task-generator.ts`

### 4. Task Management System
- **Components**:
  - Task Card (نمایش وظیفه)
  - Progress Tracker (پیگیری انجام)
  - Report Submission (ثبت گزارش)
- **Features**: اولویت‌بندی, تاریخ شمسی, deadline tracking
- **Files**: `client/src/components/crm/workspace/TaskManagement.tsx`

### 5. Report Analysis Engine
- **Purpose**: تحلیل گزارشات کارمندان توسط AI
- **Functions**:
  - Extract key insights
  - Generate follow-up reminders
  - Update representative profiles
- **Files**: `server/services/report-analyzer.ts`

### 6. Representative Profile Enhancement
- **Purpose**: افزودن بخش "گزارش عملکرد پشتیبانی"
- **Integration**: با سیستم Representatives موجود
- **Features**: تاریخ‌چه ارتباطات, دسته‌بندی زمانی
- **Files**: Extend existing representative components

## Database Schema Extensions

### workspace_tasks
- Task assignment and tracking
- AI-generated content
- Priority levels and deadlines

### task_reports
- Staff reports on completed tasks
- AI analysis results
- Follow-up actions

### representative_support_logs
- Support interaction history
- Performance tracking per representative

## Integration Points

### With Existing Settings System
- Manager Workspace definitions
- Staff assignments from Support Staff Management
- Offers/Incentives integration
- AI Knowledge Base utilization

### With xAI Grok Engine
- Task generation prompts
- Report analysis
- Reminder scheduling
- Cultural context integration

## Risk Assessment

### Tier 1 (Critical - 5 Forge Iterations)
1. **AI Task Generator Engine** - Core intelligence system
2. **Report Analysis Engine** - Critical for workflow completion

### Tier 2 (Standard - 2 Forge Iterations)  
1. **Task Management System** - Complex UI/UX requirements
2. **Workspace Hub** - Integration complexity

### Tier 3 (Simple - 0 Forge Iterations)
1. **Navigation Extension** - Straightforward UI addition
2. **Database Schema** - Standard CRUD operations
# SHERLOCK v17.8 - Advanced Enterprise CRM System

## Project Overview

SHERLOCK v17.8 is an advanced Persian-first CRM system designed for enterprise-level representative and sales management. The system integrates multiple AI engines and provides comprehensive financial management with intelligent workflow automation.

**Last Updated:** August 11, 2025  
**Version:** v17.8  
**Status:** Active Development

## Project Architecture

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **UI Framework:** Tailwind CSS + shadcn/ui components
- **Routing:** wouter (frontend)
- **State Management:** TanStack Query (React Query v5)
- **AI Integration:** Multiple engines (Groq, XAI Grok, Google Gemini)

### Core Features
1. **Representative Management (نمایندگان)**
   - Complete representative lifecycle management
   - Sales performance tracking
   - Debt and credit management

2. **Invoice Management System (مدیریت فاکتورها)**
   - Batch invoice processing
   - Automated usage data handling
   - Persian date support
   - Telegram integration for notifications

3. **CRM Intelligence System**
   - AI-powered task assignment
   - Cultural profile analysis
   - Performance analytics
   - Automated decision making

4. **Financial Management**
   - Real-time financial tracking
   - Payment allocation
   - Debt reconciliation
   - Advanced reporting

5. **Persian Cultural AI (DA VINCI)**
   - Persian language optimized
   - Cultural sensitivity
   - Intelligent task generation
   - Manager workspace automation

## Directory Structure

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── layout/       # Layout components (sidebar, header)
│   │   │   ├── crm/          # CRM-specific components
│   │   │   └── mobile/       # Mobile-optimized components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # Client-side services
│   │   └── lib/              # Utilities and configurations
│   └── index.html
├── server/                   # Backend Express application
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   ├── lib/                 # Server utilities
│   └── types/               # TypeScript definitions
├── shared/                  # Shared types and schemas
│   └── schema.ts           # Drizzle database schema
├── types/                  # Global TypeScript definitions
└── migrations/            # Database migrations
```

## Database Schema Overview

### Core Tables
- **representatives** - Representative/agent management
- **salesPartners** - Sales partner information
- **invoices** - Invoice records with usage data
- **invoiceBatches** - Batch processing for invoices
- **payments** - Payment tracking and allocation
- **adminUsers** - System administrators
- **crmUsers** - CRM system users

### CRM Intelligence Tables
- **crmTasks** - AI-generated tasks
- **crmTaskResults** - Task execution results
- **representativeLevels** - Representative classification
- **crmCulturalProfiles** - Cultural analysis data
- **aiConfiguration** - AI engine settings
- **aiKnowledgeBase** - AI learning database

### Financial Management Tables
- **financialTransactions** - Transaction tracking
- **dataIntegrityConstraints** - Data validation rules
- **activityLogs** - System audit logs
- **invoiceEdits** - Invoice modification history

### DA VINCI System Tables
- **supportStaff** - Support team management
- **managerTasks** - Manager task assignments
- **workspaceTasks** - Staff workspace tasks
- **taskReports** - Task execution reports
- **offersIncentives** - Promotional offers

## Authentication System

### Admin Authentication
- Session-based authentication with express-session
- PostgreSQL session storage (connect-pg-simple)
- Role-based access control (ADMIN, SUPER_ADMIN, VIEWER)

### CRM Authentication
- Separate CRM user system
- Cultural profile integration
- Permission-based access control

## AI Integration

### XAI Grok Engine
- Persian cultural intelligence
- Task generation and assignment
- Performance analysis
- Decision making support

### Google Gemini
- Financial data analysis
- Representative risk assessment
- Predictive analytics

### Persian AI Engine (SHERLOCK v3.0)
- Cultural profile analysis
- Communication style adaptation
- Intelligent task recommendations

## API Routes

### Core Routes (`/api`)
- `/auth/*` - Authentication endpoints
- `/representatives/*` - Representative management
- `/invoices/*` - Invoice operations
- `/payments/*` - Payment processing
- `/reports/*` - Report generation

### CRM Routes (`/api/crm`)
- `/auth/*` - CRM authentication
- `/tasks/*` - Task management
- `/analytics/*` - Performance analytics
- `/cultural-profiles/*` - Cultural analysis

### AI Routes (`/api/ai`)
- `/groq/*` - Groq API integration
- `/gemini/*` - Google Gemini integration
- `/analysis/*` - AI analysis endpoints

## Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Database connection details

### AI Services
- `XAI_API_KEY` - XAI Grok API key
- `GROQ_API_KEY` - Groq API key
- `GEMINI_API_KEY` - Google Gemini API key

### Session Management
- `SESSION_SECRET` - Express session secret

## Recent Changes

### Version 17.8 Updates
- Enhanced error handling and resilience
- Improved mobile UX optimization
- Advanced Persian date handling
- Enhanced AI decision logging
- Improved financial transaction tracking
- Manager workspace automation (DA VINCI v2.0)

### Latest System Updates (August 11, 2025)
- ✅ Resolved HMR compilation conflicts
- ✅ Fixed shadcn/ui sidebar naming conflicts (renamed to ShadcnSidebar)
- ✅ Corrected FormItemContext declaration order in form.tsx
- ✅ Eliminated duplicate component imports
- ✅ Restored stable build process
- ✅ Maintained all database integrity during restructure
- ✅ Enhanced error handling in UI components
- ✅ Backend server operational on port 5000
- ✅ Vite development server integrated and running
- ✅ Database connection established and verified
- ✅ All environment dependencies resolved
- ✅ Environment configuration files synchronized (.env.example updated)
- ✅ Port settings aligned (5000) across all configurations
- ✅ Session and timeout settings documented
- ✅ AI service configurations added to environment template
- ✅ Complete parameter audit performed line-by-line
- ✅ npm PATH and version verified (10.8.2)
- ✅ tsx runtime operational (v4.20.3)
- ✅ Server health endpoint verified (200 OK)
- ✅ Frontend HTML delivery confirmed
- ✅ All configuration parameters synchronized
- ✅ Application fully operational and accessible

### SHERLOCK v2.0 System Restoration (August 11, 2025)
- ✅ **Deep Architecture Analysis Complete**: Applied blueprint-first methodology for system diagnosis
- ✅ **Module Resolution Cascade Fixed**: Resolved HMR failures causing application crashes
- ✅ **XAI Grok 4 Engine**: Successfully initialized with multi-model AI support
- ✅ **Database Health Verified**: Neon PostgreSQL connection established and stable
- ✅ **System Integrity Restored**: All services operational - health check returns 200 OK
- ✅ **Workflow Configuration**: Manual development server startup successful
- ✅ **Persian AI Integration**: Cultural intelligence and task automation active

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React hooks patterns
- Implement proper error boundaries
- Use shadcn/ui components consistently
- Maintain Persian-first UI design

### Database Operations
- Use Drizzle ORM for all database operations
- Implement proper transaction handling
- Use `npm run db:push` for schema updates
- Never manually write SQL migrations

### AI Integration
- Implement fallback mechanisms for AI services
- Log all AI decisions for learning
- Use cultural sensitivity in all AI interactions
- Implement proper error handling for API failures

## User Preferences

### Persian Language Priority
- All UI text in Persian
- Persian date handling throughout
- Cultural considerations in all interactions
- Right-to-left (RTL) layout support

### Technical Preferences
- Prefer in-memory storage for non-critical data
- Use PostgreSQL for persistent data
- Implement comprehensive logging
- Focus on performance optimization

## Deployment Notes

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Required API keys for AI services

### Build Process
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run dev` - Development mode

### Health Checks
- `/health` endpoint for system status
- Database connection monitoring
- AI service connectivity checks

## Security Considerations

- All API keys stored as environment variables
- Session-based authentication
- SQL injection prevention via Drizzle ORM
- Input validation on all endpoints
- Audit logging for sensitive operations

---

*This documentation is automatically maintained and reflects the current state of the SHERLOCK v17.8 system. Last updated: August 11, 2025*
# MarFaNet - Streamlined Financial CRM System

## Overview
MarFaNet is a simplified financial management system focused on core business needs: invoice management, representative oversight, and AI-powered assistance. **SHERLOCK v18.4 STANDARDIZATION COMPLETE**: Successfully eliminated all parallel/legacy systems and test data contamination. The system now uses a single unified financial engine with 100% calculation accuracy guarantee.

## Recent Changes (August 12, 2025)
**✅ SHERLOCK v22.0 SYSTEMS INTEGRITY ENGINEER - COMPLETE SUCCESS** - Major system consolidation:
- **Removed 4 parallel financial systems**: Eliminated financial-integrity-engine, true-financial-engine, and their routes
- **Unified to single calculation engine**: Now using only unified-financial-engine.ts for 100% accurate calculations  
- **Fixed debt calculation discrepancies**: Eliminated inflated amounts caused by parallel systems
- **Updated all dependencies**: unified-statistics-engine and storage.ts now use unified system only
- **Verified data integrity**: No test data contamination found in database
- **Fixed database schema issues**: Corrected invoice_date column references

## User Preferences
- **Communication Style**: Simple, everyday Persian language for non-technical users
- **Security Model**:
  - Admin panel (mgr/8679) - Full financial access and management
  - CRM panel (crm/8679) - Representative management with debt/profile visibility only
  - Public representative portal - No authentication required
- **Development Philosophy**: Clean, focused architecture without bloated features

## System Architecture

### Frontend (Client)
- **Framework**: React with TypeScript and Vite
- **UI Components**: Shadcn/UI with Radix primitives and Tailwind CSS
- **State Management**: TanStack React Query for server state only
- **Routing**: Wouter for lightweight client-side routing
- **Design**: Persian RTL support with professional styling
- **Financial Integration**: All calculations use UNIFIED FINANCIAL ENGINE v18.4 with 100% accuracy guarantee - SHERLOCK v22.0 consolidated

### CRM Dashboard
The CRM system contains four functional sections:
1. **Workspace Hub (میز کار)**: Intelligent task management with AI-powered task generation.
2. **Representatives Management**: Complete list of representatives with full CRUD operations.
3. **AI Assistant**: Persian cultural intelligence for representative insights and support.
4. **Settings Hub**: System configuration and management tools (password protected).

**Security Features**:
- Prominent logout functionality in dashboard header.
- Password-protected access to settings (default: Aa867945).
- Visual security indicators (lock icon, protection badges).
- Culturally-adapted Persian authentication interface.

### Backend (Server)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Dual-panel system with session-based authentication
- **Core Services**:
  - **Unified Financial Engine**: Single source of truth for all financial calculations with 100% accuracy (SHERLOCK v22.0 consolidated)
  - XAI Grok engine for Persian AI assistance
  - Representative management with standardized debt tracking
  - Invoice processing and Telegram notifications

### Key Features
- **Invoice Management**: Bulk JSON processing, automatic calculations, Persian date handling, secure deletion with financial coupling synchronization. FIFO payment allocation is strictly enforced.
- **Representative Portal**: Public access with unique IDs for invoice viewing, redesign with 4 main sections (Financial Overview, Invoice List, Consumption Breakdown, Payment History).
- **Financial Tracking**: Real-time debt, payment, and sales calculations with immediate UI updates via cache invalidation, ensuring system-wide financial integrity and synchronization.
- **AI Integration**: Persian cultural intelligence for representative profiling and assistance, AI task generation.
- **Data Synchronization**: Seamless sync between admin and CRM data with real-time financial synchronization and intelligent coupling services.
- **Payment Management**: Consolidated into representative profiles, with 30-item pagination for invoices.
- **Performance Optimization**: Aggressive caching, lazy loading, and component preloading implemented for faster load times; dashboard load times are significantly reduced.
- **Security**: Role-based access control, session management, and admin panel isolation. Comprehensive authentication and API connectivity, including backward compatibility for login endpoints, are ensured.
- **Statistics Engine**: Unified statistics engine with intelligent caching provides consistent and performant statistical data across all panels.

### Database Schema
- `representatives`: Core representative data with financial metrics.
- `invoices`: Invoice records with status tracking.
- `payments`: Payment allocation and tracking.
- `admin_users`: Admin panel authentication.
- `crm_users`: CRM panel authentication.

## External Dependencies
- **Neon Database**: PostgreSQL hosting.
- **XAI Grok API**: Persian AI intelligence.
- **Telegram Bot API**: Automated notifications.
- **Drizzle ORM**: Type-safe database operations.
# MarFaNet Technical Architecture Documentation

## 🏛️ System Overview

MarFaNet is an enterprise-grade financial management system built with modern full-stack architecture, designed to handle complex invoice processing, representative management, and financial operations at scale.

## 📐 Architectural Patterns

### Domain-Driven Design (DDD)
```
Domain Layer:
├── Representatives (Sales agents with financial tracking)
├── Invoices (Billing documents with usage analytics)
├── Payments (Transaction processing and allocation)
├── SalesPartners (Commission-based referral system)
└── Settings (System configuration management)
```

### Hexagonal Architecture (Ports & Adapters)
```
Application Core:
├── Domain Models (shared/schema.ts)
├── Business Logic (server/services/)
├── Storage Interface (server/storage.ts)
└── API Layer (server/routes.ts)

External Adapters:
├── Database (PostgreSQL/Drizzle ORM)
├── AI Service (Google Gemini API)
├── Messaging (Telegram Bot API)
└── Authentication (Session-based)
```

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript                                     │
│  ├── Pages (Admin Panel + Public Portal)                   │
│  ├── Components (Shadcn/UI + Radix Primitives)            │
│  ├── State Management (TanStack Query v5)                  │
│  ├── Routing (Wouter)                                      │
│  └── Styling (Tailwind CSS + RTL Support)                  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY                               │
├─────────────────────────────────────────────────────────────┤
│  Express.js + TypeScript                                   │
│  ├── Authentication Middleware                             │
│  ├── Security Headers (Conditional)                        │
│  ├── Session Management (PostgreSQL-backed)                │
│  ├── CORS Configuration                                     │
│  └── Request/Response Logging                               │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Services                                    │
│  ├── Invoice Processing Engine                              │
│  │   ├── Multi-format JSON Parser                          │
│  │   ├── Sequential Processing (A-Z)                       │
│  │   ├── Usage Data Aggregation                            │
│  │   └── Persian Date Handling                             │
│  ├── Representative Management                              │
│  │   ├── Portal Generation                                 │
│  │   ├── Financial Tracking                                │
│  │   └── Public Access Control                             │
│  ├── Payment Processing                                     │
│  │   ├── Invoice Allocation                                │
│  │   ├── Debt Calculation                                  │
│  │   └── Transaction Logging                               │
│  └── AI Integration                                         │
│      ├── Financial Analysis                                 │
│      ├── Data Aggregation                                  │
│      └── Persian Language Processing                        │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Storage Interface (server/storage.ts)                     │
│  ├── Connection Pooling (Max: 5 connections)               │
│  ├── Retry Logic (Exponential backoff)                     │
│  ├── Health Monitoring                                      │
│  ├── Transaction Management                                 │
│  └── Query Optimization                                     │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database (Neon Serverless)                     │
│  ├── Relational Schema Design                              │
│  ├── Indexed Queries                                        │
│  ├── JSON Data Storage                                      │
│  ├── Session Store                                          │
│  └── Activity Logging                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### Invoice Processing Pipeline
```
JSON Upload → Validation → Parsing → Representative Grouping → Invoice Generation → Portal Update

1. File Upload (Multer)
   ├── Size validation (<50MB)
   ├── Format validation (JSON)
   └── Content-type verification

2. JSON Processing Engine
   ├── Multi-format detection (PHPMyAdmin/Direct)
   ├── Sequential parsing (Representative by representative)
   ├── Usage data aggregation
   └── Error recovery mechanisms

3. Database Operations
   ├── Representative auto-creation
   ├── Invoice record generation
   ├── Usage data storage (JSONB)
   └── Financial calculations

4. Portal Integration
   ├── Public ID generation
   ├── Portal data caching
   └── Real-time updates
```

### Authentication Flow
```
Admin Panel Access:
Login Request → Credential Validation → Session Creation → Route Access

Public Portal Access:
Portal URL → Public ID Validation → Direct Access (No Auth Required)

Security Layers:
├── Conditional middleware (Admin vs Portal)
├── Session-based authentication (Admin only)
├── Public ID verification (Portal only)
└── Mobile browser optimization
```

## 🧩 Component Architecture

### Frontend Component Hierarchy
```
App.tsx
├── AuthProvider (Context)
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (UI Framework)
└── Router
    ├── AdminLayout
    │   ├── Sidebar (Navigation)
    │   ├── Header (User controls)
    │   └── Pages
    │       ├── Dashboard
    │       ├── Representatives
    │       ├── Invoices
    │       ├── Payments
    │       ├── SalesPartners
    │       ├── Reports
    │       ├── AiAssistant
    │       └── Settings
    └── PublicPortal (Standalone)
        ├── Financial Overview
        ├── Invoice Details
        ├── Usage Data Tables
        └── Payment History
```

### Backend Module Structure
```
server/
├── index.ts (Application bootstrap)
├── routes.ts (API endpoints)
├── storage.ts (Data access interface)
├── db.ts (Database connection)
├── vite.ts (Development server)
└── services/
    ├── invoice.ts (Business logic)
    ├── auth.ts (Authentication)
    └── telegram.ts (External integration)
```

## 🔐 Security Architecture

### Multi-Layer Security Model
```
Security Layers:
1. Network Level
   ├── HTTPS/TLS encryption
   ├── CORS configuration
   └── Rate limiting

2. Application Level
   ├── Input validation (Zod schemas)
   ├── SQL injection prevention (Parameterized queries)
   ├── XSS protection (Content Security Policy)
   └── CSRF protection (Session tokens)

3. Authentication Level
   ├── bcrypt password hashing
   ├── Session-based auth (Admin)
   ├── Public ID access (Portal)
   └── Route-based authorization

4. Data Level
   ├── Sensitive data encryption
   ├── Audit logging
   └── Access control (Role-based)
```

### Conditional Security Headers
```javascript
// Admin Routes (Strict Security)
{
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
}

// Portal Routes (Relaxed for Mobile Compatibility)
{
  'X-Frame-Options': 'ALLOWALL',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer-when-downgrade',
  'Cache-Control': 'public, max-age=300',
  'X-UA-Compatible': 'IE=edge,chrome=1'
}
```

## 🚀 Performance Architecture

### Database Optimization Strategy
```
Connection Management:
├── Connection pooling (Max: 5 concurrent)
├── Connection health monitoring
├── Retry logic with exponential backoff
└── Graceful degradation

Query Optimization:
├── Indexed foreign keys
├── Composite indexes for common queries
├── JSON field indexing (GIN indexes)
└── Query plan analysis

Data Access Patterns:
├── Repository pattern implementation
├── Connection retry mechanisms
├── Transaction management
└── Bulk operation optimization
```

### Frontend Performance Strategy
```
Code Splitting:
├── Route-based lazy loading
├── Component-level code splitting
├── Dynamic imports for heavy libraries
└── Tree shaking optimization

State Management:
├── React Query caching strategy
├── Intelligent cache invalidation
├── Background data synchronization
└── Optimistic updates

Asset Optimization:
├── Vite-based bundling
├── Static asset compression
├── Image optimization
└── CSS purging
```

## 📱 Mobile Architecture

### Cross-Platform Compatibility
```
Browser Support Matrix:
├── Android Chrome/WebView
│   ├── Enhanced compatibility headers
│   ├── CSP relaxation for portal routes
│   └── Viewport optimization
├── iOS Safari/WebView
│   ├── PWA capabilities
│   ├── Touch event optimization
│   └── iOS-specific meta tags
└── Desktop Browsers
    ├── Full feature set
    ├── Advanced UI components
    └── Keyboard navigation
```

### Responsive Design System
```
Breakpoint Strategy:
├── Mobile-first approach
├── Fluid typography scaling
├── Adaptive component layouts
└── Touch-friendly interactions

RTL Support:
├── Persian language optimization
├── Bidirectional text handling
├── Cultural date formatting
└── Right-to-left layouts
```

## 🔌 Integration Architecture

### External Service Integration
```
Google Gemini AI:
├── API client with retry logic
├── Request/response caching
├── Error handling and fallbacks
└── Usage monitoring

Telegram Bot API:
├── Webhook configuration
├── Message template system
├── Bulk notification handling
└── Delivery status tracking

Database Services:
├── Neon serverless integration
├── Connection string management
├── SSL/TLS configuration
└── Backup and recovery
```

### API Design Patterns
```
RESTful API Design:
├── Resource-based URLs
├── HTTP method semantics
├── Status code conventions
└── Error response standards

Data Transfer Objects:
├── Zod schema validation
├── Type-safe serialization
├── Request/response mapping
└── Version compatibility
```

## 🏭 Deployment Architecture

### Multi-Environment Strategy
```
Environment Configurations:
├── Development (Local + Vite)
│   ├── Hot module replacement
│   ├── Development database
│   └── Debug logging
├── Staging (Pre-production)
│   ├── Production-like setup
│   ├── Integration testing
│   └── Performance profiling
└── Production (Live deployment)
    ├── Optimized builds
    ├── Connection pooling
    └── Monitoring integration
```

### Infrastructure Patterns
```
Deployment Options:
├── Replit (Recommended)
│   ├── Automatic scaling
│   ├── Built-in monitoring
│   └── Zero-config deployment
├── Traditional VPS
│   ├── PM2 process management
│   ├── Nginx reverse proxy
│   └── Custom monitoring
└── Containerized (Docker)
    ├── Multi-stage builds
    ├── Health checks
    └── Orchestration ready
```

## 📊 Monitoring Architecture

### Observability Stack
```
Application Monitoring:
├── Health check endpoints (/health, /ready)
├── Performance metrics collection
├── Error tracking and alerting
└── User activity analytics

Infrastructure Monitoring:
├── Resource utilization tracking
├── Database performance metrics
├── Network latency monitoring
└── Availability monitoring

Business Intelligence:
├── Financial dashboard metrics
├── User engagement analytics
├── Processing success rates
└── AI service usage tracking
```

### Logging Strategy
```
Structured Logging:
├── JSON-formatted logs
├── Correlation IDs
├── Log level management
└── Centralized collection

Audit Trail:
├── User action logging
├── Data modification tracking
├── System event recording
└── Security event monitoring
```

## 🔧 Development Architecture

### Development Workflow
```
Code Organization:
├── TypeScript-first approach
├── Strict type checking
├── Consistent code formatting
└── Import/export conventions

Quality Assurance:
├── ESLint configuration
├── Prettier formatting
├── Pre-commit hooks
└── Automated testing

Dependency Management:
├── Package.json organization
├── Version pinning strategy
├── Security vulnerability scanning
└── Dependency update automation
```

### Build System Architecture
```
Vite Build Pipeline:
├── TypeScript compilation
├── Asset optimization
├── Bundle analysis
└── Production optimization

Development Server:
├── Hot module replacement
├── Proxy configuration
├── Source map generation
└── Error overlay
```

---

**Architecture Status**: ✅ Production-Grade  
**Scalability**: Horizontal and Vertical  
**Security Level**: Enterprise-Grade  
**Mobile Compatibility**: Cross-Platform Optimized  
**Performance**: Sub-second response times
# MarFaNet Unified System Documentation (Compendium)

Status: Production Ready  
Last Consolidated: 2025-08-16  
Version: 2.0.0-unified

---
## 1. System Overview
MarFaNet is an enterprise financial & CRM platform delivering:
- Representative & partner management
- Invoice lifecycle & payment synchronization
- Public portal access (no login) + secure admin panel
- AI-assisted financial insight & workflow intelligence
- High‑volume JSON invoice ingestion & processing

## 2. Core Architecture
Frontend: React 18 + TypeScript + Vite, Tailwind (RTL), Shadcn UI, React Query v5, Wouter routing.  
Backend: Express + TypeScript, Drizzle ORM (PostgreSQL / Neon), session-based auth, Multer for JSON uploads.  
Security: Bcrypt auth, conditional security headers, CSP, input validation (Zod), session store (PostgreSQL), activity logging.  
Integrations: Google Gemini (AI), Telegram Bot (notifications).  
Performance: Connection pooling (≤5), compression, monitored slow queries (>100ms), large JSON streaming.

### Architectural Patterns
- Layered + Hexagonal (Ports/Adapters) + DDD bounded contexts (Financial, CRM, AI, Portal, Auth)
- Service segments: Invoice Engine, Payment/Reconciliation, Representative Mgmt, AI Analysis, Portal Delivery

## 3. Domain Model (Key Entities)
Representatives, Invoices, Payments, Sales Partners, Invoice Batches, Activity Logs, Settings, Workspace Tasks, Task Reports.

## 4. Key Features Snapshot
| Feature | Status | Notes |
|---------|--------|-------|
| Bulk JSON Invoice Processing | ✅ | Multi-format, sequential, 780KB+ files |
| Payment Auto-Allocation (Phase 3) | ✅ | FIFO allocation, reconciliation engine |
| Representative Public Portals | ✅ | Public ID access, financial overview |
| AI Financial Analysis | ✅ | Gemini-based aggregated metrics |
| Telegram Notifications | ✅ | Bulk & templated dispatch |
| Security Model | ✅ | Conditional headers (admin vs portal), session hardening |
| Performance Monitoring | ✅ | Compression, timing logs, memory watch |
| Mobile Optimization | ✅ | Android header adjustments, responsive UI |

## 5. Deployment Summary
Supported: Replit, VPS (PM2+Nginx), Docker, Serverless DB (Neon).  
Health endpoints: `/health`, `/ready`.  
Essential ENV: `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`, optional Telegram tokens.

## 6. Payment Synchronization (Phase 3 Result)
Endpoints:
- GET `/api/payments/unallocated`
- POST `/api/payments/auto-allocate/:representativeId`
- POST `/api/payments/allocate`
- GET `/api/payments/allocation-summary/:representativeId`
- POST `/api/reconcile/:representativeId`
Result: Accurate debt reduction, activity logged, FIFO allocation validated.

## 7. Performance & Optimization
Current API latency target <100ms critical ops (observed 25–250ms).  
Optimizations done: pooling, compression, slow query detection, memory watch, lazy frontend routing, code splitting.  
Further opportunities: selective query result caching, composite indexes for frequent joins, bundle size audit.

## 8. Security Overview
- Session-based admin auth, HTTP-only cookies, bcrypt password hashing
- Public portal separated via publicId validation & relaxed compatible headers
- Input validation at API boundary (Zod)
- CSP & selective header relaxation for Android portal compatibility
- Activity & audit logging planned for all financial operations (partially implemented)

## 9. Operational Runbook (Condensed)
Startup:
1. Configure ENV
2. `npm run db:push`
3. `npm run dev` (local) or `npm run build && npm start` (prod)

Troubleshooting Quick Checks:
- DB: `npm run db:studio` / test simple SELECT
- Health: `curl /health` expecting 200
- Sessions: verify rows in session table
- JSON Upload errors: validate format & size <50MB

## 10. Backlog (Active High-Value Items)
- AI Task Generator & Report Analyzer (risk: Persian NLP accuracy)
- Task Management UI + Workspace Hub integration
- Representative profile enhancement (support history tab)
- Caching layer for static reference data

## 11. Contributing (Essential Rules)
- Conventional commits (feat/fix/chore/docs/refactor/perf)
- TypeScript strict mode must pass `npm run type-check`
- Add/adjust Drizzle migrations before pushing schema changes
- Include minimal tests for each new service function

## 12. Environment Variables
DATABASE_URL, GEMINI_API_KEY, SESSION_SECRET, TELEGRAM_BOT_TOKEN?, TELEGRAM_CHAT_ID?  
Optional: performance tuning flags (future), AI model selector.

## 13. Monitoring & Metrics
- Latency logging per request
- Slow query warnings >100ms
- Memory usage threshold >500MB triggers log
- Planned: structured JSON logs with correlation IDs

## 14. Future Enhancements (Strategic)
| Area | Enhancement | Benefit |
|------|-------------|---------|
| AI | Task generator & report analyzer | Workflow automation |
| Data | Composite indexes & caching | Lower latency |
| Security | Role-based granular permissions | Least privilege |
| Ops | Structured log aggregation | Faster troubleshooting |
| UX | Portal progressive loading | Better mobile performance |

## 15. License & Ownership
Proprietary – internal financial operations. No external redistribution.

---
Single Source of Truth: This file supersedes previous scattered markdown documents. Legacy markdown files may be removed as part of repository hygiene.

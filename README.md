# MarFaNet Financial Management System

## 🏛️ Enterprise Architecture Overview

MarFaNet is a comprehensive financial management system designed for enterprise-level invoice processing, representative management, and financial operations. Built with a modern full-stack architecture, it provides advanced features like AI-powered financial analysis, Telegram integration, bulk JSON processing, and multi-platform portal access.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (recommended: v20+)
- **PostgreSQL**: v14+ (Neon serverless recommended)
- **API Keys**: Google Gemini AI, Telegram Bot (optional)

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd marfanet-financial-system

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Configure DATABASE_URL and GEMINI_API_KEY in .env

# Database setup
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

**Default Admin Credentials:**
- Username: `mgr`
- Password: `8679`

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **React 18** with TypeScript and Vite
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with RTL support for Persian
- **State Management**: TanStack React Query v5
- **Routing**: Wouter (lightweight client-side routing)
- **Form Management**: React Hook Form with Zod validation

#### Backend
- **Express.js** with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Processing**: Multer for JSON upload handling
- **Authentication**: bcrypt + session-based auth

#### External Integrations
- **AI Analysis**: Google Gemini API
- **Messaging**: Telegram Bot API
- **Database Provider**: Neon serverless PostgreSQL

### Database Schema

```sql
-- Core entities
- representatives: Sales representatives with financial tracking
- invoices: Billing documents with usage data and Persian dates
- payments: Payment tracking with invoice allocation
- sales_partners: Commission-based referral partners
- activity_logs: Comprehensive system activity tracking
- settings: Configurable system parameters
- admin_users: Administrative user management
```

### API Architecture

#### Admin Panel Routes (Protected)
```
GET    /api/dashboard          # Financial overview
GET    /api/representatives    # Representative management
GET    /api/invoices          # Invoice operations
POST   /api/invoices/generate # Bulk JSON processing
GET    /api/payments          # Payment tracking
GET    /api/settings/*        # System configuration
```

#### Public Portal Routes (Unprotected)
```
GET    /api/portal/:publicId  # Representative portal access
GET    /portal/:publicId      # Public portal interface
```

## 📊 Key Features

### 1. Advanced JSON Processing Engine
- **Multi-format Support**: PHPMyAdmin exports, direct arrays, nested objects
- **Sequential Processing**: Alphabetical representative ordering (A-Z)
- **Large File Handling**: 780KB+ files with 200+ representatives
- **Error Recovery**: Comprehensive validation and graceful failure handling
- **Progress Tracking**: Real-time processing feedback with Persian timestamps

### 2. Representative Portal System
- **Public Access**: Secure portal links without authentication
- **Mobile Optimization**: Android/iOS browser compatibility
- **Usage Details**: Expandable invoice records with detailed usage data
- **Financial Overview**: Debt tracking, payment history, account status
- **Persian UI**: Complete RTL support with Persian number formatting

### 3. Enterprise Authentication
- **Dual Security Model**: 
  - Admin panel requires authentication
  - Public portals remain accessible
- **Session Management**: PostgreSQL-backed sessions with 24-hour expiration
- **Security Headers**: Conditional headers for admin vs portal routes
- **Mobile Compatibility**: Android browser-specific optimizations

### 4. AI-Powered Financial Analysis
- **Google Gemini Integration**: Advanced financial insights
- **Data Aggregation**: Real-time financial metrics processing
- **Persian Language Support**: Localized AI responses
- **Comprehensive Analytics**: Debt analysis, payment patterns, trends

### 5. Telegram Integration
- **Automated Notifications**: Invoice delivery via Telegram
- **Bulk Operations**: Send to single/multiple/all representatives
- **Template System**: Customizable message templates
- **Settings Panel**: Bot configuration and message customization

## 🔧 Development Guide

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Application pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Utility functions
│   │   └── contexts/     # React contexts
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── db.ts            # Database connection
│   └── services/        # Business logic
├── shared/               # Shared TypeScript schemas
└── dist/                # Production build output
```

### Development Commands

```bash
# Development server (frontend + backend)
npm run dev

# Database operations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio

# Production build
npm run build            # Build for production
npm start               # Start production server

# Type checking
npm run type-check      # TypeScript validation
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host/db"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"

# Session Security
SESSION_SECRET="your-session-secret"

# Telegram (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"
```

## 🚀 Production Deployment

### Replit Deployment (Recommended)

1. **Environment Setup**:
   ```bash
   # Required environment variables
   DATABASE_URL=<neon-postgresql-url>
   GEMINI_API_KEY=<google-ai-key>
   SESSION_SECRET=<random-secure-string>
   ```

2. **Build Process**:
   ```bash
   npm run build
   ```

3. **Production Start**:
   ```bash
   npm start
   ```

### Manual Deployment

1. **Server Requirements**:
   - Node.js 18+
   - PostgreSQL 14+
   - 512MB+ RAM
   - SSL certificate (recommended)

2. **Build & Deploy**:
   ```bash
   # Build application
   npm run build
   
   # Start with PM2 (recommended)
   pm2 start dist/server/index.js --name marfanet
   
   # Or direct start
   NODE_ENV=production node dist/server/index.js
   ```

## 🔐 Security Features

### Authentication & Authorization
- **Admin Panel**: Session-based authentication with bcrypt password hashing
- **Public Portals**: Secure publicId-based access without authentication
- **Session Security**: HTTP-only cookies with CSRF protection

### Security Headers
- **Conditional Headers**: Different policies for admin vs portal routes
- **CORS Configuration**: Comprehensive cross-origin resource sharing
- **Content Security Policy**: XSS protection with Android compatibility
- **Frame Options**: Controlled iframe embedding permissions

### Data Protection
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **File Upload Security**: Validated JSON processing with size limits
- **Error Handling**: Sanitized error responses

## 📱 Mobile Compatibility

### Android Browser Support
- **Enhanced Headers**: Android-specific compatibility headers
- **Session Optimization**: Conditional session middleware for portals
- **Retry Logic**: Exponential backoff for network resilience
- **Cache Strategy**: Optimized caching for mobile performance

### iOS Browser Support
- **Safari Compatibility**: Tested and verified on iOS Safari
- **PWA Ready**: Progressive Web App capabilities
- **Touch Optimization**: Mobile-first responsive design

## ⚡ Performance Optimizations

### Database
- **Connection Pooling**: Optimized PostgreSQL connections (max: 5)
- **Query Optimization**: Indexed queries with efficient joins
- **Retry Logic**: Exponential backoff for database operations
- **Health Monitoring**: Startup database health checks

### Frontend
- **Code Splitting**: Vite-based lazy loading
- **Asset Optimization**: Minimized bundle sizes
- **Caching Strategy**: React Query with intelligent cache invalidation
- **Persian Date Handling**: Optimized Persian calendar utilities

### File Processing
- **Large File Support**: 780KB+ JSON files with progress tracking
- **Memory Management**: Strategic garbage collection during processing
- **Timeout Handling**: Extended timeouts for bulk operations (10 minutes)
- **Sequential Processing**: Efficient representative-by-representative handling

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues
```bash
# Check database status
npm run db:studio

# Verify environment variables
echo $DATABASE_URL

# Test connection
node -e "const { checkDatabaseHealth } = require('./dist/server/db'); checkDatabaseHealth()"
```

#### Portal Access Issues
- Verify publicId format in URL
- Check security headers in browser dev tools
- Test on different browsers/devices
- Confirm representative exists in database

#### JSON Processing Failures
- Validate JSON format with online validators
- Check file size limits (<50MB)
- Verify admin_username fields exist
- Review processing logs for specific errors

#### Authentication Problems
- Clear browser cookies and sessions
- Verify admin credentials (mgr/8679)
- Check session configuration in database
- Confirm trust proxy settings

## 📈 Monitoring & Analytics

### System Monitoring
- **Health Endpoints**: `/health` and `/ready` for load balancers
- **Activity Logging**: Comprehensive system activity tracking
- **Performance Metrics**: Response time monitoring
- **Error Tracking**: Structured error logging with stack traces

### Business Intelligence
- **Financial Dashboard**: Real-time debt and payment tracking
- **Representative Analytics**: Sales performance and activity metrics
- **Invoice Processing**: Bulk operation success rates
- **AI Insights**: Gemini-powered financial recommendations

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automated code formatting
- **Persian Support**: RTL-first design principles

### Testing
- **Unit Tests**: Jest for utility functions
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Portal functionality testing
- **Load Testing**: JSON processing performance

## 📄 License

This project is proprietary software developed for MarFaNet financial operations.

## 🆘 Support

For technical support or deployment assistance:
- Review troubleshooting section above
- Check system logs and error messages
- Verify all environment variables
- Ensure database connectivity
- Test with minimal representative data first

---

**System Status**: ✅ Production Ready  
**Last Updated**: January 2025  
**Version**: 2.0.0  
**Architecture**: Full-stack TypeScript with PostgreSQL
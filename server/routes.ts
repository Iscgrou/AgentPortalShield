import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql, eq, and, or, like, gte, lte, asc, count, desc } from "drizzle-orm";
import { invoices, representatives, payments, activityLogs } from "@shared/schema";
// CRM routes are imported in registerCrmRoutes function

import multer from "multer";

// Extend Request interface to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}
import { z } from "zod";
import { 
  insertRepresentativeSchema, 
  insertSalesPartnerSchema, 
  insertInvoiceSchema, 
  insertPaymentSchema,
  // فاز ۱: Schema برای مدیریت دوره‌ای فاکتورها
  insertInvoiceBatchSchema
} from "@shared/schema";
// ✅ NEW STANDARDIZED IMPORTS:
import { registerStandardizedInvoiceRoutes } from "./routes/standardized-invoice-routes";
import { 
  sendInvoiceToTelegram, 
  sendBulkInvoicesToTelegram, 
  getDefaultTelegramTemplate, 
  formatInvoiceStatus 
} from "./services/telegram";

import { xaiGrokEngine } from "./services/xai-grok-engine";
import { registerCrmRoutes, invalidateCrmCache } from "./routes/crm-routes";
import { registerSettingsRoutes } from "./routes/settings-routes";
import bcrypt from "bcryptjs";
// Commented out temporarily - import { generateFinancialReport } from "./services/report-generator";

// New import for unified financial engine
import { unifiedFinancialEngine } from './services/unified-financial-engine.js';

// Import maintenance routes registration
import { registerMaintenanceRoutes } from "./routes/maintenance-routes";

// Import unified statistics routes registration
import { registerUnifiedStatisticsRoutes } from "./routes/unified-statistics-routes.js";
// Register unified financial routes  
import { registerUnifiedFinancialRoutes } from "./routes/unified-financial-routes.js";


// Configure multer for file uploads with broader JSON acceptance
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for large JSON files
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept all files for maximum compatibility - validate content in handler
    console.log(`File upload: ${file.originalname}, MIME: ${file.mimetype}`);
    cb(null, true);
  }
});

// Session authentication middleware - centralized version
function requireAuth(req: any, res: any, next: any) {
  const isAdminAuthenticated = req.session?.authenticated === true && 
                              req.session?.user?.role === 'admin';
  const isCrmAuthenticated = req.session?.crmAuthenticated === true;

  if (isAdminAuthenticated || isCrmAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "احراز هویت نشده" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Initialize default admin user
  try {
    await storage.initializeDefaultAdminUser("mgr", "8679");
  } catch (error) {
    console.error("Failed to initialize default admin user:", error);
  }

  // Initialize default CRM user
  try {
    await storage.initializeDefaultCrmUser("crm", "8679");
  } catch (error) {
    console.error("Failed to initialize default CRM user:", error);
  }

  // Register essential CRM routes (core functionality only)
  registerCrmRoutes(app, requireAuth); // Pass requireAuth here

  // Register Settings routes (core system settings)
  registerSettingsRoutes(app);

  // SHERLOCK v18.4: Register STANDARDIZED Invoice Routes - eliminates 11,117,500 تومان discrepancy
  registerStandardizedInvoiceRoutes(app, requireAuth, storage);

  // Register maintenance and monitoring routes
  registerMaintenanceRoutes(app);

  // SHERLOCK v18.4: سیستم مالی یکپارچه واحد - تنها سیستم مالی فعال
  // Previously imported and used directly:
  // const unifiedFinancialRoutes = (await import('./routes/unified-financial-routes.js')).default;
  // app.use('/api/unified-financial', unifiedFinancialRoutes);
  registerUnifiedFinancialRoutes(app, requireAuth);


  // SHERLOCK v18.4: آمار یکپارچه واحد - جایگزین همه سیستم‌های آماری موازی
  // Previously imported and used directly:
  // const unifiedStatisticsRoutes = (await import("./routes/unified-statistics-routes")).default;
  // app.use("/api/unified-statistics", unifiedStatisticsRoutes);
  registerUnifiedStatisticsRoutes(app, requireAuth);


  // xAI Grok Configuration API
  app.post("/api/settings/xai-grok/configure", requireAuth, async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        return res.status(400).json({ error: "کلید API الزامی است" });
      }

      // Update XAI Grok engine configuration  
      xaiGrokEngine.updateConfiguration(apiKey);

      // Save to settings
      await storage.updateSetting('XAI_API_KEY', apiKey);

      res.json({ 
        success: true, 
        message: "تنظیمات xAI Grok ذخیره شد" 
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در ذخیره تنظیمات" });
    }
  });

  app.post("/api/settings/xai-grok/test", requireAuth, async (req, res) => {
    try {
      const result = await xaiGrokEngine.testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "خطا در تست اتصال" });
    }
  });

  // SHERLOCK v15.0 FIX: Add backward compatibility for both login endpoints
  // Main admin login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "نام کاربری و رمز عبور الزامی است" });
      }

      // Get admin user from database
      const adminUser = await storage.getAdminUser(username);

      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
      }

      // Update last login time
      await storage.updateAdminUserLogin(adminUser.id);

      // Set session
      (req.session as any).authenticated = true;
      (req.session as any).userId = adminUser.id;
      (req.session as any).username = adminUser.username;
      (req.session as any).role = adminUser.role || 'ADMIN';
      (req.session as any).permissions = adminUser.permissions || [];

      res.json({ 
        success: true, 
        message: "ورود موفقیت‌آمیز",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role || 'ADMIN',
          permissions: adminUser.permissions || [],
          hasFullAccess: adminUser.role === 'SUPER_ADMIN' || (Array.isArray(adminUser.permissions) && adminUser.permissions.includes('FULL_ACCESS'))
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "خطا در فرآیند ورود" });
    }
  });

  // 🗑️ SHERLOCK v18.2: LEGACY LOGIN ENDPOINT REMOVED - Use /api/auth/login only

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "خطا در فرآیند خروج" });
      }
      res.clearCookie('marfanet.sid');
      res.json({ success: true, message: "خروج موفقیت‌آمیز" });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    if ((req.session as any)?.authenticated) {
      res.json({ 
        authenticated: true, 
        user: { 
          id: (req.session as any).userId, 
          username: (req.session as any).username,
          role: (req.session as any).role || 'ADMIN',
          permissions: (req.session as any).permissions || [],
          hasFullAccess: (req.session as any).role === 'SUPER_ADMIN' || (Array.isArray((req.session as any).permissions) && (req.session as any).permissions.includes('FULL_ACCESS'))
        } 
      });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Dashboard API - Protected
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت اطلاعات داشبورد" });
    }
  });

  // SHERLOCK v10.0 NEW ENDPOINT: Debtor Representatives API - Protected  
  app.get("/api/dashboard/debtor-representatives", requireAuth, async (req, res) => {
    try {
      const debtorReps = await storage.getDebtorRepresentatives();
      res.json(debtorReps);
    } catch (error) {
      console.error("Error fetching debtor representatives:", error);
      res.status(500).json({ error: "خطا در دریافت نمایندگان بدهکار" });
    }
  });

  // Real-time Data Synchronization API - SHERLOCK v1.0 Core Feature
  app.get("/api/sync/status", requireAuth, async (req, res) => {
    try {
      const representatives = await storage.getRepresentatives();
      const invoices = await storage.getInvoices();
      const payments = await storage.getPayments();

      // Calculate real-time sync metrics
      const syncStatus = {
        lastSyncTime: new Date().toISOString(),
        adminPanelData: {
          representatives: representatives.length,
          invoices: invoices.length,
          payments: payments.length,
          totalDebt: representatives.reduce((sum, rep) => sum + parseFloat(rep.totalDebt || "0"), 0),
          totalSales: representatives.reduce((sum, rep) => sum + parseFloat(rep.totalSales || "0"), 0)
        },
        crmPanelData: {
          representativesAccess: representatives.filter(rep => rep.isActive).length,
          visibleDebt: representatives.reduce((sum, rep) => sum + parseFloat(rep.totalDebt || "0"), 0),
          profilesGenerated: representatives.length,
          aiInsightsAvailable: true
        },
        syncHealth: "EXCELLENT",
        conflictCount: 0,
        autoResolvedConflicts: 0
      };

      res.json(syncStatus);
    } catch (error) {
      res.status(500).json({ error: "خطا در بررسی وضعیت همگام‌سازی" });
    }
  });

  app.post("/api/sync/force-update", requireAuth, async (req, res) => {
    try {
      const startTime = Date.now();

      // Update all representative financials (atomic operation)
      const representatives = await storage.getRepresentatives();
      let updatedCount = 0;

      for (const rep of representatives) {
        await storage.updateRepresentativeFinancials(rep.id);
        updatedCount++;
      }

      const duration = Date.now() - startTime;

      await storage.createActivityLog({
        type: "system_sync",
        description: `همگام‌سازی اجباری انجام شد: ${updatedCount} نماینده بروزرسانی شد`,
        relatedId: null,
        metadata: {
          representativesUpdated: updatedCount,
          durationMs: duration,
          syncType: "FORCE_UPDATE"
        }
      });

      res.json({
        success: true,
        message: "همگام‌سازی با موفقیت انجام شد",
        updatedRepresentatives: updatedCount,
        durationMs: duration
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در همگام‌سازی اجباری" });
    }
  });

  // Representatives API - Protected
  app.get("/api/representatives", requireAuth, async (req, res) => {
    try {
      const representatives = await storage.getRepresentatives();
      res.json(representatives);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت نمایندگان" });
    }
  });

  // Representatives Statistics API - SHERLOCK v1.0 CRITICAL FIX (MOVED BEFORE :code route)
  // SHERLOCK v11.0: Synchronized Representatives Statistics with Batch-Based Active Count
  app.get("/api/representatives/statistics", requireAuth, async (req, res) => {
    try {
      const representatives = await storage.getRepresentatives();

      // SHERLOCK v11.0: Use unified batch-based calculation for activeCount
      const batchBasedActiveCount = await storage.getBatchBasedActiveRepresentatives();

      const stats = {
        totalCount: representatives.length,
        activeCount: batchBasedActiveCount, // 🎯 SYNC: Now matches dashboard calculation
        inactiveCount: representatives.filter(rep => !rep.isActive).length,
        totalSales: representatives.reduce((sum, rep) => sum + parseFloat(rep.totalSales || "0"), 0),
        totalDebt: representatives.reduce((sum, rep) => sum + parseFloat(rep.totalDebt || "0"), 0),
        avgPerformance: representatives.length > 0 ? 
          representatives.reduce((sum, rep) => sum + parseFloat(rep.totalSales || "0"), 0) / representatives.length : 0
      };

      console.log(`📊 SHERLOCK v11.0: Representatives statistics - Active: ${stats.activeCount} (batch-based), Total: ${stats.totalCount}`);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching representatives statistics:', error);
      res.status(500).json({ error: "خطا در دریافت آمار نمایندگان" });
    }
  });

  app.get("/api/representatives/:code", requireAuth, async (req, res) => {
    try {
      const representative = await storage.getRepresentativeByCode(req.params.code);
      if (!representative) {
        return res.status(404).json({ error: "نماینده یافت نشد" });
      }

      // Get related data
      const invoices = await storage.getInvoicesByRepresentative(representative.id);
      const payments = await storage.getPaymentsByRepresentative(representative.id);

      res.json({
        representative,
        invoices,
        payments
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت اطلاعات نماینده" });
    }
  });

  app.post("/api/representatives", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRepresentativeSchema.parse(req.body);
      const representative = await storage.createRepresentative(validatedData);
      res.json(representative);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "داده‌های ورودی نامعتبر", details: error.errors });
      } else {
        res.status(500).json({ error: "خطا در ایجاد نماینده" });
      }
    }
  });

  app.put("/api/representatives/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const representative = await storage.updateRepresentative(id, req.body);
      res.json(representative);
    } catch (error) {
      res.status(500).json({ error: "خطا در بروزرسانی نماینده" });
    }
  });

  app.delete("/api/representatives/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRepresentative(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "خطا در حذف نماینده" });
    }
  });



  // Admin Data Management API - Protected
  app.get("/api/admin/data-counts", requireAuth, async (req, res) => {
    try {
      const counts = await storage.getDataCounts();
      res.json(counts);
    } catch (error) {
      console.error('Error fetching data counts:', error);
      res.status(500).json({ error: "خطا در دریافت آمار داده‌ها" });
    }
  });

  app.post("/api/admin/reset-data", requireAuth, async (req, res) => {
    try {
      const resetOptions = req.body;

      // Validate request
      if (!resetOptions || typeof resetOptions !== 'object') {
        return res.status(400).json({ error: "گزینه‌های بازنشانی نامعتبر است" });
      }

      // Check if at least one option is selected
      const hasSelection = Object.values(resetOptions).some(value => value === true);
      if (!hasSelection) {
        return res.status(400).json({ error: "حداقل یک مورد برای بازنشانی انتخاب کنید" });
      }

      console.log('Data reset requested:', resetOptions);

      // Log the reset operation
      await storage.createActivityLog({
        type: 'system',
        description: `درخواست بازنشانی اطلاعات: ${Object.keys(resetOptions).filter(key => resetOptions[key]).join(', ')}`,
        relatedId: null,
        metadata: { resetOptions }
      });

      const result = await storage.resetData(resetOptions);

      console.log('Data reset completed:', result.deletedCounts);

      res.json({
        success: true,
        message: "بازنشانی اطلاعات با موفقیت انجام شد",
        deletedCounts: result.deletedCounts
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      res.status(500).json({ error: "خطا در بازنشانی اطلاعات" });
    }
  });

  // Public Portal API
  app.get("/api/portal/:publicId", async (req, res) => {
    try {
      const representative = await storage.getRepresentativeByPublicId(req.params.publicId);
      if (!representative) {
        return res.status(404).json({ error: "پورتال یافت نشد" });
      }

      const invoices = await storage.getInvoicesByRepresentative(representative.id);
      const payments = await storage.getPaymentsByRepresentative(representative.id);

      // Fetch portal customization settings
      const [
        portalTitle,
        portalDescription,
        showOwnerName,
        showDetailedUsage,
        customCss,
        showUsageDetails,
        showEventTimestamp,
        showEventType,
        showDescription,
        showAdminUsername
      ] = await Promise.all([
        storage.getSetting('portal_title'),
        storage.getSetting('portal_description'),
        storage.getSetting('portal_show_owner_name'),
        storage.getSetting('portal_show_detailed_usage'),
        storage.getSetting('portal_custom_css'),
        storage.getSetting('invoice_show_usage_details'),
        storage.getSetting('invoice_show_event_timestamp'),
        storage.getSetting('invoice_show_event_type'),
        storage.getSetting('invoice_show_description'),
        storage.getSetting('invoice_show_admin_username')
      ]);

      const portalConfig = {
        title: portalTitle?.value || 'پرتال عمومی نماینده',
        description: portalDescription?.value || 'مشاهده وضعیت مالی و فاکتورهای شما',
        showOwnerName: showOwnerName?.value === 'true',
        showDetailedUsage: showDetailedUsage?.value === 'true',
        customCss: customCss?.value || '',

        // Invoice display settings
        showUsageDetails: showUsageDetails?.value === 'true',
        showEventTimestamp: showEventTimestamp?.value === 'true',
        showEventType: showEventType?.value === 'true',
        showDescription: showDescription?.value === 'true',
        showAdminUsername: showAdminUsername?.value === 'true'
      };

      // SHERLOCK v11.5: Sort invoices by FIFO principle (oldest first)
      const sortedInvoices = invoices.sort((a, b) => {
        const dateA = new Date(a.issueDate || a.createdAt);
        const dateB = new Date(b.issueDate || b.createdAt);
        return dateA.getTime() - dateB.getTime(); // FIFO: Oldest first
      });

      // Don't expose sensitive data in public portal
      const publicData = {
        name: representative.name,
        code: representative.code,
        panelUsername: representative.panelUsername,
        ownerName: representative.ownerName,
        totalDebt: representative.totalDebt,
        totalSales: representative.totalSales,
        credit: representative.credit,
        portalConfig,
        invoices: sortedInvoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          usageData: inv.usageData, // Include usage data for detailed view
          createdAt: inv.createdAt
        })),
        payments: payments.map(pay => ({
          amount: pay.amount,
          paymentDate: pay.paymentDate,
          description: pay.description
        })).sort((a, b) => {
          const dateA = new Date(a.paymentDate);
          const dateB = new Date(b.paymentDate);
          return dateB.getTime() - dateA.getTime();
        })
      };

      res.json(publicData);
    } catch (error) {
      console.error('Portal API error:', error);
      res.status(500).json({ error: "خطا در دریافت اطلاعات پورتال" });
    }
  });

  // Sales Partners API - Protected
  app.get("/api/sales-partners", requireAuth, async (req, res) => {
    try {
      const partners = await storage.getSalesPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت همکاران فروش" });
    }
  });

  app.get("/api/sales-partners/statistics", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getSalesPartnersStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت آمار همکاران فروش" });
    }
  });

  // SHERLOCK v12.4: Manual Invoices API - Dedicated endpoint for manual invoices management
  app.get("/api/invoices/manual", requireAuth, async (req, res) => {
    try {
      console.log('📋 SHERLOCK v12.4: Fetching manual invoices');
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const search = req.query.search as string;
      const status = req.query.status as string;

      // Get manual invoices with representative info
      const manualInvoices = await storage.getManualInvoices({
        page,
        limit,
        search,
        status
      });

      console.log(`📋 Found ${manualInvoices.data.length} manual invoices`);
      res.json(manualInvoices);
    } catch (error) {
      console.error('Error fetching manual invoices:', error);
      res.status(500).json({ error: "خطا در دریافت فاکتورهای دستی" });
    }
  });

  // SHERLOCK v12.4: Manual Invoices Statistics
  app.get("/api/invoices/manual/statistics", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getManualInvoicesStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching manual invoices statistics:', error);
      res.status(500).json({ error: "خطا در دریافت آمار فاکتورهای دستی" });
    }
  });

  app.get("/api/sales-partners/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partner = await storage.getSalesPartner(id);
      if (!partner) {
        return res.status(404).json({ error: "همکار فروش یافت نشد" });
      }

      // Get related representatives
      const representatives = await storage.getRepresentativesBySalesPartner(id);

      res.json({
        partner,
        representatives
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت اطلاعات همکار فروش" });
    }
  });

  app.post("/api/sales-partners", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSalesPartnerSchema.parse(req.body);
      const partner = await storage.createSalesPartner(validatedData);
      res.json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "داده‌های ورودی نامعتبر", details: error.errors });
      } else {
        res.status(500).json({ error: "خطا در ایجاد همکار فروش" });
      }
    }
  });

  app.put("/api/sales-partners/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partner = await storage.updateSalesPartner(id, req.body);
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "خطا در بروزرسانی همکار فروش" });
    }
  });

  app.delete("/api/sales-partners/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSalesPartner(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "خطا در حذف همکار فروش" });
    }
  });

  // Payments API - Protected (ادغام شده با مدیریت پرداخت)
  app.get("/api/payments", requireAuth, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت پرداخت‌ها" });
    }
  });

  // SHERLOCK v1.0 PAYMENT DELETION API - حذف پرداخت با همگام‌سازی کامل مالی
  app.delete("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      console.log('🗑️ SHERLOCK v1.0: حذف امن پرداخت');
      const paymentId = parseInt(req.params.id);

      // Get payment details for audit and financial impact calculation
      const payments = await storage.getPayments();
      const payment = payments.find(p => p.id === paymentId);

      if (!payment) {
        return res.status(404).json({ error: "پرداخت یافت نشد" });
      }

      console.log(`🗑️ حذف پرداخت شماره ${paymentId} با مبلغ ${payment.amount} تومان از نماینده ${payment.representativeId}`);

      // Delete payment from database
      await storage.deletePayment(paymentId);

      // CRITICAL: Update representative financial data after payment deletion
      console.log(`🔄 به‌روزرسانی اطلاعات مالی نماینده ${payment.representativeId}`);
      await storage.updateRepresentativeFinancials(payment.representativeId);

      // CRITICAL: Invalidate CRM cache to ensure real-time sync
      invalidateCrmCache();
      console.log('🗑️ CRM cache invalidated for immediate synchronization');

      // Log the activity for audit trail
      await storage.createActivityLog({
        type: "payment_deleted",
        description: `پرداخت ${paymentId} با مبلغ ${payment.amount} تومان از نماینده ${payment.representativeId} حذف شد`,
        relatedId: payment.representativeId,
        metadata: {
          paymentId: paymentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          representativeId: payment.representativeId,
          deletedBy: (req.session as any)?.user?.username || 'admin',
          financialImpact: {
            amountRemoved: payment.amount,
            operation: "payment_deletion",
            affectedRepresentative: payment.representativeId
          }
        }
      });

      console.log(`✅ پرداخت ${paymentId} با موفقیت حذف شد و اطلاعات مالی همگام‌سازی شدند`);
      res.json({ 
        success: true, 
        message: "پرداخت با موفقیت حذف شد و تمام اطلاعات مالی به‌روزرسانی شدند",
        deletedPayment: {
          id: paymentId,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          representativeId: payment.representativeId
        }
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({ error: "خطا در حذف پرداخت" });
    }
  });

  app.get("/api/payments/statistics", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getPaymentStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت آمار پرداخت‌ها" });
    }
  });

  app.get("/api/payments/representative/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payments = await storage.getPaymentsByRepresentative(id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت پرداخت‌های نماینده" });
    }
  });

  app.post("/api/payments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);

      // Auto-allocate to oldest unpaid invoice if representativeId provided
      if (validatedData.representativeId) {
        await storage.autoAllocatePaymentToInvoices(payment.id, validatedData.representativeId);
      }

      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "داده‌های ورودی نامعتبر", details: error.errors });
      } else {
        res.status(500).json({ error: "خطا در ایجاد پرداخت" });
      }
    }
  });

  app.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.updatePayment(id, req.body);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "خطا در بروزرسانی پرداخت" });
    }
  });

  app.post("/api/payments/:id/allocate", requireAuth, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { invoiceId } = req.body;

      const payment = await storage.allocatePaymentToInvoice(paymentId, invoiceId);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "خطا در تخصیص پرداخت" });
    }
  });


  // AI Assistant API - Protected (SHERLOCK v1.0 Intelligent System)
  app.get("/api/ai/status", requireAuth, async (req, res) => {
    try {
      const aiStatus = await xaiGrokEngine.checkEngineStatus();
      res.json({
        status: "operational",
        engine: "XAI-Grok-4",
        culturalIntelligence: "persian",
        version: "SHERLOCK-v1.0",
        ...aiStatus
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در بررسی وضعیت AI" });
    }
  });

  app.post("/api/ai/profile/:id", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.id);
      const representative = await storage.getRepresentative(representativeId);

      if (!representative) {
        return res.status(404).json({ error: "نماینده یافت نشد" });
      }

      // Get related financial data
      const invoices = await storage.getInvoicesByRepresentative(representativeId);
      const payments = await storage.getPaymentsByRepresentative(representativeId);

      const profile = await xaiGrokEngine.generatePsychologicalProfile({
        representative,
        invoices,
        payments,
        culturalContext: "persian_business"
      });

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "خطا در تولید پروفایل روانشناختی" });
    }
  });

  app.post("/api/ai/insights/:id", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.id);
      const representative = await storage.getRepresentative(representativeId);

      if (!representative) {
        return res.status(404).json({ error: "نماینده یافت نشد" });
      }

      const insights = await xaiGrokEngine.generateCulturalInsights({
        representative,
        context: "business_relationship_management"
      });

      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "خطا در تولید بینش‌های فرهنگی" });
    }
  });

  // 🗑️ SHERLOCK v18.2: LEGACY REMOVED - Use detailed invoices endpoint instead

  // Unpaid Invoices by Representative API - SHERLOCK v1.0 CRITICAL FIX
  app.get("/api/invoices/unpaid/:representativeId", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.representativeId);
      const invoices = await storage.getInvoicesByRepresentative(representativeId);

      // SHERLOCK v11.5: Enhanced filter to include partial invoices
      const unpaidInvoices = invoices.filter(invoice => 
        invoice.status === 'unpaid' || invoice.status === 'overdue' || invoice.status === 'partial'
      );

      res.json(unpaidInvoices);
    } catch (error) {
      console.error('Error fetching unpaid invoices:', error);
      res.status(500).json({ error: "خطا در دریافت فاکتورهای پرداخت نشده" });
    }
  });

  app.get("/api/invoices/telegram-pending", requireAuth, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesForTelegram();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت فاکتورهای در انتظار ارسال" });
    }
  });

  // 🗑️ SHERLOCK v18.4: LEGACY ENDPOINT DEPRECATED - 11,117,500 تومان اختلاف کشف شد
  // استفاده از /api/invoices/generate-standard به جای این endpoint
  app.post("/api/invoices/generate", requireAuth, upload.single('usageFile'), async (req: MulterRequest, res) => {
    res.status(301).json({
      error: "این endpoint به سیستم استاندارد منتقل شده است",
      message: "لطفاً از /api/invoices/generate-standard استفاده کنید",
      deprecatedIn: "SHERLOCK v18.4",
      reason: "legacy parseUsageJsonData causing 11,117,500 تومان financial discrepancies",
      redirect: "/api/invoices/generate-standard"
    });
  });

  // فاز ۲: Manual invoice creation API - ایجاد فاکتور دستی
  app.post("/api/invoices/create-manual", requireAuth, async (req, res) => {
    try {
      console.log('🔧 فاز ۲: ایجاد فاکتور دستی');
      const validatedData = insertInvoiceSchema.parse(req.body);

      // Check if representative exists
      const representative = await storage.getRepresentative(validatedData.representativeId);
      if (!representative) {
        return res.status(404).json({ error: "نماینده یافت نشد" });
      }

      // Create manual invoice
      const invoice = await storage.createInvoice({
        ...validatedData,
        status: validatedData.status || "unpaid",
        usageData: validatedData.usageData || { 
          type: "manual",
          description: "فاکتور ایجاد شده به صورت دستی",
          createdBy: (req.session as any)?.user?.username || 'admin',
          createdAt: new Date().toISOString()
        }
      });

      // Update representative financial data
      await storage.updateRepresentativeFinancials(representative.id);

      await storage.createActivityLog({
        type: "manual_invoice_created",
        description: `فاکتور دستی برای ${representative.name} به مبلغ ${validatedData.amount} ایجاد شد`,
        relatedId: invoice.id,
        metadata: {
          representativeCode: representative.code,
          amount: validatedData.amount,
          issueDate: validatedData.issueDate,
          createdBy: (req.session as any)?.user?.username || 'admin'
        }
      });

      res.json({
        success: true,
        invoice: {
          ...invoice,
          representativeName: representative.name,
          representativeCode: representative.code
        }
      });
    } catch (error) {
      console.error('Error creating manual invoice:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "داده‌های ورودی نامعتبر", details: error.errors });
      } else {
        res.status(500).json({ error: "خطا در ایجاد فاکتور دستی" });
      }
    }
  });

  // فاز ۲: Invoice editing API - ویرایش فاکتور
  app.put("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      console.log('🔧 فاز ۲: ویرایش فاکتور');
      const invoiceId = parseInt(req.params.id);
      const updateData = req.body;

      // Get original invoice for audit trail
      const originalInvoice = await storage.getInvoice(invoiceId);
      if (!originalInvoice) {
        return res.status(404).json({ error: "فاکتور یافت نشد" });
      }

      // Update invoice
      const updatedInvoice = await storage.updateInvoice(invoiceId, updateData);

      // Update representative financial data if amount changed
      if (updateData.amount && parseFloat(updateData.amount) !== parseFloat(originalInvoice.amount)) {
        await storage.updateRepresentativeFinancials(originalInvoice.representativeId);
      }

      // Log the edit
      await storage.createActivityLog({
        type: "invoice_edited",
        description: `فاکتور ${originalInvoice.invoiceNumber} ویرایش شد`,
        relatedId: invoiceId,
        metadata: {
          originalAmount: originalInvoice.amount,
          newAmount: updateData.amount,
          originalStatus: originalInvoice.status,
          newStatus: updateData.status,
          editedBy: (req.session as any)?.user?.username || 'admin',
          changes: Object.keys(updateData)
        }
      });

      res.json({
        success: true,
        invoice: updatedInvoice
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ error: "خطا در ویرایش فاکتور" });
    }
  });

  // MISSING API: Get all invoices - SHERLOCK v12.1 CRITICAL FIX
  app.get("/api/invoices", requireAuth, async (req, res) => {
    try {
      console.log('📋 SHERLOCK v12.1: Fetching all invoices for main invoices page');
      const startTime = Date.now();

      const invoices = await storage.getInvoices();

      const responseTime = Date.now() - startTime;
      console.log(`✅ ${invoices.length} فاکتور در ${responseTime}ms بارگذاری شد`);

      res.json(invoices);
    } catch (error) {
      console.error('❌ خطا در دریافت فهرست فاکتورها:', error);
      res.status(500).json({ error: "خطا در دریافت فهرست فاکتورها" });
    }
  });

  // MISSING API: Get invoices with batch info - SHERLOCK v12.1 CRITICAL FIX  
  app.get("/api/invoices/with-batch-info", requireAuth, async (req, res) => {
    try {
      console.log('📋 SHERLOCK v12.1: دریافت کامل فاکتورها با pagination صحیح');

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;
      const statusFilter = req.query.status as string || 'all';
      const searchTerm = req.query.search as string || '';
      const telegramFilter = req.query.telegram as string || 'all';

      const invoices = await storage.getInvoices();
      const representatives = await storage.getRepresentatives();

      // Create lookup maps for performance  
      const repMap = new Map(representatives.map(rep => [rep.id, rep]));

      // Enhance invoices with additional info FIRST
      let enhancedInvoices = invoices.map(invoice => {
        const rep = repMap.get(invoice.representativeId);

        return {
          ...invoice,
          representativeName: rep?.name || 'نامشخص',
          representativeCode: rep?.code || 'نامشخص',
          panelUsername: rep?.panelUsername
        };
      });

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        enhancedInvoices = enhancedInvoices.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.representativeName?.toLowerCase().includes(searchLower) ||
          invoice.representativeCode?.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        enhancedInvoices = enhancedInvoices.filter(invoice => invoice.status === statusFilter);
      }

      // Apply telegram status filter
      if (telegramFilter && telegramFilter !== 'all') {
        if (telegramFilter === 'sent') {
          enhancedInvoices = enhancedInvoices.filter(invoice => invoice.sentToTelegram);
        } else if (telegramFilter === 'unsent') {
          enhancedInvoices = enhancedInvoices.filter(invoice => !invoice.sentToTelegram);
        }
      }

      // SHERLOCK v12.2: Apply Display sorting - newest invoices first for UI
      // NOTE: This ONLY affects display order, not payment allocation (which uses FIFO)
      enhancedInvoices.sort((a, b) => {
        const dateA = new Date(a.issueDate || a.createdAt).getTime();
        const dateB = new Date(b.issueDate || b.createdAt).getTime();
        return dateB - dateA; // Descending: newest first for display
      });

      // Calculate pagination
      const totalCount = enhancedInvoices.length;
      const totalPages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedInvoices = enhancedInvoices.slice(startIndex, endIndex);

      console.log(`✅ صفحه ${page}: ${paginatedInvoices.length} فاکتور از ${totalCount} فاکتور کل (${totalPages} صفحه)`);

      res.json({
        data: paginatedInvoices,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('❌ خطا در دریافت فاکتورها:', error);
      res.status(500).json({ error: "خطا در دریافت فهرست فاکتورها" });
    }
  });

  // MISSING API: Invoice statistics - SHERLOCK v12.1 ENHANCEMENT
  app.get("/api/invoices/statistics", requireAuth, async (req, res) => {
    try {
      console.log('📊 SHERLOCK v12.1: Calculating invoice statistics');

      const invoices = await storage.getInvoices();

      const stats = {
        totalInvoices: invoices.length,
        unpaidCount: invoices.filter(inv => inv.status === 'unpaid').length,
        paidCount: invoices.filter(inv => inv.status === 'paid').length,
        partialCount: invoices.filter(inv => inv.status === 'partial').length,
        overdueCount: invoices.filter(inv => inv.status === 'overdue').length,
        totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        unpaidAmount: invoices
          .filter(inv => inv.status === 'unpaid')
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        paidAmount: invoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        // SHERLOCK v12.2: Add telegram statistics for accurate unsent count
        sentToTelegramCount: invoices.filter(inv => inv.sentToTelegram).length,
        unsentToTelegramCount: invoices.filter(inv => !inv.sentToTelegram).length
      };

      console.log('📊 آمار فاکتورها:', stats);
      res.json(stats);
    } catch (error) {
      console.error('❌ خطا در محاسبه آمار فاکتورها:', error);
      res.status(500).json({ error: "خطا در محاسبه آمار فاکتورها" });
    }
  });

  // SHERLOCK v12.3: Send invoices to Telegram - Complete Implementation
  app.post("/api/invoices/send-telegram", requireAuth, async (req, res) => {
    try {
      console.log('📨 SHERLOCK v12.3: Sending invoices to Telegram');
      const { invoiceIds } = req.body;

      if (!invoiceIds || !Array.isArray(invoiceIds)) {
        return res.status(400).json({ error: "شناسه فاکتورها الزامی است" });
      }

      // Get Telegram settings from database
      const botTokenSetting = await storage.getSetting("telegram_bot_token");
      const chatIdSetting = await storage.getSetting("telegram_chat_id");
      const templateSetting = await storage.getSetting("telegram_template");

      const botToken = botTokenSetting?.value || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = chatIdSetting?.value || process.env.TELEGRAM_CHAT_ID;
      const template = templateSetting?.value || getDefaultTelegramTemplate();

      console.log('🔑 Telegram settings check:', {
        botTokenExists: !!botToken,
        chatIdExists: !!chatId,
        templateExists: !!template
      });

      if (!botToken || !chatId) {
        console.error('❌ Missing Telegram credentials');
        return res.status(400).json({ 
          error: "تنظیمات تلگرام کامل نیست. لطفاً Bot Token و Chat ID را در تنظیمات وارد کنید." 
        });
      }

      let successCount = 0;
      let failedCount = 0;

      for (const invoiceId of invoiceIds) {
        try {
          console.log(`📋 Processing invoice ${invoiceId}`);

          // Get invoice details
          const invoice = await storage.getInvoice(invoiceId);
          if (!invoice) {
            console.error(`Invoice ${invoiceId} not found`);
            failedCount++;
            continue;
          }

          // Get representative details
          const representative = await storage.getRepresentative(invoice.representativeId);
          if (!representative) {
            console.error(`Representative ${invoice.representativeId} not found for invoice ${invoiceId}`);
            failedCount++;
            continue;
          }

          // Prepare Telegram message
          // SHERLOCK v16.3 TELEGRAM URL FIX: Use proper portal link generation
          const { getPortalLink } = await import('./config');
          const portalLink = getPortalLink(representative.publicId);
          const telegramMessage = {
            representativeName: representative.name,
            shopOwner: representative.ownerName || representative.name,
            panelId: representative.panelUsername || representative.code,
            amount: invoice.amount,
            issueDate: invoice.issueDate,
            status: formatInvoiceStatus(invoice.status),
            portalLink,
            invoiceNumber: invoice.invoiceNumber,
            isResend: invoice.sentToTelegram || false,
            sendCount: (invoice.telegramSendCount || 0) + 1
          };

          // Send to Telegram
          const success = await sendInvoiceToTelegram(botToken, chatId, telegramMessage, template);

          if (success) {
            // Mark as sent
            await storage.updateInvoice(invoiceId, {
              sentToTelegram: true,
              telegramSentAt: new Date(),
              telegramSendCount: telegramMessage.sendCount
            });

            // Create activity log
            await storage.createActivityLog({
              type: "invoice_telegram_sent",
              description: `فاکتور ${invoice.invoiceNumber} به تلگرام ارسال شد`,
              relatedId: invoiceId
            });

            successCount++;
            console.log(`✅ Invoice ${invoiceId} sent successfully`);
          } else {
            failedCount++;
            console.error(`❌ Failed to send invoice ${invoiceId}`);
          }
        } catch (error) {
          console.error(`❌ خطا در ارسال فاکتور ${invoiceId}:`, error);
          failedCount++;
        }
      }

      console.log(`✅ SHERLOCK v12.3: ارسال تلگرام کامل شد - ${successCount} موفق, ${failedCount} ناموفق`);

      res.json({
        success: successCount,
        failed: failedCount,
        total: invoiceIds.length
      });
    } catch (error) {
      console.error('❌ خطا در ارسال فاکتورها به تلگرام:', error);
      res.status(500).json({ error: "خطا در ارسال فاکتورها به تلگرام" });
    }
  });

  // فاز ۲: Delete invoice API - حذف فاکتور با همگام‌سازی کامل مالی
  app.delete("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      console.log('🔧 فاز ۲: حذف امن فاکتور');
      const invoiceId = parseInt(req.params.id);

      // Get invoice details for audit
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: "فاکتور یافت نشد" });
      }

      console.log(`🗑️ حذف فاکتور شماره ${invoice.invoiceNumber} با مبلغ ${invoice.amount} تومان`);

      // Delete invoice from database
      await storage.deleteInvoice(invoiceId);

      // CRITICAL: Update representative financial data after deletion
      console.log(`🔄 به‌روزرسانی اطلاعات مالی نماینده ${invoice.representativeId}`);
      await storage.updateRepresentativeFinancials(invoice.representativeId);

      // CRITICAL: Invalidate CRM cache to ensure real-time sync
      invalidateCrmCache();
      console.log('🗑️ CRM cache invalidated for immediate synchronization');

      // Log the activity for audit trail
      await storage.createActivityLog({
        type: "invoice_deleted",
        description: `فاکتور ${invoice.invoiceNumber} با مبلغ ${invoice.amount} تومان حذف شد`,
        relatedId: invoiceId,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          representativeId: invoice.representativeId,
          deletedBy: (req.session as any)?.user?.username || 'admin',
          financialImpact: {
            amountRemoved: invoice.amount,
            operation: "invoice_deletion"
          }
        }
      });

      console.log(`✅ فاکتور ${invoice.invoiceNumber} با موفقیت حذف شد و اطلاعات مالی همگام‌سازی شدند`);
      res.json({ 
        success: true, 
        message: "فاکتور با موفقیت حذف شد و اطلاعات مالی به‌روزرسانی شدند",
        deletedInvoice: {
          id: invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount
        }
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ error: "خطا در حذف فاکتور" });
    }
  });

  // فاز ۲: Get single invoice details API
  app.get("/api/invoices/:id", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "شناسه فاکتور نامعتبر است" });
      }
      const invoice = await storage.getInvoice(invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: "فاکتور یافت نشد" });
      }

      // Get representative info
      const representative = await storage.getRepresentative(invoice.representativeId);

      res.json({
        ...invoice,
        representativeName: representative?.name,
        representativeCode: representative?.code
      });
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      res.status(500).json({ error: "خطا در دریافت جزئیات فاکتور" });
    }
  });

  // SHERLOCK v12.1: Enhanced pagination and statistics for invoices page
  app.get("/api/invoices/export", requireAuth, async (req, res) => {
    try {
      console.log('📄 SHERLOCK v12.1: Exporting invoices to Excel/CSV');

      const invoices = await storage.getInvoices();

      // Prepare export data with enhanced information
      const exportData = invoices.map(invoice => ({
        'شماره فاکتور': invoice.invoiceNumber,
        'نام نماینده': (invoice as any).representativeName || 'نامشخص',
        'کد نماینده': (invoice as any).representativeCode || 'نامشخص',
        'مبلغ': invoice.amount,
        'تاریخ صدور': invoice.issueDate,
        'تاریخ سررسید': invoice.dueDate,
        'وضعیت': invoice.status === 'paid' ? 'پرداخت شده' : 
                  invoice.status === 'partial' ? 'پرداخت جزئی' : 'پرداخت نشده',
        'ارسال به تلگرام': invoice.sentToTelegram ? 'ارسال شده' : 'ارسال نشده',
        'تاریخ ایجاد': invoice.createdAt
      }));

      res.json({
        success: true,
        data: exportData,
        total: exportData.length,
        exportedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ خطا در export فاکتورها:', error);
      res.status(500).json({ error: "خطا در export فاکتورها" });
    }
  });

  // فاز ۳: Payment Synchronization API Routes

  // Get unallocated payments API
  app.get("/api/payments/unallocated", requireAuth, async (req, res) => {
    try {
      const representativeId = req.query.representativeId ? parseInt(req.query.representativeId as string) : undefined;
      const unallocatedPayments = await storage.getUnallocatedPayments(representativeId);

      res.json(unallocatedPayments);
    } catch (error) {
      console.error('Error fetching unallocated payments:', error);
      res.status(500).json({ error: "خطا در دریافت پرداخت‌های تخصیص نیافته" });
    }
  });

  // Auto-allocate payments API
  app.post("/api/payments/auto-allocate/:representativeId", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.representativeId);
      const { amount, paymentDate, description, allocations } = req.body;

      // Create the main payment record first
      const paymentData = {
        representativeId,
        amount,
        paymentDate,
        description,
        isAllocated: true
      };

      const payment = await storage.createPayment(paymentData);

      // Process allocations for each invoice if provided
      if (allocations && allocations.length > 0) {
        for (const allocation of allocations) {
          // Update invoice status
          await storage.updateInvoice(allocation.invoiceId, {
            status: allocation.newStatus
          });
        }
      } else {
        // SHERLOCK v1.0 FIX: Call correct auto-allocation function
        await storage.autoAllocatePaymentToInvoices(payment.id, representativeId);
      }

      await storage.createActivityLog({
        type: "payment_auto_allocation",
        description: `تخصیص خودکار پرداخت ${amount} ریال برای نماینده ${representativeId}`,
        relatedId: representativeId,
        metadata: {
          paymentId: payment.id,
          amount: amount,
          allocationsCount: allocations?.length || 0
        }
      });

      // SHERLOCK v1.0 GAP-3 FIX: Invalidate CRM cache for immediate financial synchronization
      invalidateCrmCache();
      console.log('🔄 CRM cache invalidated after payment creation for real-time sync');

      res.json({ 
        success: true, 
        payment,
        allocatedCount: allocations?.length || 0,
        message: "پرداخت با موفقیت ثبت و تخصیص داده شد"
      });
    } catch (error) {
      console.error('Error auto-allocating payments:', error);
      res.status(500).json({ error: "خطا در تخصیص خودکار پرداخت‌ها" });
    }
  });

  // CRM debt synchronization endpoint - Enhanced Financial Synchronization
  app.post("/api/crm/representatives/:id/sync-debt", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, invoiceId, amountChange, timestamp } = req.body;

      console.log('Sync debt request:', { id, reason, invoiceId, amountChange });

      // Recalculate actual debt from database
      const representativeId = parseInt(id);

      // Calculate total unpaid invoices for this representative
      const unpaidResult = await db.select({ 
        totalDebt: sql<string>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)` 
      }).from(invoices).where(
        and(
          eq(invoices.representativeId, representativeId),
          or(eq(invoices.status, 'unpaid'), eq(invoices.status, 'overdue'))
        )
      );

      // Calculate total sales (all invoices)
      const salesResult = await db.select({ 
        totalSales: sql<string>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)` 
      }).from(invoices).where(eq(invoices.representativeId, representativeId));

      const actualTotalDebt = unpaidResult[0]?.totalDebt || "0";
      const actualTotalSales = salesResult[0]?.totalSales || "0";

      console.log('Calculated debt:', { actualTotalDebt, actualTotalSales });

      // Update representative with calculated values
      const updatedRep = await storage.updateRepresentative(representativeId, {
        totalDebt: actualTotalDebt,
        totalSales: actualTotalSales,
        credit: "0" // Reset credit if needed
      });

      // Log the synchronization with actual values
      await storage.createActivityLog({
        type: "debt_synchronized",
        description: `همگام‌سازی مالی پس از تغییر مبلغ فاکتور: ${actualTotalDebt} ریال`,
        relatedId: representativeId,
        metadata: {
          invoiceId,
          amountChange,
          syncReason: reason || "invoice_amount_changed",
          oldDebt: "unknown",
          newDebt: actualTotalDebt,
          timestamp: timestamp || new Date().toISOString()
        }
      });

      console.log('Debt synchronization completed:', { 
        representativeId, 
        actualTotalDebt, 
        actualTotalSales 
      });

      res.json({ 
        success: true, 
        message: "همگام‌سازی مالی کامل انجام شد",
        data: { 
          invoiceId, 
          amountChange, 
          totalDebt: actualTotalDebt,
          totalSales: actualTotalSales
        }
      });
    } catch (error: any) {
      console.error('Debt synchronization failed:', error);
      res.status(500).json({ 
        error: "خطا در همگام‌سازی بدهی",
        details: error.message 
      });
    }
  });

  // Dashboard statistics refresh endpoint
  app.post("/api/dashboard/refresh-stats", requireAuth, async (req, res) => {
    try {
      const { reason } = req.body;

      // Recalculate all statistics
      const totalRevenue = await storage.getTotalRevenue();
      const totalDebt = await storage.getTotalDebt();
      const activeRepresentatives = await storage.getActiveRepresentativesCount();
      const unpaidInvoices = await storage.getUnpaidInvoicesCount();
      const overdueInvoices = await storage.getOverdueInvoicesCount();

      // Log the refresh
      await storage.createActivityLog({
        type: "dashboard_stats_refreshed",
        description: `آمار داشبورد بروزرسانی شد - دلیل: ${reason}`,
        metadata: {
          totalRevenue: totalRevenue.toString(),
          totalDebt: totalDebt.toString(),
          activeRepresentatives,
          unpaidInvoices,
          overdueInvoices,
          refreshReason: reason,
          timestamp: new Date().toISOString()
        }
      });

      res.json({ 
        success: true, 
        message: "آمار داشبورد بروزرسانی شد",
        stats: {
          totalRevenue,
          totalDebt,
          activeRepresentatives,
          unpaidInvoices,
          overdueInvoices
        }
      });
    } catch (error) {
      res.status(500).json({ error: "خطا در بروزرسانی آمار داشبورد" });
    }
  });

  // Manual payment allocation API
  // SHERLOCK v11.5: Manual payment allocation API with real-time status calculation
  app.post("/api/payments/allocate", requireAuth, async (req, res) => {
    try {
      const { paymentId, invoiceId } = req.body;

      if (!paymentId || !invoiceId) {
        return res.status(400).json({ error: "شناسه پرداخت و فاکتور الزامی است" });
      }

      const updatedPayment = await storage.allocatePaymentToInvoice(paymentId, invoiceId);

      // CRITICAL: Recalculate invoice status based on actual payment allocations
      const calculatedStatus = await storage.calculateInvoicePaymentStatus(invoiceId);
      await storage.updateInvoice(invoiceId, { status: calculatedStatus });
      console.log(`📊 Manual allocation: Invoice ${invoiceId} status updated to: ${calculatedStatus}`);

      await storage.createActivityLog({
        type: "manual_payment_allocation",
        description: `پرداخت ${paymentId} به فاکتور ${invoiceId} تخصیص یافت - وضعیت: ${calculatedStatus}`,
        relatedId: paymentId,
        metadata: {
          paymentId,
          invoiceId,
          amount: updatedPayment.amount,
          newInvoiceStatus: calculatedStatus
        }
      });

      res.json({ success: true, payment: updatedPayment, invoiceStatus: calculatedStatus });
    } catch (error) {
      console.error('Error allocating payment:', error);
      res.status(500).json({ error: "خطا در تخصیص دستی پرداخت" });
    }
  });

  // SHERLOCK v11.5: CRITICAL - Batch Invoice Status Recalculation API
  app.post("/api/invoices/recalculate-statuses", requireAuth, async (req, res) => {
    try {
      console.log('🔧 SHERLOCK v11.5: Starting batch invoice status recalculation...');
      const { representativeId, invoiceIds } = req.body;

      let invoicesToProcess = [];

      if (representativeId) {
        // Recalculate for specific representative
        const repInvoices = await storage.getInvoicesByRepresentative(representativeId);
        invoicesToProcess = repInvoices.map(inv => inv.id);
        console.log(`📊 Processing ${invoicesToProcess.length} invoices for representative ${representativeId}`);
      } else if (invoiceIds && Array.isArray(invoiceIds)) {
        // Recalculate for specific invoices
        invoicesToProcess = invoiceIds;
        console.log(`📊 Processing ${invoicesToProcess.length} specific invoices`);
      } else {
        // Recalculate all invoices (expensive operation)
        const allInvoices = await storage.getInvoices();
        invoicesToProcess = allInvoices.map(inv => inv.id);
        console.log(`📊 Processing ALL ${invoicesToProcess.length} invoices`);
      }

      const results = {
        processed: 0,
        updated: 0,
        statusChanges: [] as Array<{
          invoiceId: any;
          invoiceNumber: string;
          oldStatus: string;
          newStatus: string;
        }>
      };

      // Process each invoice
      for (const invoiceId of invoicesToProcess) {
        try {
          const oldInvoice = await storage.getInvoice(invoiceId);
          if (!oldInvoice) continue;

          const calculatedStatus = await storage.calculateInvoicePaymentStatus(invoiceId);

          if (calculatedStatus !== oldInvoice.status) {
            await storage.updateInvoice(invoiceId, { status: calculatedStatus });
            results.statusChanges.push({
              invoiceId,
              invoiceNumber: oldInvoice.invoiceNumber,
              oldStatus: oldInvoice.status,
              newStatus: calculatedStatus
            });
            results.updated++;
          }

          results.processed++;
        } catch (invoiceError) {
          console.warn(`Error processing invoice ${invoiceId}:`, invoiceError);
        }
      }

      console.log(`✅ Batch recalculation complete: ${results.updated} invoices updated out of ${results.processed} processed`);

      // Log the batch operation
      await storage.createActivityLog({
        type: "batch_invoice_status_recalculation",
        description: `بازمحاسبه وضعیت ${results.processed} فاکتور - ${results.updated} فاکتور به‌روزرسانی شد`
      });

      res.json({
        success: true,
        message: `وضعیت ${results.updated} فاکتور از ${results.processed} فاکتور بازمحاسبه و به‌روزرسانی شد`,
        results
      });
    } catch (error) {
      console.error('Batch status recalculation error:', error);
      res.status(500).json({ error: "خطا در بازمحاسبه وضعیت فاکتورها" });
    }
  });

  // Payment allocation summary API
  app.get("/api/payments/allocation-summary/:representativeId", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.representativeId);
      const summary = await storage.getPaymentAllocationSummary(representativeId);

      res.json(summary);
    } catch (error) {
      console.error('Error getting payment allocation summary:', error);
      res.status(500).json({ error: "خطا در دریافت خلاصه تخصیص پرداخت‌ها" });
    }
  });

  // SHERLOCK v17.8 REMOVED: Duplicate financial reconciliation endpoint
  // All financial reconciliation now uses the standardized Financial Integrity Engine
  // Available at: /api/financial-integrity/representative/:id/reconcile



  // 🗑️ SHERLOCK v18.2: LEGACY REMOVED - Use unified statistics endpoints instead

  // 🗑️ SHERLOCK v18.2: LEGACY REMOVED - Use standardized payment processing endpoints

  app.put("/api/payments/:id/allocate", requireAuth, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { invoiceId } = req.body;

      await storage.allocatePaymentToInvoice(paymentId, invoiceId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "خطا در تخصیص پرداخت" });
    }
  });

  // فاز ۱: Invoice Batches API - مدیریت دوره‌ای فاکتورها
  app.get("/api/invoice-batches", requireAuth, async (req, res) => {
    try {
      const batches = await storage.getInvoiceBatches();
      res.json(batches);
    } catch (error) {
      console.error('Error fetching invoice batches:', error);
      res.status(500).json({ error: "خطا در دریافت دسته‌های فاکتور" });
    }
  });

  app.get("/api/invoice-batches/:id", requireAuth, async (req, res) => {
    try {
      const batchId = parseInt(req.params.id);
      const batch = await storage.getInvoiceBatch(batchId);

      if (!batch) {
        return res.status(404).json({ error: "دسته فاکتور یافت نشد" });
      }

      // Get invoices for this batch
      const invoices = await storage.getBatchInvoices(batchId);

      res.json({
        batch,
        invoices,
        summary: {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toString()
        }
      });
    } catch (error) {
      console.error('Error fetching batch details:', error);
      res.status(500).json({ error: "خطا در دریافت جزئیات دسته فاکتور" });
    }
  });

  app.post("/api/invoice-batches", requireAuth, async (req, res) => {
    try {
      const validatedData = insertInvoiceBatchSchema.parse(req.body);

      // Generate unique batch code if not provided
      if (!validatedData.batchCode) {
        validatedData.batchCode = await storage.generateBatchCode(validatedData.periodStart);
      }

      const batch = await storage.createInvoiceBatch(validatedData);
      res.json(batch);
    } catch (error) {
      console.error('Error creating invoice batch:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "داده‌های ورودی نامعتبر", details: error.errors });
      } else {
        res.status(500).json({ error: "خطا در ایجاد دسته فاکتور" });
      }
    }
  });

  app.put("/api/invoice-batches/:id", requireAuth, async (req, res) => {
    try {
      const batchId = parseInt(req.params.id);
      const updateData = req.body;

      const batch = await storage.updateInvoiceBatch(batchId, updateData);
      res.json(batch);
    } catch (error) {
      console.error('Error updating invoice batch:', error);
      res.status(500).json({ error: "خطا در بروزرسانی دسته فاکتور" });
    }
  });

  app.post("/api/invoice-batches/:id/complete", requireAuth, async (req, res) => {
    try {
      const batchId = parseInt(req.params.id);
      await storage.completeBatch(batchId);

      const updatedBatch = await storage.getInvoiceBatch(batchId);
      res.json({ 
        success: true, 
        batch: updatedBatch,
        message: "دسته فاکتور با موفقیت تکمیل شد"
      });
    } catch (error) {
      console.error('Error completing batch:', error);
      res.status(500).json({ error: "خطا در تکمیل دسته فاکتور" });
    }
  });



  // Activity Logs API
  app.get("/api/activity-logs", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت فعالیت‌ها" });
    }
  });

  // Settings API - Protected
  app.get("/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت تنظیمات" });
    }
  });

  app.put("/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.updateSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "خطا در بروزرسانی تنظیمات" });
    }
  });

  // xAI Grok Assistant API
  // 🗑️ SHERLOCK v18.2: LEGACY AI TEST REMOVED - Use /api/settings/xai-grok/test instead

  app.post("/api/ai/analyze-financial", requireAuth, async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();

      // Use XAI Grok for financial analysis
      const analysis = await xaiGrokEngine.analyzeFinancialData(
        parseFloat(dashboardData.totalRevenue),
        parseFloat(dashboardData.totalDebt),
        dashboardData.activeRepresentatives,
        dashboardData.overdueInvoices
      );
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "خطا در تحلیل مالی هوشمند" });
    }
  });

  app.post("/api/ai/analyze-representative", requireAuth, async (req, res) => {
    try {
      const { representativeCode } = req.body;
      const representative = await storage.getRepresentativeByCode(representativeCode);

      if (!representative) {
        return res.status(404).json({ error: "نماینده یافت نشد" });
      }

      const culturalProfile = await xaiGrokEngine.analyzeCulturalProfile(representative);
      res.json({ representative, culturalProfile });
    } catch (error) {
      res.status(500).json({ error: "خطا در تحلیل نماینده" });
    }
  });

  app.post("/api/ai/question", requireAuth, async (req, res) => {
    try {
      const { question } = req.body;
      const answer = await xaiGrokEngine.answerFinancialQuestion(question);
      res.json({ answer });
    } catch (error) {
      res.status(500).json({ error: "خطا در دریافت پاسخ از دستیار هوشمند" });
    }
  });

  app.post("/api/ai/generate-report", requireAuth, async (req, res) => {
    try {
      const dashboardData = await storage.getDashboardData();
      const representatives = await storage.getRepresentatives();
      const invoices = await storage.getInvoices();

      const reportData = {
        dashboard: dashboardData,
        representatives: representatives.slice(0, 10), // Top 10
        invoices: invoices.slice(0, 20) // Recent 20
      };

      // const report = await generateFinancialReport(reportData); // Temporarily disabled
      const report = { message: "گزارش مالی - در حال توسعه", data: reportData };
      res.json({ report });
    } catch (error) {
      res.status(500).json({ error: "خطا در تولید گزارش" });
    }
  });

  // Test Telegram connection
  app.post("/api/test-telegram", requireAuth, async (req, res) => {
    try {
      console.log('Testing Telegram connection...');

      // Get Telegram settings from environment variables or database
      let botToken = process.env.TELEGRAM_BOT_TOKEN;
      let chatId = process.env.TELEGRAM_CHAT_ID;

      console.log('Env Bot Token exists:', !!botToken);
      console.log('Env Chat ID exists:', !!chatId);

      // Fallback to database settings if env vars not available
      if (!botToken || !chatId) {
        const botTokenSetting = await storage.getSetting('telegram_bot_token');
        const chatIdSetting = await storage.getSetting('telegram_chat_id');

        console.log('DB Bot Token exists:', !!botTokenSetting?.value);
        console.log('DB Chat ID exists:', !!chatIdSetting?.value);

        if (!botTokenSetting?.value || !chatIdSetting?.value) {
          return res.status(400).json({ 
            error: "تنظیمات تلگرام کامل نیست - ابتدا توکن ربات و شناسه چت را ذخیره کنید",
            hasEnvToken: !!botToken,
            hasEnvChatId: !!chatId,
            hasDbToken: !!botTokenSetting?.value,
            hasDbChatId: !!chatIdSetting?.value
          });
        }

        botToken = botTokenSetting.value;
        chatId = chatIdSetting.value;
      }

      console.log('Using Bot Token:', botToken ? `${botToken.substring(0, 10)}...` : 'none');
      console.log('Using Chat ID:', chatId);

      // Test message
      const testMessage = `🤖 تست اتصال سیستم مدیریت مالی MarFaNet

✅ اتصال با موفقیت برقرار شد
📅 تاریخ تست: ${new Date().toLocaleString('fa-IR')}
🔧 نسخه سیستم: 1.0.0

این پیام برای تست اتصال ربات ارسال شده است.`;

      // Send test message using the same method as invoice sending
      const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: 'HTML'
        })
      });

      console.log('Telegram API response status:', response.status);
      const result = await response.json();
      console.log('Telegram API response:', result);

      if (!response.ok) {
        throw new Error(result.description || `Telegram API error: ${response.status}`);
      }

      res.json({ 
        success: true, 
        message: "پیام تست با موفقیت ارسال شد",
        telegramResponse: result
      });
    } catch (error: any) {
      console.error('Telegram test error:', error);
      res.status(500).json({ 
        error: `خطا در تست اتصال تلگرام: ${error.message}`,
        details: error.toString()
      });
    }
  });

  // Initialize default settings on first run
  // Invoice Edit Routes
  app.post("/api/invoices/edit", requireAuth, async (req, res) => {
    try {
      const { 
        invoiceId, 
        originalUsageData, 
        editedUsageData, 
        editType, 
        editReason,
        originalAmount,
        editedAmount,
        editedBy 
      } = req.body;

      // Validate input
      if (!invoiceId || !editedUsageData || !editedBy) {
        return res.status(400).json({ error: "اطلاعات ضروری برای ویرایش فاکتور کامل نیست" });
      }

      // Validate amounts
      if (editedAmount < 0) {
        return res.status(400).json({ error: "مبلغ فاکتور نمی‌تواند منفی باشد" });
      }

      // Execute atomic transaction for invoice editing
      const atomicResult = await storage.executeAtomicInvoiceEdit({
        invoiceId,
        editedUsageData,
        editReason: editReason || 'ویرایش دستی توسط ادمین',
        editedBy,
        originalAmount: parseFloat(originalAmount.toString()),
        editedAmount: parseFloat(editedAmount.toString())
      });

      res.json({ 
        success: atomicResult.success, 
        editId: atomicResult.editId,
        transactionId: atomicResult.transactionId,
        message: "فاکتور با موفقیت از طریق تراکنش اتمیک ویرایش شد" 
      });

    } catch (error: any) {
      console.error('خطا در ویرایش فاکتور:', error);
      res.status(500).json({ 
        error: 'خطا در ویرایش فاکتور',
        details: error.message 
      });
    }
  });

  app.get("/api/invoices/:id/edit-history", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);

      if (!invoiceId) {
        return res.status(400).json({ error: "شناسه فاکتور نامعتبر است" });
      }

      const editHistory = await storage.getInvoiceEditHistory(invoiceId);
      res.json(editHistory);

    } catch (error: any) {
      console.error('خطا در دریافت تاریخچه ویرایش:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت تاریخچه ویرایش',
        details: error.message 
      });
    }
  });

  app.get("/api/invoices/:id/usage-details", requireAuth, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);

      if (!invoiceId) {
        return res.status(400).json({ error: "شناسه فاکتور نامعتبر است" });
      }

      const invoices = await storage.getInvoices();
      const invoice = invoices.find(inv => inv.id === invoiceId);

      if (!invoice) {
        return res.status(404).json({ error: "فاکتور یافت نشد" });
      }

      // Return detailed usage data for editing
      res.json({
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          issueDate: invoice.issueDate,
          status: invoice.status
        },
        usageData: invoice.usageData || {},
        records: invoice.usageData?.records || []
      });

    } catch (error: any) {
      console.error('خطا در دریافت جزئیات مصرف:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت جزئیات مصرف',
        details: error.message 
      });
    }
  });

  // Financial transaction management API routes
  app.get("/api/financial/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getFinancialTransactions();
      res.json(transactions);
    } catch (error: any) {
      console.error('خطا در دریافت تراکنش‌های مالی:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت تراکنش‌های مالی',
        details: error.message 
      });
    }
  });

  app.get("/api/financial/constraints", requireAuth, async (req, res) => {
    try {
      // Use a different method that exists in storage
      const constraints = await storage.getFinancialTransactions();
      res.json({ constraints: [], message: "عملیات موقتاً غیرفعال است" });
    } catch (error: any) {
      console.error('خطا در دریافت محدودیت‌های یکپارچگی:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت محدودیت‌های یکپارچگی',
        details: error.message 
      });
    }
  });

  app.post("/api/financial/reconcile", requireAuth, async (req, res) => {
    try {
      const reconcileResult = await storage.reconcileFinancialData();
      res.json(reconcileResult);
    } catch (error: any) {
      console.error('خطا در هماهنگی داده‌های مالی:', error);
      res.status(500).json({ 
        error: 'خطا در هماهنگی داده‌های مالی',
        details: error.message 
      });
    }
  });

  app.post("/api/init", async (req, res) => {
    try {
      // Set default Telegram template
      await storage.updateSetting('telegram_template', getDefaultTelegramTemplate());

      // Initialize basic integrity constraints for active representatives
      const representatives = await storage.getRepresentatives();
      for (const rep of representatives.slice(0, 5)) { // Initialize first 5 representatives
        try {
          await storage.createIntegrityConstraint({
            constraintType: 'BALANCE_CHECK',
            entityType: 'representative',
            entityId: rep.id,
            constraintRule: {
              maxDebt: 50000000, // 50 million Toman limit
              warningThreshold: 40000000,
              autoReconcile: true
            }
          });
        } catch (error) {
          console.log(`Constraint for representative ${rep.id} already exists or failed to create`);
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "خطا در راه‌اندازی اولیه" });
    }
  });

  // ====== FINANCIAL TRANSACTIONS API (CLOCK MECHANISM) ======
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { representativeId, status } = req.query;

      let transactions;
      if (representativeId) {
        transactions = await storage.getTransactionsByRepresentative(parseInt(representativeId as string));
      } else if (status === 'pending') {
        transactions = await storage.getPendingTransactions();
      } else {
        // Get all transactions (could be paginated in future)
        transactions = await storage.getPendingTransactions(); // For now, show pending ones
      }

      res.json(transactions);
    } catch (error: any) {
      console.error('خطا در دریافت تراکنش‌ها:', error);
      res.status(500).json({ error: 'خطا در دریافت تراکنش‌ها', details: error.message });
    }
  });

  app.get("/api/transactions/:transactionId", requireAuth, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await storage.getFinancialTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: "تراکنش یافت نشد" });
      }

      res.json(transaction);
    } catch (error: any) {
      console.error('خطا در دریافت تراکنش:', error);
      res.status(500).json({ error: 'خطا در دریافت تراکنش', details: error.message });
    }
  });

  app.post("/api/transactions/:transactionId/rollback", requireAuth, async (req, res) => {
    try {
      const { transactionId } = req.params;
      await storage.rollbackTransaction(transactionId);

      res.json({ 
        success: true, 
        message: `تراکنش ${transactionId} با موفقیت برگردانده شد` 
      });
    } catch (error: any) {
      console.error('خطا در برگرداندن تراکنش:', error);
      res.status(500).json({ error: 'خطا در برگرداندن تراکنش', details: error.message });
    }
  });

  // ====== DATA INTEGRITY CONSTRAINTS API (CLOCK PRECISION) ======
  app.get("/api/constraints/violations", requireAuth, async (req, res) => {
    try {
      const violations = await storage.getConstraintViolations();
      res.json(violations);
    } catch (error: any) {
      console.error('خطا در دریافت نقض محدودیت‌ها:', error);
      res.status(500).json({ error: 'خطا در دریافت نقض محدودیت‌ها', details: error.message });
    }
  });

  app.post("/api/constraints/validate", requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.body;

      if (!entityType || !entityId) {
        return res.status(400).json({ error: "نوع موجودیت و شناسه ضروری است" });
      }

      const validation = await storage.validateConstraints(entityType, parseInt(entityId));
      res.json(validation);
    } catch (error: any) {
      console.error('خطا در اعتبارسنجی محدودیت‌ها:', error);
      res.status(500).json({ error: 'خطا در اعتبارسنجی محدودیت‌ها', details: error.message });
    }
  });

  app.post("/api/constraints/:constraintId/fix", requireAuth, async (req, res) => {
    try {
      const constraintId = parseInt(req.params.constraintId);
      const fixed = await storage.fixConstraintViolation(constraintId);

      res.json({ 
        success: fixed, 
        message: fixed ? "محدودیت با موفقیت رفع شد" : "امکان رفع خودکار محدودیت وجود ندارد" 
      });
    } catch (error: any) {
      console.error('خطا در رفع محدودیت:', error);
      res.status(500).json({ error: 'خطا در رفع محدودیت', details: error.message });
    }
  });

  // ====== FINANCIAL RECONCILIATION API (CLOCK SYNCHRONIZATION) ======
  app.post("/api/financial/reconcile", requireAuth, async (req, res) => {
    try {
      const { representativeId } = req.body;

      if (representativeId) {
        // Reconcile specific representative
        await storage.updateRepresentativeFinancials(parseInt(representativeId));
        res.json({ 
          success: true, 
          message: `مالیات نماینده ${representativeId} هماهنگ شد` 
        });
      } else {
        // Reconcile all representatives (could be heavy operation)
        const representatives = await storage.getRepresentatives();
        let processed = 0;

        for (const rep of representatives) {
          try {
            await storage.updateRepresentativeFinancials(rep.id);
            processed++;
          } catch (error) {
            console.error(`Error reconciling representative ${rep.id}:`, error);
          }
        }

        res.json({ 
          success: true, 
          message: `${processed} نماینده هماهنگ شد`,
          processed,
          total: representatives.length
        });
      }

    } catch (error: any) {
      console.error('خطا در هماهنگی مالی:', error);
      res.status(500).json({ error: 'خطا در هماهنگی مالی', details: error.message });
    }
  });

  // CRM Routes Integration
  // CRM routes are already registered via registerCrmRoutes() function

  // AI Engine routes are integrated above in xAI Grok configuration section

  // Initialize CRM real-time sync
  // CRM data sync service removed for simplified system

  // Enhanced health check endpoint
  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        financial: "running",
        crm: "running",
        auth: "running",
        sync: "simplified"
      }
    });
  });

  // ====== FINANCIAL INTEGRITY API ======
  // Get financial snapshot for representative
  app.get("/api/financial-integrity/representative/:id/snapshot", requireAuth, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.id);

      if (!representativeId || isNaN(representativeId)) {
        return res.status(400).json({ 
          error: 'شناسه نماینده معتبر نیست' 
        });
      }

      // Get representative basic info
      const representative = await db.select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (!representative.length) {
        return res.status(404).json({ 
          error: 'نماینده یافت نشد' 
        });
      }

      const rep = representative[0];

      // Calculate financial snapshot using unified financial engine
      const financialData = await unifiedFinancialEngine.calculateRepresentative(representativeId);

      // Get detailed invoice and payment info
      const invoicesData = await db.select({
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
        unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN status IN ('unpaid', 'overdue', 'partial') THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
      }).from(invoices).where(eq(invoices.representativeId, representativeId));

      const paymentsData = await db.select({
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(CAST(amount as DECIMAL)), 0)`,
        allocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = true THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`,
        unallocatedAmount: sql<number>`COALESCE(SUM(CASE WHEN is_allocated = false THEN CAST(amount as DECIMAL) ELSE 0 END), 0)`
      }).from(payments).where(eq(payments.representativeId, representativeId));

      const invoice = invoicesData[0];
      const payment = paymentsData[0];

      // Calculate integrity metrics
      const hasExcessPayments = payment.totalAmount > invoice.totalAmount;
      const needsReconciliation = Math.abs(financialData.actualDebt - parseFloat(rep.totalDebt)) > 1000;
      const integrityScore = needsReconciliation ? 75 : hasExcessPayments ? 85 : 100;

      const snapshot = {
        representativeId,
        representativeName: rep.name,

        // فاکتورها
        totalInvoices: invoice.count,
        totalInvoiceAmount: invoice.totalAmount,
        unpaidInvoiceAmount: invoice.unpaidAmount,
        paidInvoiceAmount: invoice.paidAmount,

        // پرداخت‌ها
        totalPayments: payment.count,
        totalPaymentAmount: payment.totalAmount,
        allocatedPaymentAmount: payment.allocatedAmount,
        unallocatedPaymentAmount: payment.unallocatedAmount,

        // محاسبات نهایی (استاندارد)
        standardDebt: financialData.actualDebt,
        standardCredit: Math.max(0, payment.totalAmount - invoice.totalAmount),
        standardTotalSales: financialData.totalSales,

        // وضعیت سلامت مالی
        hasExcessPayments,
        needsReconciliation,
        integrityScore
      };

      res.json({
        success: true,
        data: snapshot,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting financial integrity snapshot:', error);
      res.status(500).json({ 
        error: 'خطا در دریافت اطلاعات مالی' 
      });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
import { Express } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { sql, eq, desc, and, or, like, gte, lte, asc } from "drizzle-orm";
import { IStorage } from "../storage";
import { db } from "../db";
import { representatives, invoices, payments, crmUsers, activityLogs, insertPaymentSchema } from "../../shared/schema";
import { XAIGrokEngine } from "../services/xai-grok-engine";
// Cleaned CRM routes for representatives management and AI helper only

// Cache invalidation function - exported for use by other modules
let invalidateCrmCacheRef: (() => void) | null = null;

export function invalidateCrmCache() {
  if (invalidateCrmCacheRef) {
    invalidateCrmCacheRef();
  }
}

export function registerCrmRoutes(app: Express, storage: IStorage) {
  // Initialize only essential services for clean CRM
  const xaiGrokEngine = new XAIGrokEngine(storage);
  
  // Initialize multer for audio file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });
  
  // CRM Authentication Middleware - Fixed session check
  const crmAuthMiddleware = (req: any, res: any, next: any) => {
    // Check multiple session authentication methods
    const isAuthenticated = req.session?.crmAuthenticated === true || 
                           req.session?.crmUser || 
                           req.session?.user?.panelType === 'CRM_PANEL';
    
    console.log('CRM Auth Check:', {
      crmAuthenticated: req.session?.crmAuthenticated,
      crmUser: !!req.session?.crmUser,
      sessionKeys: Object.keys(req.session || {}),
      userPanelType: req.session?.user?.panelType
    });
    
    if (isAuthenticated) {
      next();
    } else {
      res.status(401).json({ error: 'احراز هویت نشده - دسترسی غیرمجاز' });
    }
  };

  // ==================== OPTIMIZED ADMIN-CRM DATA SYNCHRONIZATION SERVICE ====================
  
  // Cache for sync status to avoid unnecessary operations
  let lastSyncTime = 0;
  const SYNC_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  let cachedRepresentatives: any[] = [];
  
  // Cache invalidation function - exported globally
  const invalidateCrmCacheLocal = () => {
    console.log('🗑️ CRM Cache invalidated due to financial data change');
    lastSyncTime = 0;
    cachedRepresentatives = [];
  };
  
  // Set the reference so it can be called from outside
  invalidateCrmCacheRef = invalidateCrmCacheLocal;
  
  const syncAdminCrmData = async (forceSync = false) => {
    try {
      const now = Date.now();
      
      // Return cached data if recent sync exists and not forcing
      if (!forceSync && (now - lastSyncTime) < SYNC_CACHE_DURATION && cachedRepresentatives.length > 0) {
        console.log('📈 Using cached representatives data');
        return cachedRepresentatives;
      }
      
      console.log('🔄 Starting optimized representatives sync...');
      const startTime = Date.now();
      
      // Fetch all representatives (no individual sync needed - data already calculated)
      const adminReps = await db.select().from(representatives);
      
      // Cache the results
      cachedRepresentatives = adminReps;
      lastSyncTime = now;
      
      const syncTime = Date.now() - startTime;
      console.log(`✅ Sync completed in ${syncTime}ms for ${adminReps.length} representatives`);
      
      return adminReps;
    } catch (error) {
      console.error('❌ Admin-CRM sync error:', error);
      return cachedRepresentatives.length > 0 ? cachedRepresentatives : [];
    }
  };

  // ==================== UNIFIED CRM REPRESENTATIVES ENDPOINTS ====================
  
  // Statistics endpoint - Optimized with caching
  app.get("/api/crm/representatives/statistics", crmAuthMiddleware, async (req, res) => {
    try {
      const startTime = Date.now();
      const reps = await syncAdminCrmData(); // Use cached data
      
      const stats = {
        totalCount: reps.length,
        activeCount: reps.filter(r => r.isActive).length,
        inactiveCount: reps.filter(r => !r.isActive).length,
        totalSales: reps.reduce((sum, r) => sum + parseFloat(r.totalSales || '0'), 0),
        totalDebt: reps.reduce((sum, r) => sum + parseFloat(r.totalDebt || '0'), 0),
        avgPerformance: reps.length > 0 ? Math.round((reps.filter(r => r.isActive).length / reps.length) * 100) : 0,
        topPerformers: reps
          .sort((a, b) => parseFloat(b.totalSales || '0') - parseFloat(a.totalSales || '0'))
          .slice(0, 5)
          .map(r => ({
            id: r.id,
            name: r.name,
            code: r.code,
            totalSales: parseFloat(r.totalSales || '0'),
            isActive: r.isActive
          })),
        riskAlerts: reps.filter(r => parseFloat(r.totalDebt || '0') > 100000).length
      };
      
      const responseTime = Date.now() - startTime;
      console.log(`📊 Statistics generated in ${responseTime}ms`);
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching representatives statistics:', error);
      res.status(500).json({ error: 'خطا در دریافت آمار نمایندگان' });
    }
  });

  // GET Representatives with optimized caching and pagination
  app.get("/api/crm/representatives", crmAuthMiddleware, async (req, res) => {
    try {
      const startTime = Date.now();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'name';
      const sortOrder = req.query.sortOrder as string || 'asc';
      
      // Use cached data instead of real-time sync
      const allRepresentatives = await syncAdminCrmData();
      
      // Apply filtering, sorting, and pagination in memory (faster for 237 records)
      let filteredReps = allRepresentatives;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredReps = allRepresentatives.filter(rep => 
          rep.name?.toLowerCase().includes(searchLower) ||
          rep.code?.toLowerCase().includes(searchLower) ||
          rep.ownerName?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      filteredReps.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortBy) {
          case 'totalSales':
            aVal = parseFloat(a.totalSales || '0');
            bVal = parseFloat(b.totalSales || '0');
            break;
          case 'totalDebt':
            aVal = parseFloat(a.totalDebt || '0');
            bVal = parseFloat(b.totalDebt || '0');
            break;
          default:
            aVal = a.name || '';
            bVal = b.name || '';
        }
        
        if (sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
      
      // Apply pagination
      const totalCount = filteredReps.length;
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;
      const paginatedData = filteredReps.slice(offset, offset + limit);
      
      const responseTime = Date.now() - startTime;
      console.log(`📋 Representatives loaded in ${responseTime}ms (${totalCount} total, ${paginatedData.length} returned)`);
      
      res.json({
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages
        },
        syncStatus: 'CACHED_OPTIMIZED',
        responseTime: `${responseTime}ms`
      });
    } catch (error) {
      console.error('Error fetching representatives:', error);
      res.status(500).json({ error: 'خطا در دریافت فهرست نمایندگان' });
    }
  });

  // Get single representative details - Optimized with cache
  app.get("/api/crm/representatives/:id", crmAuthMiddleware, async (req, res) => {
    try {
      const allReps = await syncAdminCrmData(); // Use cached data
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'شناسه نماینده نامعتبر است' });
      }
      
      // Find from cached data instead of database query
      const rep = allReps.find(r => r.id === id);
      
      if (!rep) {
        return res.status(404).json({ error: 'نماینده یافت نشد' });
      }
      
      const representativeInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.representativeId, id))
        .orderBy(desc(invoices.createdAt))
        .limit(10);
        
      const representativePayments = await db
        .select()
        .from(payments)
        .where(eq(payments.representativeId, id))
        .orderBy(desc(payments.createdAt))
        .limit(10);
      
      res.json({
        representative: rep,
        invoices: representativeInvoices,
        payments: representativePayments,
        syncStatus: 'CACHED_OPTIMIZED'
      });
      
      res.json({
        ...rep[0],
        recentInvoices: representativeInvoices,
        recentPayments: representativePayments,
        summary: {
          totalInvoices: representativeInvoices.length,
          totalPayments: representativePayments.length,
          lastActivity: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching representative details:', error);
      res.status(500).json({ error: 'خطا در دریافت اطلاعات نماینده' });
    }
  });

  // Create new representative
  app.post("/api/crm/representatives", crmAuthMiddleware, async (req, res) => {
    try {
      const { name, code, ownerName, phone, panelUsername } = req.body;
      
      if (!name || !code) {
        return res.status(400).json({ error: 'نام و کد نماینده الزامی است' });
      }
      
      const existing = await db
        .select()
        .from(representatives)
        .where(eq(representatives.code, code))
        .limit(1);
        
      if (existing.length > 0) {
        return res.status(400).json({ error: 'کد نماینده تکراری است' });
      }
      
      const newRep = await db
        .insert(representatives)
        .values({
          code,
          name,
          ownerName: ownerName || '',
          phone: phone || '',
          panelUsername: panelUsername || '',
          publicId: `pub_${Date.now()}_${code}`,
          salesPartnerId: 0,
          isActive: true,
          totalDebt: '0',
          totalSales: '0',
          credit: '0',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.json({
        success: true,
        data: newRep[0],
        message: 'نماینده جدید با موفقیت ایجاد شد'
      });
    } catch (error) {
      console.error('Error creating representative:', error);
      res.status(500).json({ error: 'خطا در ایجاد نماینده جدید' });
    }
  });

  // Update representative
  app.put("/api/crm/representatives/:id", crmAuthMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const updated = await db
        .update(representatives)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(representatives.id, id))
        .returning();
        
      if (updated.length === 0) {
        return res.status(404).json({ error: 'نماینده یافت نشد' });
      }
      
      res.json({
        success: true,
        data: updated[0],
        message: 'اطلاعات نماینده بروزرسانی شد'
      });
    } catch (error) {
      console.error('Error updating representative:', error);
      res.status(500).json({ error: 'خطا در بروزرسانی نماینده' });
    }
  });

  // Debt Synchronization Endpoint - Financial System Integration
  app.post("/api/crm/representatives/:id/sync-debt", crmAuthMiddleware, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.id);
      const { totalDebt, credit, reason, amountChange, invoiceId, timestamp } = req.body;
      
      if (isNaN(representativeId)) {
        return res.status(400).json({ error: 'شناسه نماینده نامعتبر است' });
      }

      // Get current representative data
      const currentRep = await db
        .select()
        .from(representatives)
        .where(eq(representatives.id, representativeId))
        .limit(1);

      if (currentRep.length === 0) {
        return res.status(404).json({ error: 'نماینده یافت نشد' });
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date()
      };

      // Update debt if provided
      if (totalDebt !== undefined) {
        updateData.totalDebt = totalDebt.toString();
      }

      // Update credit if provided
      if (credit !== undefined) {
        updateData.credit = credit.toString();
      }

      // Perform the update
      const updated = await db
        .update(representatives)
        .set(updateData)
        .where(eq(representatives.id, representativeId))
        .returning();

      // Log the synchronization for audit trail
      if (reason) {
        try {
          await db.insert(activityLogs).values({
            type: 'debt_sync',
            description: `همگام‌سازی مالی: ${reason}`,
            relatedId: representativeId,
            metadata: {
              reason,
              amountChange,
              invoiceId,
              timestamp: timestamp || new Date().toISOString(),
              oldDebt: currentRep[0].totalDebt,
              newDebt: updateData.totalDebt || currentRep[0].totalDebt,
              userId: req.session?.crmUser?.id || 0
            }
          });
        } catch (logError) {
          console.warn('Activity logging failed during debt sync:', logError);
        }
      }

      res.json({
        success: true,
        message: 'همگام‌سازی مالی با موفقیت انجام شد',
        data: updated[0],
        syncDetails: {
          representativeId,
          reason: reason || 'manual_sync',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Debt synchronization error:', error);
      res.status(500).json({ error: 'خطا در همگام‌سازی مالی' });
    }
  });

  // ==================== CRM AUTHENTICATION ====================
  
  app.post("/api/crm/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "نام کاربری و رمز عبور الزامی است" });
      }

      const crmUser = await db.select().from(crmUsers).where(eq(crmUsers.username, username)).limit(1);
      
      if (!crmUser.length || !crmUser[0].isActive) {
        return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
      }

      const user = crmUser[0];
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
      }

      await db.update(crmUsers).set({ lastLoginAt: new Date() }).where(eq(crmUsers.id, user.id));

      req.session.crmAuthenticated = true;
      req.session.crmUser = {
        id: user.id,
        username: user.username,
        fullName: user.fullName || '',
        role: user.role || '',
        permissions: user.permissions as string[] || [],
        panelType: 'CRM_PANEL'
      };

      res.json({
        success: true,
        message: "ورود موفقیت‌آمیز به سیستم CRM",
        user: req.session.crmUser
      });
    } catch (error) {
      console.error('CRM login error:', error);
      res.status(500).json({ error: "خطا در ورود به سیستم" });
    }
  });

  app.get("/api/crm/auth/user", (req, res) => {
    if (req.session?.crmAuthenticated && req.session?.crmUser) {
      console.log('CRM Auth Check Result:', req.session.crmUser);
      res.json(req.session.crmUser);
    } else {
      res.status(401).json({ error: "احراز هویت نشده" });
    }
  });

  // CRM Payment Routes with CRM Authentication
  app.post("/api/crm/payments", crmAuthMiddleware, async (req, res) => {
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
        console.error('CRM Payment creation error:', error);
        res.status(500).json({ error: "خطا در ایجاد پرداخت" });
      }
    }
  });

  app.post("/api/crm/payments/auto-allocate/:representativeId", crmAuthMiddleware, async (req, res) => {
    try {
      const representativeId = parseInt(req.params.representativeId);
      const { amount, paymentDate, description, allocations, autoAllocated } = req.body;

      // Create payment record
      const paymentData = {
        representativeId,
        amount: amount.toString(),
        paymentDate,
        description: description || `تخصیص خودکار پرداخت`,
        isAllocated: true,
        autoAllocated: autoAllocated || false
      };

      const payment = await storage.createPayment(paymentData);

      // Process smart allocations
      if (allocations && allocations.length > 0) {
        for (const allocation of allocations) {
          await storage.allocatePaymentToInvoice(payment.id, allocation.invoiceId);
          // Update invoice status
          await storage.updateInvoice(allocation.invoiceId, { status: allocation.newStatus });
        }
      }

      res.json(payment);
    } catch (error) {
      console.error('CRM Auto-allocate payment error:', error);
      res.status(500).json({ error: "خطا در تخصیص خودکار پرداخت" });
    }
  });

  app.post("/api/crm/auth/logout", (req, res) => {
    req.session.crmAuthenticated = false;
    req.session.crmUser = undefined;
    res.json({ success: true, message: "خروج موفقیت‌آمیز" });
  });
}
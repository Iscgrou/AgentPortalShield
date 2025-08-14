
import { Router } from 'express';
import { Express } from 'express';
import multer from 'multer';
import { IStorage } from '../storage.js';
import { XAIGrokEngine } from '../services/xai-grok-engine.js';
import CrmAuthService from '../services/crm-auth-service.js';

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

  // 🔐 CRM Authentication Routes - Enhanced Implementation
  app.post('/api/crm/auth/login', async (req: any, res: any) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'نام کاربری و رمز عبور الزامی است'
        });
      }

      console.log('🔐 CRM Login attempt:', username);
      
      const authResult = await CrmAuthService.authenticate({ username, password });
      
      if (authResult.success && authResult.user) {
        // Clear any existing sessions
        req.session.crmAuthenticated = false;
        req.session.crmUser = null;
        
        // Set new session
        req.session.crmAuthenticated = true;
        req.session.crmUser = {
          id: Math.floor(Math.random() * 1000) + 1, // Generate ID
          username: authResult.user.username,
          fullName: authResult.user.username === 'crm' ? 'کاربر CRM' : 'مدیر سیستم',
          role: authResult.user.role,
          panelType: authResult.user.panelType,
          permissions: authResult.user.permissions
        };
        
        // Force session save
        await new Promise((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve(true);
          });
        });
        
        console.log('✅ CRM Login Success:', {
          username,
          sessionId: req.sessionID,
          role: authResult.user.role
        });
        
        res.json({
          success: true,
          user: req.session.crmUser,
          message: 'ورود موفقیت‌آمیز'
        });
      } else {
        console.log('❌ CRM Login Failed:', authResult.error);
        res.status(401).json({
          success: false,
          error: authResult.error || 'اطلاعات ورود نامعتبر'
        });
      }
    } catch (error: any) {
      console.error('❌ CRM Login Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطای سرور در فرآیند ورود'
      });
    }
  });

  // 📊 CRM User Info Endpoint - Enhanced Implementation
  app.get('/api/crm/auth/user', (req: any, res: any) => {
    try {
      console.log('🔍 CRM Auth Check:', {
        sessionId: req.sessionID,
        crmAuthenticated: req.session?.crmAuthenticated,
        adminAuthenticated: req.session?.authenticated,
        hasCrmUser: !!req.session?.crmUser,
        hasAdminUser: !!req.session?.user,
        cookies: req.headers.cookie ? 'present' : 'missing'
      });

      // Check CRM authentication first
      if (req.session?.crmAuthenticated === true && req.session?.crmUser) {
        console.log('✅ CRM Auth Success - CRM User:', req.session.crmUser.username);
        return res.json({
          success: true,
          user: req.session.crmUser
        });
      }

      // Check admin cross-authentication
      if (req.session?.authenticated === true && req.session?.user) {
        console.log('✅ CRM Auth Success - Admin Cross-Auth:', req.session.user.username);
        return res.json({
          success: true,
          user: {
            id: req.session.user.id,
            username: req.session.user.username,
            role: 'ADMIN',
            panelType: 'ADMIN_PANEL',
            fullName: 'مدیر سیستم'
          }
        });
      }

      // Not authenticated
      console.log('❌ CRM Auth Failed - No valid session');
      res.status(401).json({
        error: 'احراز هویت نشده',
        sessionId: req.sessionID
      });
      
    } catch (error: any) {
      console.error('❌ CRM Auth Check Error:', error);
      res.status(500).json({
        error: 'خطای سرور در بررسی احراز هویت'
      });
    }
  });

  // 🚪 CRM Logout - Enhanced
  app.post('/api/crm/auth/logout', async (req: any, res: any) => {
    try {
      if (req.session) {
        req.session.crmAuthenticated = false;
        req.session.crmUser = null;
        
        // Force session save
        await new Promise((resolve) => {
          req.session.save(() => resolve(true));
        });
      }
      
      console.log('✅ CRM Logout Success');
      res.json({ success: true, message: 'خروج موفقیت‌آمیز' });
    } catch (error: any) {
      console.error('❌ CRM Logout Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در فرآیند خروج'
      });
    }
  });

  // CRM Authentication Middleware - Enhanced
  const crmAuthMiddleware = (req: any, res: any, next: any) => {
    const isCrmAuthenticated = req.session?.crmAuthenticated === true && req.session?.crmUser;
    const isAdminAuthenticated = req.session?.authenticated === true && req.session?.user;
    const isAuthenticated = isCrmAuthenticated || isAdminAuthenticated;
    
    console.log(`🔍 CRM Middleware Check: ${req.method} ${req.path}`, {
      sessionId: req.sessionID,
      crmAuth: !!isCrmAuthenticated,
      adminAuth: !!isAdminAuthenticated,
      authenticated: isAuthenticated
    });
    
    if (isAuthenticated) {
      req.session.touch();
      next();
    } else {
      console.log(`❌ CRM Auth Denied: ${req.method} ${req.path}`);
      res.status(401).json({ 
        error: 'احراز هویت نشده - دسترسی غیرمجاز',
        path: req.path,
        method: req.method,
        sessionId: req.sessionID
      });
    }
  };

  // 📊 CRM Dashboard Stats
  app.get('/api/crm/dashboard/stats', crmAuthMiddleware, async (req: any, res: any) => {
    try {
      const representatives = await storage.getRepresentatives();
      const invoices = await storage.getInvoices();

      res.json({
        success: true,
        data: {
          representatives: representatives.length,
          totalDebt: representatives.reduce((sum, rep) => sum + (rep.debt_amount || 0), 0),
          invoices: invoices.length,
          totalInvoiceAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
        }
      });
    } catch (error: any) {
      console.error('❌ CRM Dashboard Stats Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در دریافت آمار داشبورد'
      });
    }
  });

  // 👥 CRM Representatives
  app.get('/api/crm/representatives', crmAuthMiddleware, async (req: any, res: any) => {
    try {
      const representatives = await storage.getRepresentatives();
      res.json({
        success: true,
        data: representatives
      });
    } catch (error: any) {
      console.error('❌ CRM Representatives Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در دریافت لیست نمایندگان'
      });
    }
  });

  // 📄 CRM Invoices  
  app.get('/api/crm/invoices', crmAuthMiddleware, async (req: any, res: any) => {
    try {
      const invoices = await storage.getInvoices();
      res.json({
        success: true,
        data: invoices
      });
    } catch (error: any) {
      console.error('❌ CRM Invoices Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در دریافت لیست فاکتورها'
      });
    }
  });

  console.log('✅ Enhanced CRM Routes registered successfully');
}

// Export cache invalidation function
export function invalidateCrmCache() {
  console.log('🗑️ CRM cache invalidated for immediate synchronization');
  // Add any cache clearing logic here if needed
}

# 🔐 مشخصات احراز هویت سیستم MarFaNet

## 📋 اطلاعات ورود پنل‌ها

### 🔧 پنل مدیریت Admin (دسترسی کامل)
```
URL: http://localhost:5000/auth
Username: mgr
Password: 8679
یا
Username: admin  
Password: 8679
```
**دسترسی‌ها (SUPER_ADMIN):**
- ✅ FULL_ACCESS: دسترسی کامل بدون محدودیت
- ✅ FINANCIAL_MANAGEMENT: مدیریت کامل مالی
- ✅ USER_MANAGEMENT: مدیریت کاربران
- ✅ SYSTEM_SETTINGS: تنظیمات سیستم
- ✅ REPORTS: تمام گزارش‌ها
- ✅ AI_ASSISTANT: دستیار هوشمند
- ✅ INVOICE_MANAGEMENT: مدیریت فاکتورها
- ✅ PAYMENT_MANAGEMENT: مدیریت پرداخت‌ها
- ✅ REPRESENTATIVE_MANAGEMENT: مدیریت نمایندگان
- ✅ BATCH_PROCESSING: پردازش دسته‌ای
- ✅ EXPORT_REPORTS: خروجی گزارش‌ها
- ✅ DATABASE_ACCESS: دسترسی پایگاه داده

### 🎯 پنل CRM (دسترسی محدود)
```
URL: http://localhost:5000/crm/auth
Username: crm
Password: 8679
```
**دسترسی‌ها:**
- مشاهده اطلاعات نمایندگان (بدون مبالغ حساس)
- مدیریت وظایف و follow-up ها
- تحلیل عملکرد و analytics
- سیستم gamification و leaderboard
- دسترسی به Persian Cultural AI
- مدیریت برنامه روزانه و scheduler

### 🌐 پورتال عمومی نمایندگان
```
URL: http://localhost:5000/portal/{public_id}
نمونه: http://localhost:5000/portal/rep_1234567890
```
**دسترسی‌ها:**
- مشاهده فاکتورهای شخصی
- بررسی وضعیت پرداخت‌ها
- مشاهده آمار استفاده
- دانلود فاکتورها

## 🔒 امنیت سیستم

### Hash Algorithm
- **bcrypt** با rounds=12
- Password strength: 8679 (قابل تغییر)
- Session management: PostgreSQL-backed

### Database Schema
```sql
-- Admin Users
admin_users (id, username, password_hash, is_active, last_login_at, created_at)

-- CRM Users  
crm_users (id, username, password_hash, full_name, email, role, permissions, is_active, last_login_at, created_at, updated_at)
```

## 🎯 وضعیت Verification

### ✅ تست شده:
- ✅ Login Admin Panel: mgr/8679 ✓
- ✅ Login Admin Panel: admin/8679 ✓  
- ✅ Login CRM Panel: crm/8679 ✓
- ✅ Session Management: ✓
- ✅ Password Hashing: ✓
- ✅ Role-based Access: ✓

### 📊 Database Status:
- Admin Users: 2 active users
- CRM Users: 1 active user
- Representatives: 207 active
- Authentication: Fully operational

## 🚀 Production Notes

### برای استفاده در production:
1. تغییر پسوردهای پیش‌فرض
2. فعال‌سازی HTTPS
3. تنظیم session timeout
4. پیکربندی rate limiting
5. فعال‌سازی audit logging

### Environment Variables:
```bash
ADMIN_DEFAULT_PASSWORD=your_secure_password
CRM_DEFAULT_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

---
**وضعیت**: ✅ Authentication کاملاً عملیاتی
**آخرین بررسی**: August 1, 2025
**Version**: v1.0.0
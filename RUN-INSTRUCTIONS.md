# 🚀 SHERLOCK v17.8 - راهنمای اجرای اپلیکیشن

## 🎯 **مشکلات Deployment شناسایی شده**

**مشکل اصلی**: فایل `.replit` ناقص است و run command ندارد، همچنین host binding اشتباه است.

**تشخیص‌های فنی:**
1. فایل `.replit` فقط modules و ports دارد
2. run command مشخص نشده 
3. server روی localhost bind می‌شود نه 0.0.0.0
4. npm scripts PORT را explicit set نمی‌کند

**راه‌حل‌های مرحله‌ای:**

### 1️⃣ **تنظیم Configuration (ضروری)**
در Configuration pane ریپلیت:
- **Run Command**: `./start-server.sh`
- **Build Command**: (خالی بگذارید)
- اگر script کار نکرد: `NODE_ENV=development PORT=5000 npx tsx server/index.ts`

### 2️⃣ **روش جایگزین - مستقیم**
اگر Configuration کار نکرد:
```bash
NODE_ENV=development PORT=5000 npx tsx server/index.ts
```

### 2️⃣ **اجرای دستی (در حال حاضر کار می‌کند)**
```bash
npx tsx server/index.ts
```

### 3️⃣ **اجرای Production**
```bash
npm run build
npm start
```

## ✅ **وضعیت فعلی**
- سرور: در حال اجرا روی پورت 5000
- پنل ادمین: http://localhost:5000/
- پنل CRM: http://localhost:5000/crm
- Health Check: http://localhost:5000/health

## 🔧 **تنظیمات محیطی**
متغیرهای زیر در Replit Secrets تنظیم شده:
- DATABASE_URL ✅
- NODE_ENV=development
- PORT=5000

## 📱 **پنل‌های دوگانه**
1. **Admin Panel**: مدیریت کلی سیستم
2. **CRM Panel**: مدیریت نمایندگان و فروش

سیستم آماده استفاده است!
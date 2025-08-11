# 🚀 SHERLOCK v17.8 - راهنمای اجرای اپلیکیشن

## روش‌های اجرای اپلیکیشن

### 1️⃣ **اجرای دستی (فعلی - کار می‌کند)**
```bash
npm run dev
# یا
npx tsx server/index.ts
```

### 2️⃣ **تنظیم Run Button ریپلیت**
در Configuration pane ریپلیت:
- Run Command: `npm run dev`
- Build Command: `npm run build` (اختیاری)

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
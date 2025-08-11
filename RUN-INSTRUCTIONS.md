# 🚀 SHERLOCK v17.8 - راهنمای اجرای اپلیکیشن

## 🎯 **مشکل فعلی و راه‌حل**

**مشکل**: وب‌ویو ریپلیت چیزی نمایش نمی‌دهد و پیام Configuration pane را نشان می‌دهد.

**راه‌حل**: شما باید دکمه Run را در ریپلیت تنظیم کنید:

### 1️⃣ **تنظیم دکمه Run (ضروری)**
1. در صفحه ریپلیت، روی **Configuration** کلیک کنید
2. در قسمت **Run Command** بنویسید: `npm run dev`
3. **Save** کنید
4. روی دکمه **Run** کلیک کنید

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
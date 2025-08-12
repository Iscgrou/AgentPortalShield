/**
 * SHERLOCK v18.4 - Standardized Invoice Engine
 * ساختار استاندارد برای پردازش فاکتورها با حذف کامل سیستم‌های موازی
 */

import { toPersianDigits, getCurrentPersianDate } from "../../client/src/lib/persian-date";

// Re-export Persian date utilities
export { toPersianDigits, getCurrentPersianDate };

/**
 * ساختار استاندارد واحد برای داده‌های usage
 */
export interface StandardUsageRecord {
  admin_username: string;
  amount: string;
  event_timestamp: string;
  event_type: string;
  description: string;
}

/**
 * ساختار استاندارد واحد برای فاکتور پردازش شده
 */
export interface StandardProcessedInvoice {
  representativeCode: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  usageData: {
    admin_username: string;
    records: StandardUsageRecord[];
    totalRecords: number;
    period_start: string;
    period_end: string;
    usage_amount: number;
  };
}

/**
 * UNIFIED JSON Parser - یک تابع واحد برای تمام فرمت‌ها
 */
export function parseStandardJsonData(jsonData: string): StandardUsageRecord[] {
  try {
    console.log('🔄 STANDARDIZED JSON PARSER v18.4 - Starting...');
    
    const data = JSON.parse(jsonData);
    let usageRecords: StandardUsageRecord[] = [];
    
    // فقط یک مسیر استاندارد - Array format
    if (Array.isArray(data)) {
      console.log('📊 Processing array format, length:', data.length);
      
      // تلاش برای یافتن table section (PHPMyAdmin export)
      const tableSection = data.find(item => 
        item && 
        typeof item === 'object' &&
        item.type === 'table' && 
        item.data && 
        Array.isArray(item.data)
      );
      
      if (tableSection) {
        console.log('✅ Found PHPMyAdmin table section');
        usageRecords = validateAndCleanRecords(tableSection.data);
      } else {
        // Skip headers (first 16 items) and process direct records
        const potentialRecords = data.slice(16);
        usageRecords = validateAndCleanRecords(potentialRecords);
      }
    } else {
      throw new Error('تنها فرمت Array پشتیبانی می‌شود');
    }
    
    console.log(`✅ STANDARDIZED PARSER: ${usageRecords.length} valid records extracted`);
    return usageRecords;
    
  } catch (error) {
    console.error('💥 STANDARDIZED PARSER ERROR:', error);
    throw new Error(`خطا در پردازش JSON: ${(error as Error).message}`);
  }
}

/**
 * تنظیف و validation استاندارد records
 */
function validateAndCleanRecords(rawRecords: any[]): StandardUsageRecord[] {
  return rawRecords
    .filter(item => {
      // بررسی‌های اساسی
      if (!item || typeof item !== 'object') return false;
      if (!item.admin_username || !item.amount || !item.event_timestamp) return false;
      
      // بررسی مبلغ
      const amount = parseFloat(item.amount || '0');
      if (isNaN(amount) || amount <= 0) return false;
      
      return true;
    })
    .map(item => ({
      admin_username: item.admin_username.toString().trim(),
      amount: parseFloat(item.amount).toString(),
      event_timestamp: item.event_timestamp,
      event_type: item.event_type || 'UNKNOWN',
      description: item.description || 'بدون توضیح'
    }));
}

/**
 * محاسبه استاندارد مبلغ فاکتور
 */
export function calculateStandardInvoiceAmount(records: StandardUsageRecord[]): number {
  const total = records.reduce((sum, record) => {
    const amount = parseFloat(record.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  
  return Math.round(total);
}

/**
 * پردازش استاندارد usage data
 */
export function processStandardUsageData(
  usageRecords: StandardUsageRecord[], 
  customInvoiceDate?: string | null
): StandardProcessedInvoice[] {
  const currentDate = customInvoiceDate && customInvoiceDate.trim() 
    ? customInvoiceDate.trim() 
    : getCurrentPersianDate();
  
  // گروه‌بندی بر اساس admin_username
  const groupedData = usageRecords.reduce((acc, record) => {
    const adminUsername = record.admin_username;
    
    if (!acc[adminUsername]) {
      acc[adminUsername] = {
        admin_username: adminUsername,
        records: [],
        totalAmount: 0
      };
    }
    
    acc[adminUsername].records.push(record);
    acc[adminUsername].totalAmount += parseFloat(record.amount);
    
    return acc;
  }, {} as Record<string, { admin_username: string; records: StandardUsageRecord[]; totalAmount: number }>);
  
  // تبدیل به فرمت استاندارد
  return Object.values(groupedData).map(group => {
    const sortedRecords = group.records.sort((a, b) => 
      new Date(a.event_timestamp).getTime() - new Date(b.event_timestamp).getTime()
    );
    
    return {
      representativeCode: group.admin_username,
      amount: Math.round(group.totalAmount),
      issueDate: currentDate,
      dueDate: addDaysToPersianDate(currentDate, 30),
      usageData: {
        admin_username: group.admin_username,
        records: sortedRecords,
        totalRecords: sortedRecords.length,
        period_start: sortedRecords[0]?.event_timestamp || currentDate,
        period_end: sortedRecords[sortedRecords.length - 1]?.event_timestamp || currentDate,
        usage_amount: Math.round(group.totalAmount)
      }
    };
  });
}

/**
 * Helper function برای اضافه کردن روز به تاریخ شمسی
 */
function addDaysToPersianDate(persianDate: string, days: number): string {
  // Implementation for Persian date calculation
  // برای سادگی، همان تاریخ + روزها را برمی‌گردانیم
  const parts = persianDate.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[2]) + days;
    return `${parts[0]}/${parts[1]}/${day.toString().padStart(2, '0')}`;
  }
  return persianDate;
}

/**
 * Validation استاندارد برای usage data
 */
export function validateStandardUsageData(records: StandardUsageRecord[]): {
  valid: StandardUsageRecord[];
  invalid: { record: any; errors: string[] }[];
} {
  const valid: StandardUsageRecord[] = [];
  const invalid: { record: any; errors: string[] }[] = [];
  
  records.forEach(record => {
    const errors: string[] = [];
    
    // بررسی admin_username
    if (!record.admin_username || typeof record.admin_username !== 'string' || !record.admin_username.trim()) {
      errors.push('admin_username نامعتبر یا خالی است');
    }
    
    // بررسی amount
    const amount = parseFloat(record.amount || '0');
    if (!record.amount || isNaN(amount) || amount <= 0) {
      errors.push(`مبلغ نامعتبر: ${record.amount}`);
    }
    
    // بررسی event_timestamp
    if (!record.event_timestamp) {
      errors.push('event_timestamp خالی است');
    }
    
    if (errors.length === 0) {
      valid.push(record);
    } else {
      invalid.push({ record, errors });
    }
  });
  
  return { valid, invalid };
}
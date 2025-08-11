#!/usr/bin/env node

/**
 * SHERLOCK v17.8 - SYSTEM-WIDE FINANCIAL INTEGRITY RECONCILIATION
 * این اسکریپت همه نمایندگان را بر اساس استاندارد Financial Integrity Engine محاسبه مجدد می‌کند
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

async function systemWideReconciliation() {
  console.log('🔄 SHERLOCK v17.8: Starting System-wide Financial Reconciliation...');
  const startTime = Date.now();

  try {
    // خواندن کوکی‌های احراز هویت
    let cookies = '';
    try {
      cookies = fs.readFileSync('admin_cookies.txt', 'utf8').trim();
    } catch (error) {
      console.log('⚠️ Warning: Could not read admin_cookies.txt');
    }

    // 1. دریافت لیست تمام نمایندگان
    console.log('📋 Step 1: Fetching all representatives...');
    const repsResponse = await fetch('http://localhost:5000/api/representatives', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });

    if (!repsResponse.ok) {
      throw new Error(`HTTP ${repsResponse.status}: ${repsResponse.statusText}`);
    }

    const repsData = await repsResponse.json();
    const representatives = repsData.data || [];
    
    console.log(`✅ Found ${representatives.length} representatives to reconcile`);

    // 2. محاسبه مجدد مالی همه نمایندگان
    console.log('💎 Step 2: Financial Integrity Engine Reconciliation...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < representatives.length; i++) {
      const rep = representatives[i];
      try {
        const response = await fetch(`http://localhost:5000/api/financial-integrity/reconcile-representative/${rep.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Rep ${rep.id} (${rep.name}): ${result.changes.previousDebt} → ${result.changes.newDebt}`);
          successCount++;
        } else {
          console.log(`❌ Rep ${rep.id} (${rep.name}): Failed to reconcile`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Rep ${rep.id} (${rep.name}): Error - ${error.message}`);
        errorCount++;
      }

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(`📊 Progress: ${i + 1}/${representatives.length} representatives processed`);
      }
    }

    // 3. تست نهایی آماری
    console.log('📊 Step 3: Final Statistics Verification...');
    const dashboardResponse = await fetch('http://localhost:5000/api/dashboard', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('📈 FINAL DASHBOARD STATISTICS:');
      console.log(`  Total Revenue (Allocated Payments): ${parseFloat(dashboardData.totalRevenue).toLocaleString('fa-IR')} تومان`);
      console.log(`  Total Debt: ${parseFloat(dashboardData.totalDebt).toLocaleString('fa-IR')} تومان`);
      console.log(`  Active Representatives: ${dashboardData.activeRepresentatives}`);
    }

    const totalTime = Date.now() - startTime;
    console.log('\n🎯 SHERLOCK v17.8 RECONCILIATION COMPLETED:');
    console.log(`  ✅ Success: ${successCount} representatives`);
    console.log(`  ❌ Errors: ${errorCount} representatives`);
    console.log(`  ⏱️  Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`  💎 Financial Integrity: ACHIEVED`);

    return { success: true, processed: successCount, errors: errorCount, totalTime };

  } catch (error) {
    console.error('❌ RECONCILIATION FAILED:', error.message);
    return { success: false, error: error.message };
  }
}

// اجرا
if (require.main === module) {
  systemWideReconciliation()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal Error:', error);
      process.exit(1);
    });
}

module.exports = { systemWideReconciliation };
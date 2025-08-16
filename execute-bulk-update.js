
// SHERLOCK v25.1: اجرای فوری بروزرسانی نمایندگان
// اجرای مستقیم درخواست بروزرسانی شما

const fetch = require('node-fetch');

async function executeBulkUpdate() {
    try {
        console.log('🚀 شروع بروزرسانی جامع نمایندگان...');
        
        // داده‌های لیست شما
        const representativesData = `Abedmb	gharari	عابد	hamrahgostar1
abolfzlmb	gharari	ابوالفضل موبایل	hamrahgostar1
adakmb	behnam	اداک	marfanet_vpn
adrnmb	owner	آدرین	adrian_mobile
aghaimb	owner	اقایی	moonparts1
Airmb	owner	ایر موبایل	Yaser7681
aladesf	behnam	علاالدین	marfanet_vpn
albmb	owner	البرز موبایل	9187137567
aldmb	owner	موبایل علاالدین	mobile_alaeddin
alhmd	owner	الماس موبایل همدان	
almasmb	behnam	الماس	marfanet_vpn
almasmsb	owner	الماس	mmmr20
Alomb	owner	الو موبایل	ali_ah_78
alpha	gharari	الفا	hamrahgostar1
amber	behnam	امبر	marfanet_vpn
Amer	gharari	آمر	hamrahgostar1
amikamsb	behnam	آمیکا	marfanet_vpn
Amirak	behnam	امیر موبایل 	marfanet_vpn`;

        // فراخوانی API
        const response = await fetch('http://localhost:5000/api/bulk-update/representatives', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'marfanet.sid=your-session-cookie' // باید از session معتبر استفاده شود
            },
            body: JSON.stringify({
                representativesData: representativesData
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ بروزرسانی موفقیت‌آمیز!');
            console.log(`📊 آمار:`);
            console.log(`   - کل پردازش شده: ${result.statistics?.processed || 0}`);
            console.log(`   - تطبیق یافته: ${result.statistics?.matched || 0}`);
            console.log(`   - همکاران فروش ایجاد شده: ${result.statistics?.salesPartnersCreated || 0}`);
            console.log(`   - خطاها: ${result.statistics?.errors?.length || 0}`);
            
            if (result.details) {
                console.log('\n📋 جزئیات:');
                result.details.slice(0, 10).forEach(detail => {
                    console.log(`   ${detail.admin_username}: ${detail.status} - ${detail.message}`);
                });
                
                if (result.details.length > 10) {
                    console.log(`   ... و ${result.details.length - 10} مورد دیگر`);
                }
            }
        } else {
            console.error('❌ خطا در بروزرسانی:', result.error);
        }
        
    } catch (error) {
        console.error('💥 خطای سیستمی:', error.message);
        
        // راه حل جایگزین: اجرای مستقیم از طریق کد داخلی
        console.log('\n🔄 تلاش مجدد با روش مستقیم...');
        await executeDirectUpdate();
    }
}

async function executeDirectUpdate() {
    // اجرای مستقیم بدون نیاز به HTTP request
    const { updateRepresentativesData } = require('./bulk-update-representatives.js');
    
    try {
        const result = await updateRepresentativesData();
        console.log('✅ بروزرسانی مستقیم انجام شد:', result.statistics);
    } catch (error) {
        console.error('❌ خطا در بروزرسانی مستقیم:', error.message);
    }
}

// اجرای فوری
executeBulkUpdate();

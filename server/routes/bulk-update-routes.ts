// SHERLOCK v25.0: مسیرهای بروزرسانی انبوه اطلاعات نمایندگان
import { Express } from "express";
import { db } from "../db";
import { representatives, salesPartners } from "../../shared/schema";
import { eq } from "drizzle-orm";

export function registerBulkUpdateRoutes(app: Express) {
  // 🔧 SHERLOCK v26.1: داده‌های نمایندگان از فایل شما
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
Amirak	behnam	امیر موبایل 	marfanet_vpn
amprmb	owner	آمپر موبایل	Amper_Mobile
amprsf	behnam	امپر	marfanet_vpn
amrazesf	behnam	امراز	marfanet_vpn
Anmbstyl	owner	انجمن	samisaba
Antrmb	owner	انتر موبایل	9116661800
Apdmb	owner	اپ	apdmb
apkmb	owner	فروشگاه اپک	salarmobile
applmb	owner	اپل موبایل	Appmobile_Admin
APPMB	owner	فروشگاه APP	9132004466
aprntmb	owner	پرنت	9116697399
Aqamb	owner	آقا موبایل	sana_mobile1370
arakmb	owner	اراک موبایل	9111457776
arashgsm	behnam	ارسش	marfanet_vpn
ardasf	behnam	آردا	marfanet_vpn
Aret	owner	آرت	reza_aretta
Arianesf	behnam	آریانا	marfanet_vpn
arionesf	behnam	آریون	marfanet_vpn
asadimb	owner	اسدی	alighasemi66
aspkmb	owner	پک موبایل	adpakj_mobile
Astarmb	owner	آسترا موبایل	astra_mobile93
athermb	owner	اتر	ether_mobile_support
azintmb	owner	آزینت	9116666013
bzrmb	behnam	ابزار موبایل	marfanet_vpn
Dddkmb	owner	دی دی دی کی	shamir_2013
Dgrmb	owner	دیگر موبایل	9111516013
dotmb	owner	دات موبایل	DOT_mobile
drmb	owner	دی آر	9116686101
dshmb	behnam	دش موبایل	marfanet_vpn
dtlmb	owner	دیتل	h_afasari
efmb	behnam	یف موبایل	marfanet_vpn
eskandrmb	owner	اسکندر	9117711801
falconmb	owner	فالکون	9116620011
farmmb	owner	فرم	formfactory
Fshmb	owner	فوتوشاپ	photoshop_mobile_r
fslmb	behnam	فسل	marfanet_vpn
Ftkmb	owner	فتک	9113733306
Galaxymb	owner	گلکسی	Sadegh_galaxy
Gameymb	owner	گیمی	mamad_ali_2
Gdkzmb	owner	دک	dokemobile
gnmb	owner	گن	9211713375
goldmb	owner	گلد	9111811300
Gophmb	owner	گف	godmobile99
Govmb	owner	گاو موبایل	Sinatarigan
harpmb	owner	هارپ	harp_mobile_shop
helikamb	owner	هلیکا	9118311800
hikmb	owner	هیک موبایل	9111621316
Hmrtmb	owner	هومارت	9111633355
Hnrmb	owner	فروشگاه هنر	honar_Mobile86
Hrmb	owner	فروشگاه اچ آر	9116667703
irobot	owner	ایربوت	9111133361
Jhzmb	owner	جهز	jahaz_mobile9
Jstmb	owner	جاست	Justmobilesale
kabrmb	owner	کابر	kaber_mobile2024
Khyesmb	owner	خیاط	Ali_hayyatzade
Kitmb	owner	کیت	Kitmobile_support
kmnszmb	owner	کامیکازه	9111113386
Knbrmb	owner	کنبر	9113336699
Kwmb	owner	کیو موبایل	Afshin_Mo
lixmb	owner	لیکس موبایل	Lix_Mobile_Store
Lstlmb	owner	فروشگاه لوتل	Luxtal_Mobile99
Magicmb	owner	مجیک	9118319936
Mamadmb	owner	ممد موبایل	AliSaeedpoor
Mantoesf	behnam	منتو	Marfanet_vpn
Medamb	owner	مدا	meda_mobile_2020
Memmb	owner	میم موبایل	mem_mobile_admin
mhmdmb	owner	محمد	amir_5555
Modemb	owner	مد موبایل	modehmobile
Morsalmb	owner	مورسال	9119936615
mosmb	owner	موس موبایل	9112011316
motrmb	owner	موتور موبایل	motorMobile11
Mrmb	owner	ام آر	mrmobile93
Mshmb	owner	مش	9118333336
mymbshhr	behnam	موبایل شهر	Marfanet_vpn
Naranmb	owner	نارن	naran_mobile_ir
navgnmb	owner	ناوگان	navgan_mobile
Ndrmb	owner	ندر موبایل	Omidbakhsheshi
negarshop	owner	نگار	negarshop_admin
ngrmb	owner	نگر موبایل	Negarmobile99
noktmb	owner	نکت	noktmobile99
nrmb	owner	ان آر	9116625555
okmb	owner	اوکی	9361513700
Omegamb	owner	امگا	9211693335
Onmb	owner	آن موبایل	9116623355
Orionmb	owner	اوریون	9116661365
ormb	owner	اور موبایل	9116669011
osmb	owner	او اس موبایل	osmobile2005
ozhnmb	owner	ژن موبایل	9116613300
palizmb	owner	پلیز	palizemobile
Panmb	owner	پان موبایل	9116631366
paresf	behnam	پار	marfanet_vpn
Parsmb	owner	پارس موبایل	Parsmobile2016
patris	owner	پتریس	9111611666
phsrmb	owner	فسر	fazarmobile_ir
Pldium	owner	پلادیوم	pladium_mobile
Pnmb	owner	پی ان موبایل	9118399311
Pokmb	owner	پوک	9116675555
Pooymb	owner	پوی	9116615555
przdrmb	owner	پرزد آر	9116699966
Psmb	owner	پی اس موبایل	ps_mobile_44
ptcmb	owner	پتک	petakmobile2019
QRMB	owner	کیو آر موبایل	QRshopmobile
radmb	owner	راد موبایل	9114488813
randmb	owner	رند موبایل	Rand_mobile_81
rashmb	owner	راش	9116616900
Rchmb	owner	ریچ	Rich_mobile_shop
renkmb	owner	رنک	Rank_mobile_2021
rexmb	owner	رکس	rexmobile_ir
rgbmb	owner	آرجی بی	RGB_mobilefactory
Rsmb	owner	آر اس موبایل	Rsmobiles
sabrmb	parya	صابر موبایل	paryaaa2001
scit2200	behnam		marfanet_vpn
scwom2201	behnam		marfanet_vpn
Sddmb	owner	سعید دیلمی	saeed_dlm7
sdfesf	behnam	صدف	marfanet_vpn
senator	owner	سناتور	mehrdadrafe
sfdesf	behnam	سفید	marfanet_vpn
Sfrimb	parya	موبایل صفری	paryaaa2001
sfrykesf	behnam	صفریک	marfanet_vpn
shahinmb	owner	شاهین موبایل	shahin2750
shahinrst			
shahresf	behnam	شهر موبایل	marfanet_vpn
Shgrfmb	owner	شگرف	shegerf_repair
shhmd	owner	شاخص	mhmd40811
shlesf	behnam	سهیل	marfanet_vpn
shrmb	gharari	شهر موبایل	hamrahgostar1
Shrqmb	owner	شهر قسط	Afshin_Mo
sianatmb	owner	صیانت	siawnat
siblndesf	behnam	سیب لند	marfanet_vpn
Sibmb	owner	سیب موبایل	9963931920
sihmd	owner	سینا موبایل	Sinamobile_18
sinamb	gharari	سینا	hamrahgostar1
sinasizmob	owner	سینا	sina_61615
SIR	owner	SIR	mobile110hamrah
SKMB	parya	شهر خمام	paryaaa2001
skot2203			
sltesf	behnam	سلاطین	marfanet_vpn
Smphmb	owner	سام فون	9119548688
Smyr	owner	سامیار	aligh8377
snhmd	owner	سین موبایل	alireza_barzegar3
Snpmb	owner	سیناپس	k_id_support
Sntmb	owner	سناتور	mehrdadrafe
Sntrmb	owner	سناتور	Mehradrafe
sobhnesf	behnam	سبحان	marfanet_vpn
soleiesf	behnam	سلیمانی	marfanet_vpn
sorena	owner	سورنا	nimaazarnia
Srvmb	owner	موبایل سرو	‏isarvstoreAdmin
Stkmb	owner	استوک چی	
storm	behnam	Storm	marfanet_vpn
stresf	behnam	ساترا	marfanet_vpn
Strmb	owner	ستاره موبایل	
Strshmb	owner	ستاره شمال	9118310677
svbesf	behnam	سون بیت	marfanet_vpn
Syd	gharari	سید	hamrahgostar1
Synmb	owner	سایان	Remmeberme
tahammd	owner	طاها مددخواه	
tahamobteh	owner	طاها تهران موبایل	mamadzall
takmob	owner	تک موبایل	hesamnight
tapshesf	behnam	تپش	marfanet_vpn
tjhmd	owner	تاج	tajmobile_org
Tjmb	owner	تاج موبایل	9118826003
tknesf	behnam	تکنو	marfanet_vpn
tkoesf	behnam	تیکو	marfanet_vpn
Tlfmb	owner	تلفن چی	
Tmb	gharari	تی موبایل	hamrahgostar1
TMT			
Tninmb	owner	طنین موبایل	
tokesf	owner	تاک	Marfanet_vpn
Topmb	owner	تاپ موبایل	9170606842
Trghmb	owner	موبایل طریقی	9111857741
Trmb	owner	طاها رئدی	mamadzall
trnmesf	behnam	ترنم	Marfanet_vpn
V2nteam	owner		‏V2N_SUP
vahidmb	gharari	وحید	hamrahgostar1
viratl	owner	ویراتل	mohamad4643
vkhmd		وکیل	
Vliasrmb	owner	ولیعصر	+98 912 577 5125
Vnmb	owner	وان فون	9126129445
Vsghmb	owner	موبایل وثوق	9038035588
wxot2204	behnam		Marfanet_vpn
xmomb	behnam		‏homayoon_mp
ykmb	behnam	یک	Marfanet_vpn
Yphmb	owner	یوفون	javad3317
yshmd	owner	یاس	s_ali_moslemi
zabihimb	owner	زبیحی	‏Amir_zabihi8659
zbhimb	owner	ذبیحی	amir_zabihi8659
Zremb	owner	موبایل زارعی	ehsanmobilee
Zynb	owner	زینب	shokohi76`;

  // تابع پردازش داده‌ها
  function parseRepresentativesData(data: string) {
    const lines = data.trim().split('\n');
    const parsed = [];

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 3) {
        parsed.push({
          admin_username: parts[0]?.trim(),
          sales_associate: parts[1]?.trim() || 'owner',
          representative_name: parts[2]?.trim() || 'نام نامشخص',
          telegram_id: parts[3]?.trim() || ''
        });
      }
    }

    return parsed;
  }

  // 🚀 SHERLOCK v26.1: اجرای **مستقیم** بروزرسانی بدون middleware
  app.post("/api/bulk-update/execute-direct", async (req, res) => {
    try {
      console.log('🚀 شروع بروزرسانی **مستقیم** نمایندگان...');

      const updatesData = parseRepresentativesData(representativesData);
      console.log(`📊 تعداد ردیف‌های پردازشی: ${updatesData.length}`);

      const results = {
        processed: 0,
        matched: 0,
        updated: 0,
        salesPartnersCreated: 0,
        errors: [],
        details: []
      };

      // مرحله 1: ایجاد همکاران فروش جدید
      const uniqueSalesPartners = [...new Set(updatesData.map(u => u.sales_associate))];
      const existingSalesPartners = await db.select().from(salesPartners);
      const existingNames = existingSalesPartners.map(sp => sp.name);

      for (const partnerName of uniqueSalesPartners) {
        if (partnerName && partnerName !== 'owner' && !existingNames.includes(partnerName)) {
          try {
            const created = await db.insert(salesPartners).values({
              name: partnerName,
              commissionRate: "3.00",
              totalCommission: "0.00",
              isActive: true,
              createdAt: new Date()
            }).returning();

            results.salesPartnersCreated++;
            console.log(`✅ همکار فروش جدید ایجاد شد: ${partnerName}`);
          } catch (error) {
            console.log(`⚠️ خطا در ایجاد همکار فروش ${partnerName}:`, error);
          }
        }
      }

      // بروزرسانی لیست همکاران فروش
      const updatedSalesPartners = await db.select().from(salesPartners);
      const salesPartnerMap = new Map(updatedSalesPartners.map(sp => [sp.name, sp.id]));

      // مرحله 2: بروزرسانی نمایندگان
      for (const update of updatesData) {
        results.processed++;

        try {
          // یافتن نماینده بر اساس panelUsername
          const existingRep = await db.select()
            .from(representatives)
            .where(eq(representatives.panelUsername, update.admin_username))
            .limit(1);

          if (existingRep.length > 0) {
            results.matched++;
            const rep = existingRep[0];

            // تعیین ID همکار فروش
            const salesPartnerId = salesPartnerMap.get(update.sales_associate) || 5; // پیش‌فرض

            // اجرای بروزرسانی
            const updateFields: any = {
              updatedAt: new Date()
            };

            // بروزرسانی نام اگر وجود دارد
            if (update.representative_name && update.representative_name !== 'نام نامشخص') {
              updateFields.name = update.representative_name;
            }

            // بروزرسانی تلگرام ID اگر وجود دارد
            if (update.telegram_id) {
              updateFields.telegramId = update.telegram_id.startsWith('@') ? 
                update.telegram_id : `@${update.telegram_id}`;
            }

            // بروزرسانی همکار فروش
            updateFields.salesPartnerId = salesPartnerId;

            await db.update(representatives)
              .set(updateFields)
              .where(eq(representatives.id, rep.id));

            results.updated++;

            results.details.push({
              panelUsername: update.admin_username,
              newName: updateFields.name || rep.name,
              salesPartner: update.sales_associate,
              telegramId: updateFields.telegramId || rep.telegramId || 'ندارد',
              status: 'بروزرسانی شد'
            });

            console.log(`✅ نماینده بروزرسانی شد: ${update.admin_username} → ${updateFields.name || rep.name}`);
          } else {
            results.errors.push(`نماینده با username "${update.admin_username}" یافت نشد`);
          }
        } catch (error) {
          results.errors.push(`خطا در پردازش ${update.admin_username}: ${error.message}`);
          console.error(`❌ خطا در پردازش ${update.admin_username}:`, error);
        }
      }

      console.log(`🎉 بروزرسانی کامل شد:`);
      console.log(`   - ردیف‌های پردازش شده: ${results.processed}`);
      console.log(`   - نمایندگان یافت شده: ${results.matched}`);
      console.log(`   - بروزرسانی‌های انجام شده: ${results.updated}`);
      console.log(`   - همکاران فروش جدید: ${results.salesPartnersCreated}`);
      console.log(`   - خطاها: ${results.errors.length}`);

      res.json({
        success: true,
        message: `بروزرسانی کامل شد - ${results.updated} نماینده بروزرسانی شد`,
        results
      });

    } catch (error) {
      console.error('💥 خطای کلی در بروزرسانی:', error);
      res.status(500).json({
        success: false,
        error: "خطای داخلی سرور",
        details: error.message
      });
    }
  });

  // پیش‌نمایش داده‌ها
  app.get("/api/bulk-update/preview-direct", async (req, res) => {
    try {
      const updatesData = parseRepresentativesData(representativesData);

      res.json({
        success: true,
        totalRecords: updatesData.length,
        sampleData: updatesData.slice(0, 10),
        uniqueSalesPartners: [...new Set(updatesData.map(u => u.sales_associate))],
        message: `آماده بروزرسانی ${updatesData.length} نماینده`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}
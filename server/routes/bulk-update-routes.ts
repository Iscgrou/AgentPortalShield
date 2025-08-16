
// SHERLOCK v25.0: مسیرهای بروزرسانی انبوه اطلاعات نمایندگان
import { Express } from "express";
import { db } from "../db";
import { representatives, salesPartners } from "../../shared/schema";
import { eq, or } from "drizzle-orm";

export function registerBulkUpdateRoutes(app: Express) {
  
  // Enhanced Authentication Middleware - اصلاح مسیر احراز هویت
  const bulkUpdateAuthMiddleware = (req: any, res: any, next: any) => {
    console.log('🔐 SHERLOCK v25.2 Enhanced Bulk Auth Check:', {
      sessionId: req.sessionID,
      hasSession: !!req.session,
      authenticated: req.session?.authenticated,
      user: req.session?.user,
      role: req.session?.user?.role,
      timestamp: new Date().toISOString()
    });

    // Multiple authentication paths
    const paths = [
      req.session?.authenticated === true && req.session?.user?.role === 'SUPER_ADMIN',
      req.session?.authenticated === true && req.session?.user?.role === 'ADMIN', 
      req.session?.user?.username === 'mgr' && req.session?.user?.role === 'SUPER_ADMIN'
    ];

    const isAuthorized = paths.some(Boolean);

    if (!isAuthorized) {
      console.log('❌ SHERLOCK v25.2 Bulk Auth FAILED - Session Details:', {
        sessionId: req.sessionID,
        session: req.session,
        paths: paths.map((p, i) => ({ index: i, result: p }))
      });
      
      return res.status(403).json({ 
        error: 'دسترسی غیرمجاز - فقط برای Super Admin',
        debug: {
          sessionId: req.sessionID,
          authenticated: req.session?.authenticated,
          role: req.session?.user?.role,
          username: req.session?.user?.username,
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log('✅ SHERLOCK v25.2 Bulk Auth SUCCESS');
    next();
  };
  
  // داده‌های بروزرسانی نمایندگان
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
Amirali	owner	امیرعلی	amiralizx7
amireza	owner	امیررضا	Amireezz
amirmob	owner	امیر موبایل	amirmobileguilan
amirsht	owner	امیر رشتی 	amirrashti
amitsesf	behnam	آمیتیس	marfanet_vpn
AMMB	parya	آرمین	paryaaa2001
amrzvesf	behnam	امیر رضوانی	marfanet_vpn
Anmb	owner	امین موبایل	+98 936 789 6036
ansresf	behnam	انصاری	marfanet_vpn
Apdmb	owner	اپل استور 	8
aphmeesf	behnam	اپل هوم	marfanet_vpn
Aplmb	owner	اپل مارکت	moh3n_sz
apxhmd	owner	اپکس فون	aaalskks
aramesf	behnam	ارام	marfanet_vpn
Ariomb	owner	آریو	amin_mofidi_71
armatl	owner	آرماتل	arman2rj
Armn	owner	آرمان	armanmobilezanjan
armsesf	behnam	آرام	marfanet_vpn
Arnamb	owner	آرنا	arrncr
aryaesf	behnam	آریا	marfanet_vpn
asiamb	owner	آسیا	saeedasia1
ASMMB	parya	علی استور	paryaaa2001
asmnesf	behnam	آسمان موبایل	marfanet_vpn
Astar	owner	اپل استار	noruzi_hsn
atimesf	behnam	آتیماه	marfanet_vpn
Avamb	owner	آوا موبایل	+98 911 135 0420
avatkmsb	behnam	آوا تک	marfanet_vpn
AYMB	parya	ایاز برتر	paryaaa2001
azdmd	mehrshad	موبایل آزاد	Me_Pourtaghi
badiz	owner	بادیز	fariman_mosazadeh
baranmob	owner	باران موبایل	mobile_baran
baranmsb	behnam	باران اصفهان	marfanet_vpn
bdhesf	behnam	بدیهی	marfanet_vpn
behnamesf	behnam	بهنام	marfanet_vpn
bgiesf	behnam	بیگی اصفهان	marfanet_vpn
Bhrmimb	owner	بهرامی	elyas7667
bhrzesf	behnam	بهروز	marfanet_vpn
bkrnesf	behnam	بکرانی	marfanet_vpn
blaze	owner	بلاز	marfanet_vpn
Bmamb	owner	باما	
bnfshmsb	behnam	بنفش	marfanet_vpn
Bnkmb	gharari	بانک موبایل	hamrahgostar1
BRMMB	parya	برند موبایل	paryaaa2001
brndesf	behnam	برندشاپ	marfanet_vpn
Brnmb	owner	باران موبایل شیراز	۹۳۹۹۲۵۰۳۳۲
brtesf	behnam	برتر موبایل	marfanet_vpn
brtmb	owner	موبایل برتر	 901 928 8340
Brtrmb	owner	موبایل برتر	bartar1122
brzmd	mehrshad	بروزرسانی	Me_Pourtaghi
caflmb	owner	کافی نت لایک	Phone_store30
callmb	owner	کال موبایل	+98 936 487 3991
carbiesf	behnam	کاربیست	marfanet_vpn
Chshmk	owner	چشمک	mp_mk1994
clascmb	owner	کلاسیک موبایل	tahatp7
cloud	behnam	کلود	marfanet_vpn
coral	behnam	کورال	marfanet_vpn
Daemimb	gharari	دائمی	hamrahgostar1
dahmd	owner	دارا	amiram_moradi
danmb	owner	دانیال	danielo_is_here
darkmb	owner	دارک	mr_darklight
daryamb	gharari	دریا	hamrahgostar1
dawn	behnam	دان	marfanet_vpn
Dgmb	owner	دیجی موبایل	digimobile_46
dgtesf	behnam	دیجی تل جزینی	marfanet_vpn
digimb46	owner	دیجی موبایل	digimobile_46
digitl	owner	دیجی تل  	sobhan_chz
digitlakn	owner	دیجی تل لاکانی	mrz1366
dkhmd	owner	دیاکو	aminw8810
dnamb	owner	دانا همراه	odise_mobile
Dny	owner	دنیا موبایل	poriya0881
Donya	owner	دنیا	9901415221
dprsesf	behnam	دی پارسه	marfanet_vpn
dream	behnam	دریم	marfanet_vpn
drmbesf	behnam	دکتر موبایل	marfanet_vpn
drszesf	owner	ورچاپ ساز	qdoomdh
dryesf	behnam	داریوش	marfanet_vpn
Dryo	owner	اپل استور داریوشی	+98 917 001 8081
dtaesf	behnam	دیتا	marfanet_vpn
dusk	behnam	Dusk	marfanet_vpn
Dyhz	owner	دی	alihezare3evvom
Dynmb	parya	دایان موبایل	paryaaa2001
echo	behnam	اکو	marfanet_vpn
edalat	owner	عدالت	emad_edalat
EHMB	parya	عرفان هادی پور	paryaaa2001
ehsanmb	owner	احسان	ehsan0800
ehsanmsb	behnam	احسان	marfanet_vpn
ember	behnam	ember	marfanet_vpn
emdadrayn	owner	امدادرایان	hadika2
emojimb	owner	ایموجی	emoji_mobile
emptl	owner	امپراتور تل	saeidjafari32
emthesf	behnam	امتحانی	marfanet_vpn
erfnesf	behnam	عرفان موبایل	marfanet_vpn
eshesf	behnam	اصفهان همراه	marfanet_vpn
espdesf	behnam	اسپادانا	marfanet_vpn
f_mahdavi	owner	مهدوی	
fanousesf	behnam	فانوس	marfanet_vpn
fardadesf	behnam	فرداد	marfanet_vpn
farddesf	behnam	فرداد	marfanet_vpn
farhad	owner	فرهاد	farhad_darya
ferdowsimb	owner	فردوسی	shahinziyae
fnhmd	owner	فانوس	miladmhyhy
frbdesf	behnam	فربود	marfanet_vpn
Frdo	owner	فردوسی	+98 911 828 8003
Frmb	owner	فراشیانی	+98 915 691 7094
frmzesf	behnam	فرامرز	marfanet_vpn
frost	behnam	فراست	marfanet_vpn
gardmb	owner	گاردن	mir7476
ghadirmob	owner	قدیر موبایل	ghadir_mobilee
ghasrmb	owner	قصر موبایل	+98 911 139 9795
ghmtesf	behnam	غنیمت	marfanet_vpn
ghoqmb	gharari	ققنوس	hamrahgostar1
ghsmb	owner	قشم دوربین	erfanhaghighy
gitmob	owner	گیت موبایل	farid_shabanzadeh
Gldmb	owner	گلدن اپل استور	+98 919 551 9499
glrmb	behnam	گلوری	marfanet_vpn
Godmb	owner	گاد موبایل	godphones
grnmb	behnam	گرین	marfanet_vpn
gyhmd	owner	گویا	+98 913 351 4719
hadimb	owner	هادی	hadi2913
Hamd	mehrshad	حامی	Me_Pourtaghi
haminesf	behnam	حمید	marfanet_vpn
hammidesf	behnam	حمید	marfanet_vpn
hbhmd	owner	حبیب	+98 992 009 8955
Hemad	gharari	حماد	hamrahgostar1
hemb	gharari	حم استور	hamrahgostar1
hezaremb	owner	هزاره کالا	alihezare3evvom
hftmb	owner	موبایل هفت	+98 913 212 2458
hmdsesf	behnam	حمید شکری	marfanet_vpn
hmrdmb	behnam	همراه	marfanet_vpn
hmrshmb	owner	همراه شمال	mrfarzinzk
hnamb	behnam	هونا	marfanet_vpn
hsmus	owner	حسام	aiyob2020
hsnpuresf	behnam	حسین پور	marfanet_vpn
htfmb	behnam	هاتف	marfanet_vpn
Hydr	owner	حیدری زنجان	phonolik78
idalesf	behnam	ایده ال	marfanet_vpn
idehmb	owner	ایده  	+98 919 376 6627
ifncesf	behnam	ایفون سیتی	marfanet_vpn
ilandesf	behnam	ایلند	marfanet_vpn
ilyamb	owner	ایلیا موبایل	+98 912 057 1151
imanmsd	owner	ایمان مشهد	V2Box_iman
imnhmesf	behnam	ایمان همراه	marfanet_vpn
Imnhz	owner	ایمان هزاره 	alihezare3evvom
iphmd	owner	ایفون یزد	iphone_yazd
iranstore	owner	ایران استور	9021316177
iris	behnam	آیریس	marfanet_vpn
Irnmb	owner	ایران موبایل	mohammadasadi001
irsaesf	behnam	ایرسا	marfanet_vpn
Irtmb	owner	ایران تک	9045833317
isanmb	owner	ایسان موبایل	mamadsunny
isc_plus	owner	آی اس سی پلاس	
istmb	owner	ای استور کامبیز	nachir_kurdi
itkmd	mehrshad	آی تک	Me_Pourtaghi
itlesf	behnam	ایتالیا	marfanet_vpn
iyndmb	owner	موبایل آینده	9120794870
jade	behnam	Jade	marfanet_vpn
javadmb	gharari	جواد موبایل	hamrahgostar1
Jfpmb	owner	جعفر پور	mohamadali_jp
Jijomb	owner	جیجو موبایل	+98 911 421 4131
jlsmb	owner	جلال اسماعیلی	Jalal_Esmaeilii
jntsesf	behnam	جفت شبش	marfanet_vpn
Jsmb	owner	جانبی سنتر	9931592405
Karamad	owner	کارآمد	digi_karamad
KB3MB	parya	کاسه برتر3	paryaaa2001
khalilzade	owner	خلیل زاده	akhm1991
khanemob	owner	خانه موبایل	atarasa
khnmb	behnam	کیهان	marfanet_vpn
khsresf	behnam	خسروی	marfanet_vpn
khymesf	behnam	خیام	marfanet_vpn
Kia	owner	کیا موبایل	Amirreza1338
kianesf	behnam	کیان	marfanet_vpn
Kmli	owner	کمالی	zahedkamali
korshesf	behnam	کوروش	marfanet_vpn
kpot2205			
Krasys		کارا سیستم	
Kvdmb	owner	کاوند	kphone22
lfsmb	behnam	لایف استور	marfanet_vpn
limb	behnam	لیمو	marfanet_vpn
loutoosmb	owner	لوتوس موبایل	abed_2519
luna	behnam	لونا	marfanet_vpn
Lux	owner	لوکس	9916254067
mahaesf	behnam	مها	marfanet_vpn
mahdimb	owner	مهدی موبایل	mehdi_mnhhhhs
mahdmb	gharari	موبایل مهدی	hamrahgostar1
mahuresf	behnam	ماهور	marfanet_vpn
mahyarmb	owner	مهیار موبایل	Mahdyar40
maplmb	behnam	مستر اپل	marfanet_vpn
marmar	owner	مرمر	
martinmb	owner	مارتین	9365554997
mashreghi	owner	مشرقی	arman_mashreghi
mbentesf	behnam	انتخاب	marfanet_vpn
mbhmesf	behnam	موبایل باران	marfanet_vpn
mbicmesf	behnam	موبیکام	marfanet_vpn
mbjmb	behnam	موبو جوان	marfanet_vpn
mehrcall	owner	مهرکال	omid_khalili
mehrdad	owner	مهرداد	
Mehrdmb	gharari	مهرداد	hamrahgostar1
mehrnmob	owner	مهران	nimadani
mhbdmb	behnam	محمد بدیعی	marfanet_vpn
mhbmb	behnam	محمد بخشایی	marfanet_vpn
mhjmb	behnam	مهاجر	marfanet_vpn
mhmaddbr	owner	محمد دبیری	ronecance
Mhmd2	gharari	محمد ۲	hamrahgostar1
Mhmdimb	owner	محمدی	mohammadi013
mhmrmb	behnam	محمد رضایی	marfanet_vpn
mhmshd	owner	mhmshd	mamadsunny
mhrdmb	behnam	مهرداد	marfanet_vpn
mhrmb	behnam	ماهور	marfanet_vpn
mhtmb	behnam	مهارت همراه	marfanet_vpn
miladatp	owner	میلاد عطاپور	milad_atapour1993
miladbgh	owner	میلاد باقری	imiladbi
mildtmb	owner	میلاد عطاپور	milad_atapour1993
MIMB	parya	ایلیا	paryaaa2001
Mimmb	owner	میم تل	zamani6282
minaiemob	owner	مینایی	milkaeli55
misaghmb	owner	میثاق	misaq_alizadeh
misclesf	behnam	میس کال	marfanet_vpn
mist	Behnam	mist	marfanet_vpn
mjidesf	behnam	مجید	marfanet_vpn
mjtbsabet	owner	مجتبی ثابت	sabet_ss
Mmd	owner	محمد	im_mmad_r
Mmhd	owner	محمد حیدری	
mntzresf	behnam	منتظری	marfanet_vpn
Mobirnmb	owner	موبیران	ir_mobiran
mobogap	owner	موبایل گپ	vahid_sn
mobshahr	owner	موبایل شهر	davood_khodajouy
mobsmb	owner	موبایلستان	9128814737
mobzen	owner	موبایل09	9036018061
mohamadrzmb	gharari	محمدرضا	hamrahgostar1
mohamadshr	owner	محمد شریفی	mohamadhoseinn060
Momb	owner	معینی	moeini3054
Morvarid	owner	مروارید	mobile_morvared
MOSMB	parya	موبایل انلاین استور	paryaaa2001
MPMMB	parya	مرادپور	paryaaa2001
Mrdmb	owner	مرادی	imanmoradi
mrjnbesf	behnam	مستر جانبی	marfanet_vpn
MRLMB	parya	مارال	paryaaa2001
MRMB	parya	رشت	paryaaa2001
mrmobmb	owner	اقای موبایل	mr_mobile1_m
msthmd	owner	ام استور یزد	mohamadduu
mtinesf	behnam	متین	marfanet_vpn
mtkmb	behnam	مای تک	marfanet_vpn
Mxmb	owner	مکس موبایل	Max_Mobile_phone
mzbgf941	behnam		marfanet_vpn
mzbmil945	owner	میلو موبایل	milomarket_ir
mzbnim946	owner	نیما موبایل	Nimahz777
mzbsf940	behnam		marfanet_vpn
mzbsff943	behnam		marfanet_vpn
mzbsfu942	behnam		marfanet_vpn
mzbssf944	behnam		marfanet_vpn
naeinimb	owner	نائینی	ali_naeini
neginesf	behnam	نگین	marfanet_vpn
nimachtg	owner	نیما چیتگر	nimachitgar
ninamc	gharari	سینا	hamrahgostar1
nourbesf	behnam	نورباران	marfanet_vpn
nova	behnam	نوا	marfanet_vpn
novinmob	owner	نوین	Sajjadsaadatt
nsrmb	gharari	نصر	hamrahgostar1
Nvidmb	owner	نوی د موبایل	navid_store_rasht
Nvnark	owner	نوین اراک	novinafzar_arak
Nvnmb	gharari	نوین موبایل	hamrahgostar1
nvnr	owner	نوین 	Silvton
Nyzmb	owner	نیاز روز	+98 911 272 6480
nzmesf	behnam	ناظمی	marfanet_vpn
ocean	behnam	آسمان	marfanet_vpn
omidagt	owner	امید	parsehmb
OMMB	parya	اسطوره	paryaaa2001
onlinmb	owner	انلاین موبایل	9111373827
ordbesf	behnam	ادریبهشت	marfanet_vpn
orgmb	gharari	اورژانس	hamrahgostar1
owndesf	behnam	اوند	marfanet_vpn
ownsesf	behnam	اونس	marfanet_vpn
pacmobi	owner	پکس موبی	mamadvampire
Parsmb	owner	پارس موبایل	farid3gs
Pasdaran	owner	پاسداران	mh_qaedi
Paxmb	owner	‌پکس موبایل	mamadvampire
Phdimb	owner	فون کلیک	9117558981
phmiesf	behnam	پارسا هاشمی	marfanet_vpn
Phono	gharari	فونو	hamrahgostar1
Pishmb	owner	پیشرو	9102414021
pkhmd	owner	پارسین تکنو	hamid4648
Pmbmb			
pmhdesf	behnam	پارسا حدادی	marfanet_vpn
pourmmd	owner	پورمحمد	mpourmohammad
pouyamb	owner	پویا	phone_store30
powrmb	owner	پاور موبایل	pedifazeli
prhmd	owner	پرشیا	9135202034
prnesf	behnam	پارسیان	marfanet_vpn
Promb	owner	موبایل پرومکس	alimohammadb80
prsemsb	behnam	پارسه	marfanet_vpn
prsmb	owner	موبایل پارسا	parsamobile_rasht
prsnhesf	behnam	پارسیان همراه	marfanet_vpn
prxhmd	owner	پاراکس	mohammad_rm75
pryaesf	behnam	پوریا	marfanet_vpn
Pryamb	parya	پریا	paryaaa2001
pshiesf	behnam	پارسا شفیعی	marfanet_vpn
pstdesf	behnam	پرساتل دهقانی	marfanet_vpn
pthmd	owner	پرشین تک	persiantech_mobile
Pymb			
Pytkh	owner	پایتخت	amir0seink
Rasa	owner	رسا زنجان	marfanet_vpn
rashamob	owner	راشا موبایل	yeashenast2
rastgarmb	owner	رستگار	9029326918
Rdinmb	owner	رادین	9025634256
Rdmb	owner	راد موبایل	radmobileshz
rdnesf	behnam	رادین	marfanet_vpn
reisimb	gharari	رئیسی	hamrahgostar1
retesf	behnam	رئیسی تقوی	marfanet_vpn
rezaiesf	behnam	رضایی	marfanet_vpn
Rhmb	gharari	سینا	hamrahgostar1
river	behnam	ریور	marfanet_vpn
RNMB	parya	رهنما	paryaaa2001
Romb	owner	روبل	Impaiman
rsaesf	behnam	رسا اصفهان	marfanet_vpn
Rshmb		روشا	9058793129
rslesf	behnam	راسل	marfanet_vpn
Rsmb	owner	رسا	9374199091
rstmb	owner	رستا	9293266918
ruby	behnam	روبی	marfanet_vpn
ryhmd	owner	رویال	royalemobilee
rylesf	behnam	رویال	marfanet_vpn
sabzianmb	owner	سبزیان مشهدی	hsbebeh
saedgharari	gharari	سعید قراری	hamrahgostar1
saedmaesf	behnam	سعید ملک محمدی	marfanet_vpn
saedsalehi	owner	سعید صالحی	sepehr_1369
saesf	behnam	سعید دهقان	marfanet_vpn
sage	behnam	Sage	marfanet_vpn
sajadhsm	owner	سجاد حسامی	ssajad1365
salesf	behnam	سال	marfanet_vpn
sammob	owner	سام موبایل	nimajeto
sams	owner	موبایل سامسونگ 	saeedkh7122
sbaesf	behnam	صبا	marfanet_vpn
sbmb	gharari	صابری	hamrahgostar1
Sbmd	owner		alimohammadb80
Sbrmb	parya	صابر موبایل	paryaaa2001
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
tkslmni	behnam	تیک سلیمانی	marfanet_vpn
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
      if (parts.length >= 3) { // حداقل 3 ستون باشد
        parsed.push({
          admin_username: parts[0]?.trim(),
          sales_associate: parts[1]?.trim() || 'پیش‌فرض',
          representative_name: parts[2]?.trim() || 'نماینده پیش‌فرض',
          telegram_id: parts[3]?.trim() || ''
        });
      }
    }
    
    return parsed;
  }

  // ✅ SHERLOCK v25.2: اجرای بروزرسانی انبوه با حفاظت کامل
  app.post("/api/bulk-update/representatives", bulkUpdateAuthMiddleware, async (req, res) => {
    try {
      console.log('🚀 SHERLOCK v25.2: شروع بروزرسانی انبوه نمایندگان...');

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
        if (partnerName && partnerName !== 'پیش‌فرض' && !existingNames.includes(partnerName)) {
          try {
            await db.insert(salesPartners).values({
              name: partnerName,
              commission: 3, // 3 درصد پیش‌فرض
              contactInfo: 'تکمیل بعدی',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            results.salesPartnersCreated++;
            console.log(`✅ همکار فروش جدید ایجاد شد: ${partnerName}`);
          } catch (error) {
            console.error(`❌ خطا در ایجاد همکار فروش ${partnerName}:`, error);
            results.errors.push({
              type: 'sales_partner_creation',
              item: partnerName,
              error: error.message
            });
          }
        }
      }

      // بروزرسانی لیست همکاران فروش
      const refreshedSalesPartners = await db.select().from(salesPartners);
      const salesPartnerMap = new Map(refreshedSalesPartners.map(sp => [sp.name, sp.id]));

      // مرحله 2: بروزرسانی نمایندگان
      for (const update of updatesData) {
        try {
          results.processed++;

          // پیدا کردن نماینده بر اساس admin_username (code یا panelUsername)
          const existingRep = await db.select()
            .from(representatives)
            .where(
              or(
                eq(representatives.code, update.admin_username),
                eq(representatives.panelUsername, update.admin_username)
              )
            )
            .limit(1);

          if (existingRep.length === 0) {
            // نماینده یافت نشد - رد می‌شود
            results.details.push({
              admin_username: update.admin_username,
              status: 'not_found',
              message: 'نماینده یافت نشد'
            });
            continue;
          }

          results.matched++;

          const rep = existingRep[0];
          const finalName = update.representative_name || 'نماینده پیش‌فرض';
          const finalTelegramId = update.telegram_id ? `@${update.telegram_id}` : '@پیش_فرض';
          const salesPartnerId = salesPartnerMap.get(update.sales_associate) || 1; // پیش‌فرض ID: 1

          // بروزرسانی اطلاعات نماینده
          await db.update(representatives)
            .set({
              name: finalName,
              ownerName: finalName, // استفاده مشترک
              telegramId: finalTelegramId,
              salesPartnerId: salesPartnerId,
              updatedAt: new Date()
            })
            .where(eq(representatives.id, rep.id));

          results.updated++;
          results.details.push({
            admin_username: update.admin_username,
            status: 'updated',
            message: `بروزرسانی شد - نام: ${finalName}, تلگرام: ${finalTelegramId}, همکار: ${update.sales_associate}`,
            changes: {
              name: finalName,
              ownerName: finalName,
              telegramId: finalTelegramId,
              salesPartner: update.sales_associate
            }
          });

          console.log(`✅ نماینده ${update.admin_username} بروزرسانی شد`);

        } catch (error) {
          console.error(`❌ خطا در بروزرسانی ${update.admin_username}:`, error);
          results.errors.push({
            type: 'representative_update',
            item: update.admin_username,
            error: error.message
          });
        }
      }

      console.log(`🎉 بروزرسانی کامل شد:
      - کل پردازش شده: ${results.processed}
      - تطبیق یافته: ${results.matched}
      - بروزرسانی شده: ${results.updated}
      - همکاران فروش جدید: ${results.salesPartnersCreated}
      - خطاها: ${results.errors.length}`);

      res.json({
        success: true,
        message: 'بروزرسانی انبوه نمایندگان با موفقیت انجام شد',
        statistics: {
          processed: results.processed,
          matched: results.matched,
          updated: results.updated,
          salesPartnersCreated: results.salesPartnersCreated,
          errors: results.errors.length
        },
        details: results.details,
        errors: results.errors,
        timestamp: new Date().toISOString(),
        integritySafeguard: '✅ کوپلینگ‌ها و ساختار اتوماسیون محفوظ ماندند'
      });

    } catch (error) {
      console.error('❌ خطای کلی در بروزرسانی انبوه:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در فرایند بروزرسانی انبوه',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // مسیر تست برای بررسی اطلاعات قبل از اعمال
  app.get("/api/bulk-update/preview", bulkUpdateAuthMiddleware, async (req, res) => {
    try {
      const updatesData = parseRepresentativesData(representativesData);
      
      const preview = {
        totalRecords: updatesData.length,
        uniqueSalesPartners: [...new Set(updatesData.map(u => u.sales_associate))],
        sampleUpdates: updatesData.slice(0, 10), // نمونه 10 رکورد اول
        statistics: {
          withTelegramId: updatesData.filter(u => u.telegram_id).length,
          withoutTelegramId: updatesData.filter(u => !u.telegram_id).length,
          uniquePartners: [...new Set(updatesData.map(u => u.sales_associate))].length
        }
      };

      res.json({
        success: true,
        preview,
        message: 'پیش‌نمایش داده‌های بروزرسانی'
      });
    } catch (error) {
      console.error('خطا در پیش‌نمایش:', error);
      res.status(500).json({
        success: false,
        error: 'خطا در تولید پیش‌نمایش',
        details: error.message
      });
    }
  });
}

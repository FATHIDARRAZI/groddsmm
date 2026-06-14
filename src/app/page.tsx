import Image from 'next/image';
import HomeClientForm from '@/components/HomeClientForm';
import HomeClientAds, { HomeTopAd, HomeNativeAd, HomeMiddleAd } from '@/components/HomeClientAds';

export default function Home() {
  return (
    <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-12 pb-24 w-full">
      <HomeTopAd />

      <div className="text-center mb-10 w-full z-10 relative">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-relaxed">ابدأ إطلاق</h1>
        <h1 className="text-4xl md:text-6xl font-black luminary-gradient-text mb-6 leading-relaxed">حملتك التسويقية المجانية</h1>
        <p className="text-[#A3A3A3] text-sm md:text-lg max-w-md mx-auto leading-loose">أدخل رابط المحتوى الخاص بك (Content Link) لرفع معدل التفاعل والوصول لحسابك فوراً.</p>
      </div>

      <HomeClientForm />

      <HomeClientAds />

      {/* Sleek Horizontal Features Row */}
      <div className="flex flex-wrap w-full justify-center mt-8 gap-4 sm:gap-6 md:gap-12 mb-16 relative z-10 px-4">
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-bolt text-slate-600"></i>
          <span>تحسين وتوجيه فوري</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-shield-alt text-slate-600"></i>
          <span>أمان وموثوقية قوية</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-chart-line text-slate-600"></i>
          <span>دعم ورؤى مستمرة</span>
        </div>
      </div>

      <HomeNativeAd />

      <HomeMiddleAd />

      {/* About Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 px-4 md:px-0 text-right dir-rtl">
        <h2 className="text-3xl md:text-3xl font-extrabold text-white mb-6">
          ما هي وكالة Grodd Media للتسويق الرقمي؟
        </h2>
        <div className="text-slate-300 space-y-4 leading-relaxed mb-12">
          <p className="text-lg font-medium text-white border-r-4 border-pink-500 pr-4">
            وكالة Grodd Media هي منصة تسويق رقمي B2B متخصصة في تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية على منصات مثل إنستجرام، باستخدام أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال.
          </p>
          <p>
            تتيح لك منصتنا تجربة حملات التسويق الرقمي الترويجية مجاناً لرفع كفاءة الخوارزميات وزيادة الموثوقية لحسابك من خلال تسريع الانتشار (Viral Reach) والوصول للجمهور الصحيح. في <strong>Grodd Media</strong>، تأتي خصوصيتك وأمان بياناتك في صدارة أولوياتنا وتتوافق تماماً مع سياسات الاستخدام العادل.
          </p>
          <div className="text-xs text-slate-500 mt-4 font-bold tracking-wider">
            <i className="fas fa-clock ml-2"></i>آخر تحديث: أبريل 2026 | <i className="fas fa-user-shield ml-2 mr-4"></i>بواسطة: فريق خبراء Grodd Labs
          </div>
        </div>
        
        <div className="flex justify-center mt-12 w-full">
          <Image 
            src="/img/grodd-mockup.png" 
            alt="Grodd SMM Mockup" 
            width={800}
            height={500}
            priority={true}
            className="w-full max-w-2xl h-auto object-contain drop-shadow-[0_20px_50px_rgba(236,72,153,0.15)]" 
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">كيف تعمل حملات الترويج العضوي في Grodd Media؟</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium border-t border-b border-white/10 py-4 mt-4 shadow-inner bg-[#121827]/50 rounded-xl">
            تعمل حملاتنا عبر ثلاث خطوات أساسية: تحديد مسار المحتوى العام، إعداد الخطة الإعلانية لزيادة التفاعل، ثم توجيه الزوار الحقيقيين لتحسين نتائج الخوارزميات بشكل آمن.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-0">
          <div className="absolute right-8 md:inset-x-0 md:mx-auto md:w-1 top-0 bottom-0 bg-gradient-to-b from-pink-500/50 via-purple-500/50 to-green-500/50 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-24 w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-pink-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-pink-500 text-pink-400 font-black text-sm shadow-[0_0_15px_rgba(236,72,153,0.4)]">1</span>
                  تحديد مسار المحتوى
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">انتقل إلى منصة إنستغرام لنسخ مسار/رابط المحتوى العام الذي تود إدراجه كوجهة رئيسية للحملة الإعلانية والتسويقية لنظامنا، سواء كان منشور أو ريلز.</p>
              </div>
            </div>
            
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-pink-500 items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.6)] z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">1</span>
            </div>
            
            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-8 md:mb-0">
              <div className="relative w-full max-w-[500px]">
                <div className="absolute -inset-2 bg-gradient-to-tr from-pink-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <Image src="/img/choose_service.png" alt="الخطوة الأولى" width={600} height={400} priority={true} className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-24 w-full group">
            <div className="order-1 md:order-1 w-full md:w-5/12 flex justify-center md:justify-start pr-16 md:pr-0 mb-8 md:mb-0">
              <div className="relative w-full max-w-[500px]">
                <div className="absolute -inset-2 bg-gradient-to-tl from-purple-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <Image src="/img/1-2-3-gooo.png" alt="الخطوة الثانية" width={600} height={400} loading="lazy" className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-purple-500 items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)] z-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">2</span>
            </div>

            <div className="order-2 md:order-2 w-full md:w-5/12 pr-16 md:pl-12 text-right dir-rtl">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-purple-500 text-purple-400 font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">2</span>
                  إدراج وإعداد الحملة
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">الصق الرابط في لوحة تحكم Grodd Media، حدد الخطة الإعلانية المناسبة (<strong className="text-white">تفاعل وتسويق أو وصول وانتشار</strong>)، ثم وافق على إطلاق حملتك.</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
               <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-green-500 text-green-400 font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]">3</span>
                  متابعة النتائج والتقارير
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">تابع التقدم الملحوظ لمحتواك <strong className="text-white">بشكل مباشر</strong> عندما نوجّه الجماهير إليك. استخدم فترة التقييم المدرجة لتخطيط أداء حملتك السابقة والبدء مجدداً!</p>
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-green-500 items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">3</span>
            </div>

            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-8 md:mb-0">
               <div className="relative w-full max-w-[500px]">
                 <div className="absolute -inset-2 bg-gradient-to-tr from-green-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                 <div className="relative w-full h-[250px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden backdrop-blur-md transform group-hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
                    <i className="fas fa-rocket text-7xl text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)] group-hover:-translate-y-4 group-hover:translate-x-4 transition-transform duration-500"></i>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "ما هي وكالة Grodd Media للتسويق الرقمي؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "وكالة Grodd Media هي منصة تسويق رقمي B2B متخصصة في تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية على منصات مثل إنستجرام، باستخدام أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال."
                }
              },
              {
                "@type": "Question",
                "name": "كيف تعمل حملات الترويج العضوي في Grodd Media؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "تعمل حملاتنا عبر ثلاث خطوات أساسية: تحديد مسار المحتوى العام، إعداد الخطة الإعلانية لزيادة التفاعل، ثم توجيه الزوار الحقيقيين لتحسين نتائج الخوارزميات بشكل آمن."
                }
              }
            ]
          })
        }}
      />
    </main>
  );
}

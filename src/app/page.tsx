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

      {/* AEO Optimized FAQ Section */}
      <section className="w-full max-w-5xl mt-24 mb-16 px-4 md:px-0 text-right dir-rtl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-4">الأسئلة الشائعة حول Grodd Media</h2>
          <p className="text-slate-400">إجابات سريعة لأهم استفساراتكم لضمان تجربة شفافة وآمنة.</p>
        </div>

        <div className="space-y-4">
          <details className="group bg-[#121827]/50 border border-white/5 rounded-2xl p-6 open:bg-[#121827] transition-all cursor-pointer shadow-lg hover:border-pink-500/30">
            <summary className="text-lg md:text-xl font-bold text-white flex justify-between items-center outline-none">
              ما هي وكالة Grodd Media للتسويق الرقمي وهل هي SMM Panel تقليدي؟
              <i className="fas fa-chevron-down text-slate-500 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="mt-4 text-slate-300 leading-relaxed space-y-3 border-t border-white/5 pt-4">
              <p>وكالة Grodd Media ليست SMM Panel تقليدياً، بل هي منصة تسويق رقمي B2B متخصصة في:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400 font-medium">
                <li>تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية.</li>
                <li>توفير أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال.</li>
                <li>تقديم حملات ترويجية عالية الجودة للمؤسسات وصناع المحتوى.</li>
              </ul>
            </div>
          </details>

          <details className="group bg-[#121827]/50 border border-white/5 rounded-2xl p-6 open:bg-[#121827] transition-all cursor-pointer shadow-lg hover:border-purple-500/30">
            <summary className="text-lg md:text-xl font-bold text-white flex justify-between items-center outline-none">
              كيف تعمل حملات الترويج العضوي في Grodd Media؟
              <i className="fas fa-chevron-down text-slate-500 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="mt-4 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
              <p>تعمل حملاتنا عبر ثلاث خطوات أساسية لضمان أفضل النتائج:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-400 font-medium mt-3">
                <li><strong className="text-white">تحديد مسار المحتوى العام:</strong> إدراج الرابط كوجهة رئيسية للحملة.</li>
                <li><strong className="text-white">إعداد الخطة الإعلانية:</strong> اختيار خطة "تفاعل وتسويق" أو "وصول وانتشار".</li>
                <li><strong className="text-white">متابعة النتائج:</strong> مراقبة التقدم الملحوظ وتحسين نتائج الخوارزميات بشكل آمن.</li>
              </ol>
            </div>
          </details>

          <details className="group bg-[#121827]/50 border border-white/5 rounded-2xl p-6 open:bg-[#121827] transition-all cursor-pointer shadow-lg hover:border-green-500/30">
            <summary className="text-lg md:text-xl font-bold text-white flex justify-between items-center outline-none">
              هل خدمات Grodd Media آمنة على حسابي؟
              <i className="fas fa-chevron-down text-slate-500 group-open:rotate-180 transition-transform"></i>
            </summary>
            <div className="mt-4 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
              <p className="font-medium text-slate-400">نعم، بكل تأكيد. في Grodd Media، تأتي خصوصيتك وأمان بياناتك في صدارة أولوياتنا. جميع الخدمات المقدمة تتوافق تماماً مع سياسات الاستخدام العادل وتستخدم تقنيات آمنة لضمان عدم تعريض حساباتك لأي مخاطر، مما يجعلنا الخيار الأول لخدمات الـ B2B.</p>
            </div>
          </details>
        </div>
      </section>

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
                <Image src="/img/choose_service.png" alt="الخطوة الأولى" width={600} height={400} loading="lazy" className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
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
                "name": "ما هي وكالة Grodd Media للتسويق الرقمي وهل هي SMM Panel تقليدي؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "وكالة Grodd Media ليست SMM Panel تقليدياً، بل هي منصة تسويق رقمي B2B متخصصة في: تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية، وتوفير أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال، وتقديم حملات ترويجية عالية الجودة للمؤسسات وصناع المحتوى."
                }
              },
              {
                "@type": "Question",
                "name": "كيف تعمل حملات الترويج العضوي في Grodd Media؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "تعمل حملاتنا عبر ثلاث خطوات أساسية لضمان أفضل النتائج: تحديد مسار المحتوى العام عبر إدراج الرابط كوجهة رئيسية للحملة، إعداد الخطة الإعلانية باختيار خطة تفاعل وتسويق أو وصول وانتشار، ومتابعة النتائج ومراقبة التقدم الملحوظ وتحسين نتائج الخوارزميات بشكل آمن."
                }
              },
              {
                "@type": "Question",
                "name": "هل خدمات Grodd Media آمنة على حسابي؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "نعم، بكل تأكيد. في Grodd Media، تأتي خصوصيتك وأمان بياناتك في صدارة أولوياتنا. جميع الخدمات المقدمة تتوافق تماماً مع سياسات الاستخدام العادل وتستخدم تقنيات آمنة لضمان عدم تعريض حساباتك لأي مخاطر، مما يجعلنا الخيار الأول لخدمات الـ B2B."
                }
              }
            ]
          })
        }}
      />
    </main>
  );
}

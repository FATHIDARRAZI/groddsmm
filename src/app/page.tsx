import Image from 'next/image';
import Link from 'next/link';
import HomeClientForm from '@/components/HomeClientForm';
import AffiliateCard from '@/components/AffiliateCard';
import FreePromotionGrid from '@/components/FreePromotionGrid';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FeaturesGrid from '@/components/FeaturesGrid';
import HomeClientAds, { HomeTopAd, HomeNativeAd, HomeMiddleAd } from '@/components/HomeClientAds';

export default function Home() {
  return (
    <main className="relative z-20 flex-grow flex flex-col items-center justify-center pb-24 w-full bg-[#0B0B0F] overflow-hidden" dir="rtl">
      
      {/* Hero Section */}
      <section className="w-full relative flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 pt-24 pb-16 lg:py-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="lg:w-1/2 flex flex-col items-start text-right z-10 space-y-6">
          <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-l from-purple-400 via-pink-500 to-orange-500 leading-tight tracking-tight drop-shadow-lg pb-2">
            Grodd Media
          </h1>
          <h2 className="text-3xl lg:text-5xl font-bold text-white leading-snug drop-shadow-md">
            أسرع طريقة لتكبير حساباتك على السوشيال ميديا
          </h2>
          <p className="text-lg lg:text-xl text-gray-300 font-medium max-w-lg leading-relaxed">
            احصل على متابعين، إعجابات، ومشاهدات حقيقية في ثوانٍ. نقدم لك خدمات ترويج آمنة وموثوقة لتحقيق أهدافك الرقمية بسهولة وفعالية.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-l from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_35px_rgba(236,72,153,0.6)]">
              ابدأ الترويج مجاناً
            </Link>
            <Link href="#services" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/20">
              اكتشف خدماتنا
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 mt-16 lg:mt-0 relative z-10 flex justify-center">
          <div className="relative w-full max-w-lg aspect-square animate-float-slow">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-[40px] blur-3xl"></div>
            <Image 
              src="/images/hero_3d_social.jpg" 
              alt="Social Media Growth" 
              fill
              className="object-cover rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10"
              priority
            />
          </div>
        </div>
      </section>

      {/* Ads Top */}
      <div className="w-full px-4 flex justify-center mt-4">
        <HomeTopAd />
      </div>

      {/* Main Order Form (Now acts as "Services") */}
      <div id="services" className="w-full mt-16 relative z-10">
        <div className="text-center mb-10 px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md">جرب خدماتنا <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 to-pink-500">الآن</span></h2>
          <p className="text-gray-400 text-lg">اختر المنصة والخدمة للبدء فوراً وبدون تعقيدات</p>
        </div>
        <HomeClientForm />
      </div>

      <div className="w-full mt-12 px-4 flex justify-center">
        <HomeClientAds />
      </div>

      {/* Feature Section 1 */}
      <section className="w-full relative flex flex-col lg:flex-row-reverse items-center justify-between px-6 lg:px-20 py-24 overflow-hidden">
        <div className="lg:w-1/2 flex flex-col items-start text-right z-10 space-y-6 lg:mr-12">
          <h2 className="text-3xl lg:text-5xl font-black text-white leading-snug drop-shadow-md">
            تفاعل حقيقي، <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-400 to-orange-400">نمو سريع</span>
          </h2>
          <p className="text-lg text-gray-300 font-medium max-w-lg leading-relaxed">
            منصتنا مصممة لتقديم نتائج فورية. سواء كنت تبحث عن زيادة تفاعل منشوراتك أو رفع عدد متابعيك، نحن هنا لنجعل ذلك حقيقة بنقرة واحدة.
          </p>
          <ul className="space-y-4 mt-6 text-gray-200 font-semibold text-lg">
            <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400">✓</span> تنفيذ فوري وآلي للطلبات</li>
            <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 text-pink-400">✓</span> أمان تام لحساباتك (لا نطلب الباسورد)</li>
            <li className="flex items-center gap-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400">✓</span> دعم فني متواجد دائماً لخدمتك</li>
          </ul>
        </div>
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative z-10 flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[30px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
            <Image 
              src="/images/phone_growth_hand.jpg" 
              alt="Fast Growth" 
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/20 to-transparent opacity-90"></div>
            <div className="absolute bottom-8 left-8 right-8 text-center">
              <div className="text-3xl font-black text-white drop-shadow-lg mb-2">+50,000</div>
              <div className="text-gray-300 font-medium">متابع جديد يومياً لعملائنا</div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Promotion */}
      <div className="w-full px-4 lg:px-20 mt-8">
        <FreePromotionGrid />
      </div>

      {/* Affiliate */}
      <div className="w-full px-4 lg:px-20 mt-16">
        <AffiliateCard />
      </div>

      <div className="w-full px-4 my-16 flex justify-center">
        <HomeNativeAd />
      </div>

      {/* Feature Section 2 */}
      <section className="w-full relative flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-24 bg-white/[0.02] border-y border-white/5">
        <div className="lg:w-1/2 flex flex-col items-start text-right z-10 space-y-6">
          <h2 className="text-3xl lg:text-5xl font-black text-white leading-snug drop-shadow-md">
            كيف <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-yellow-500">نعمل؟</span>
          </h2>
          <p className="text-lg text-gray-300 font-medium max-w-lg leading-relaxed">
            نستخدم أحدث تقنيات الذكاء الاصطناعي والأتمتة لتوجيه التفاعل الحقيقي لحساباتك بأعلى جودة ممكنة في السوق. دعنا نقوم بالسحر!
          </p>
          <div className="flex gap-4 mt-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center flex-1 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="text-3xl font-black text-purple-400 mb-2">100K+</div>
              <div className="text-base text-gray-300 font-medium">مستخدم نشط</div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center flex-1 shadow-lg backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="text-3xl font-black text-pink-400 mb-2">2M+</div>
              <div className="text-base text-gray-300 font-medium">طلب مكتمل</div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative z-10 flex justify-center">
          <div className="relative w-full max-w-lg aspect-video rounded-[30px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
            <Image 
              src="/images/how_it_works_person.jpg" 
              alt="How it works" 
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      <div className="w-full px-4 my-16 flex justify-center">
        <HomeMiddleAd />
      </div>

      <div className="w-full mt-8">
        <TestimonialsCarousel />
      </div>

      <div className="w-full mt-24">
        <FeaturesGrid />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Grodd Media - الترويج المجاني لوسائل التواصل الاجتماعي",
            "description": "احصل على متابعين، إعجابات، ومشاهدات مجانية. خدمة ترويج آمنة وموثوقة."
          })
        }}
      />
    </main>
  );
}

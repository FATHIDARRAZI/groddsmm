import Image from 'next/image';
import HomeClientForm from '@/components/HomeClientForm';
import { HomeTopAd } from '@/components/HomeClientAds';

export default function HeroSection() {
  return (
    <section className="relative w-full pt-16 pb-20 overflow-hidden bg-[#0B0B0F] z-10" dir="rtl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E11D48]/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Ad Space */}
        <div className="w-full flex justify-center mb-12">
          <HomeTopAd />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Right Column (Text & Form) */}
          <div className="flex flex-col gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] text-sm font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E11D48] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E11D48]"></span>
                </span>
                لوحة Grodd Media لجميع خدمات السوشيال ميديا
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2] mb-6">
                ارفع مستوى حساباتك مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] to-pink-500">Grodd Media</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                نقدم لك أفضل خدمات التسويق عبر وسائل التواصل الاجتماعي بأسعار لا تقبل المنافسة وجودة عالية. ابدأ مجاناً الآن!
              </p>
            </div>

            {/* The Restyled Free Form */}
            <div className="relative z-20">
              <HomeClientForm />
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex -space-x-3 -space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0F] bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#FFD700] text-sm">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <span className="text-slate-300 text-sm font-medium">+10,000 عميل يثق بنا</span>
              </div>
            </div>
          </div>

          {/* Left Column (3D Image) */}
          <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex justify-center items-center">
            {/* Pulsing ring behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E11D48]/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative w-full max-w-md aspect-square rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-[#E11D48]/20 group">
              <Image 
                src="/images/landing/hero_3d_social.jpg" 
                alt="Grodd Media Social Services" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent opacity-60"></div>
            </div>
            
            {/* Floating UI Elements */}
            <div className="absolute top-10 right-10 bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <i className="fas fa-bolt text-green-500"></i>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">تنفيذ فوري</div>
                  <div className="text-slate-400 text-xs">يبدأ في 1 ثانية</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 left-4 bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-float-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E11D48]/20 flex items-center justify-center">
                  <i className="fas fa-heart text-[#E11D48]"></i>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">+50K إعجاب</div>
                  <div className="text-slate-400 text-xs">جودة عالية</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

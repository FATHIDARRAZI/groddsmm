import Image from 'next/image';
import Link from 'next/link';

export default function GrowthResults() {
  const tags = [
    'متابعين انستقرام', 'إعجابات تيك توك', 'مشاهدات يوتيوب', 'تفاعل تويتر', 
    'أعضاء تيليجرام', 'مشتركين يوتيوب', 'تعليقات انستقرام', 'مشاركات فيسبوك', 
    'ريلز انستقرام', 'بث مباشر تيك توك', 'تويتش', 'سناب شات'
  ];

  return (
    <section className="w-full py-24 bg-[#0B0B0F]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Box (Dark with Tags) */}
          <div className="bg-[#1C1C1E] border border-white/5 rounded-[40px] p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                نتائج مثبتة مع <span className="text-[#E11D48]">Grodd</span>
              </h2>
              <p className="text-slate-400 mb-10 leading-relaxed max-w-md">
                آلاف العملاء يعتمدون علينا يومياً لتنمية حساباتهم. نحن نوفر جميع الخدمات التي تحتاجها للنجاح في عالم السوشيال ميديا.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-10">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-[#0B0B0F] border border-white/10 rounded-full text-slate-300 text-sm font-medium hover:border-[#E11D48]/50 hover:text-white transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <Link href="/services" className="w-full py-4 rounded-xl font-bold bg-[#E11D48] hover:bg-[#BE123C] text-white text-center transition-all">
              تصفح جميع خدماتنا
            </Link>
          </div>

          {/* Right Box (Image Box) */}
          <div className="relative bg-gradient-to-br from-[#E11D48]/10 to-purple-900/10 border border-[#E11D48]/20 rounded-[40px] p-10 overflow-hidden min-h-[500px] flex flex-col justify-between group">
            
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white">
                شاهد نمو مستخدمينا
              </h2>
            </div>

            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm aspect-[3/4] transition-transform duration-700 group-hover:-translate-y-4">
              <div className="relative w-full h-full drop-shadow-2xl">
                <Image 
                  src="/images/landing/phone_growth_hand.jpg"
                  alt="Growth with Grodd"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Floating popups for realism */}
            <div className="absolute top-1/4 right-8 bg-[#1C1C1E] border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-xl animate-float-delayed z-20">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <i className="fas fa-arrow-up text-green-500 text-sm"></i>
              </div>
              <span className="text-white font-bold text-sm">+25k Followers</span>
            </div>
            
            <div className="absolute top-1/3 left-4 bg-[#1C1C1E] border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-xl animate-float z-20">
              <div className="w-8 h-8 rounded-full bg-[#E11D48]/20 flex items-center justify-center">
                <i className="fas fa-heart text-[#E11D48] text-sm"></i>
              </div>
              <span className="text-white font-bold text-sm">100k Likes</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

'use client';
import React, { useRef } from 'react';

const testimonials = [
  {
    rating: 5,
    title: 'زيادة حجوزات المطعم',
    text: 'أدير التسويق لمطعم. طلبنا متابعين انستقرام وحفظ للمنشورات بانتظام لمدة أربعة أشهر، بالإضافة لتعليقات تحت منشورات قائمة الطعام مكتوبة حسب طلبنا - يذكرون الأطباق بالاسم. زيارات الملف الشخصي من الخرائط والتاغات تحولت إلى حجوزات: أصبحنا الآن محجوزين بالكامل يومي الجمعة والسبت قبل أسبوع. المالك يعتقد أنني عبقري، ولن أصحح له ذلك.',
    name: 'Ava',
    countryCode: 'us',
    verified: true,
  },
  {
    rating: 5,
    title: 'تعمل حقاً',
    text: 'كنت متشككة بعد تجربتي السيئة مع منصتين أخريين. طلبت 1000 متابع انستقرام هنا كاختبار - وصلوا خلال ساعة، والأهم من ذلك أنهم ما زالوا موجودين بعد ثلاثة أشهر. نقلت جميع طلباتي إلى Grodd.',
    name: 'Emma',
    countryCode: 'us',
    verified: true,
  },
  {
    rating: 5,
    title: 'نمو حساب تويتر لشركتنا الناشئة',
    text: 'مشروعنا للعملات المشفرة كان يحتاج إلى حساب نشط على منصة X قبل إطلاق الرمز (Token) - المستثمرون يتحققون من أعداد المتابعين قبل قراءة الورقة البيضاء. أخذنا متابعين وإعجابات وإعادات نشر على دفعات خلال ستة أسابيع. الحساب صعد من 300 إلى 15,000، التفاعل يبدو عضوياً، ولم يسأل أحد أي أسئلة. صندوقان استثماريان ذكروا "مجتمعكم القوي".',
    name: 'Noah',
    countryCode: 'us',
    verified: true,
  },
  {
    rating: 5,
    title: 'أنقذت إطلاق منتجي',
    text: 'حساب متجرنا كان يبدو ميتاً قبل أسبوع من الإطلاق. بعد باقة من المتابعين والإعجابات والتعليقات، بدا الحساب حيوياً أخيراً - وبدأ أشخاص حقيقيون بمتابعتنا بأنفسهم. معدل التحويل من زيارات الملف الشخصي تضاعف تقريباً.',
    name: 'Marcus',
    countryCode: 'us',
    verified: true,
  },
  {
    rating: 5,
    title: 'مخبز صغير، فرق كبير',
    text: 'ندير مخبزاً عائلياً وكانت صفحتنا على فيسبوك غير مرئية - 90 متابعاً في ثلاث سنوات. اشتريت متابعين وإعجابات للمنشورات وبعض التعليقات قبل موسم الأعياد. بدأ السكان المحليون يلاحظوننا أخيراً: يكتب الناس الآن أنهم وجدونا على فيسبوك، والطلبات المسبقة في عطلة نهاية الأسبوع تضاعفت. بالنسبة لشركة صغيرة هذا أرخص إعلان جربته.',
    name: 'Grace',
    countryCode: 'us',
    verified: true,
  },
  {
    rating: 5,
    title: 'دفعة لوقت مشاهدة يوتيوب',
    text: 'اشتريت مشاهدات وإعجابات لقناة عالقة عند 300 مشترك. بدأت الفيديوهات تظهر في الاقتراحات وتخطت القناة 4000 ساعة مشاهدة لتحقيق الدخل في ستة أسابيع. كان سيستغرقني ذلك عاماً كاملاً بمفردي.',
    name: 'Chloe',
    countryCode: 'us',
    verified: true,
  },
];

export default function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      
      let scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      
      // Auto-looping logic
      if (direction === 'left' && Math.abs(scrollLeft) >= scrollWidth - clientWidth - 10) {
         scrollTo = 0; // Back to start (RTL)
      } else if (direction === 'left' && scrollLeft <= 0 && document.dir !== 'rtl') {
          // LTR back to start
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
              scrollTo = 0;
          }
      }

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      scroll('left'); // In RTL, scrolling left usually advances the items
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full max-w-full mx-auto mt-20 mb-16 overflow-hidden bg-[#11131a] py-16" dir="rtl">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
          ماذا يقول عملاؤنا
        </h2>
      </div>

      <div className="relative group max-w-[1400px] mx-auto px-4">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center z-20 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center z-20 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
        >
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx}
              className="min-w-[280px] md:min-w-[320px] max-w-[320px] flex-shrink-0 bg-[#1c212d] rounded-xl p-6 flex flex-col justify-between border border-white/5 snap-center"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-1 text-yellow-400 text-sm">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <i className="fas fa-quote-right text-[#E11D48] text-xl opacity-80"></i>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{testimonial.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {testimonial.text}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {/* Mocking the flag with an emoji for simplicity, in a real app use flag icons */}
                  <span className="text-lg leading-none">🇺🇸</span>
                  <span className="text-white font-bold text-sm">{testimonial.name}</span>
                </div>
                {testimonial.verified && (
                  <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                    <i className="fas fa-check"></i>
                    مشتري معتمد
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

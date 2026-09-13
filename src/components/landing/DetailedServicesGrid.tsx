import React from 'react';

export default function DetailedServicesGrid() {
  const services = [
    {
      id: 1,
      name: 'تيليجرام',
      icon: 'fab fa-telegram',
      desc: 'احصل على أعضاء ومتابعين ومشاهدات لمنشوراتك على تيليجرام لزيادة التفاعل والثقة.',
      color: 'text-blue-500',
      bg: 'bg-[#151922]',
      border: 'hover:border-blue-500/50'
    },
    {
      id: 2,
      name: 'تيك توك',
      icon: 'fab fa-tiktok',
      desc: 'ارفع مستوى حسابك على تيك توك مع متابعين، إعجابات، ومشاهدات بجودة عالية وسرعة فائقة.',
      color: 'text-white',
      bg: 'bg-[#151922]',
      border: 'hover:border-white/50'
    },
    {
      id: 3,
      name: 'انستقرام',
      icon: 'fab fa-instagram',
      desc: 'خدمات متكاملة لانستقرام تشمل المتابعين، الإعجابات، والمشاهدات لدعم نمو حسابك.',
      color: 'text-pink-500',
      bg: 'bg-[#151922]',
      border: 'hover:border-pink-500/50'
    },
    {
      id: 4,
      name: 'سناب شات',
      icon: 'fab fa-snapchat-ghost',
      desc: 'زيادة المتابعين والمشاهدات على منصة سناب شات للوصول إلى جمهور أوسع بسرعة.',
      color: 'text-yellow-400',
      bg: 'bg-[#151922]',
      border: 'hover:border-yellow-400/50'
    },
    {
      id: 5,
      name: 'تويتر (X)',
      icon: 'fab fa-twitter',
      desc: 'احصل على تفاعل حقيقي على منصة إكس من خلال خدماتنا الموثوقة والسريعة.',
      color: 'text-blue-400',
      bg: 'bg-[#151922]',
      border: 'hover:border-blue-400/50'
    }
  ];

  return (
    <section className="w-full py-24 bg-[#0B0B0F] relative overflow-hidden" dir="rtl">
      
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E11D48]/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-sm font-bold mb-4">
            الخدمات الشائعة
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">خدمات <span className="text-[#E11D48]">Grodd Media</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            نقدم مجموعة واسعة من الخدمات لتلبية احتياجاتك التسويقية على جميع المنصات.
          </p>
        </div>

        {/* Horizontal scrollable grid on mobile, standard grid on desktop */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 pb-8 snap-x snap-mandatory hide-scrollbar">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`min-w-[280px] lg:min-w-0 bg-[#1C1C1E] p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center transition-all duration-300 snap-center shrink-0 ${service.border} hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div className={`w-16 h-16 rounded-full bg-[#0B0B0F] border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-inner ${service.color}`}>
                <i className={service.icon}></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{service.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                {service.desc}
              </p>
              <button className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-[#E11D48] text-white text-sm font-bold transition-colors w-full border border-white/10 hover:border-[#E11D48]">
                اكتشف المزيد
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

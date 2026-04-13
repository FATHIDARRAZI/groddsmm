'use client';

import React from 'react';

export default function StorePage() {
  const packages = [
    { points: 1000, price: '$5', name: 'الباقة المبتدئة', highlight: false, icon: 'fa-star', likes: '40K', views: '3M' },
    { points: 5000, price: '$20', name: 'باقة المحترفين', highlight: true, icon: 'fa-fire', likes: '150K', views: '15M' },
    { points: 15000, price: '$50', name: 'باقة الوكالات', highlight: false, icon: 'fa-bolt', likes: '450K', views: '40M' },
  ];

  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">شراء النقاط (المتجر) 💳</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            لا ترغب في تخطي الروابط؟ يمكنك شراء حزم النقاط مباشرة وبأسعار مخفضة لاستخدامها في إطلاق الحملات فوراً.
          </p>
        </div>
        <div className="w-12 h-12 bg-[#FF8577]/10 rounded-xl flex items-center justify-center border border-[#FF8577]/20">
           <i className="fas fa-shopping-cart text-[#FF8577] text-xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`relative bg-[#1C1C1E] border ${pkg.highlight ? 'border-[#FF8577]' : 'border-white/5'} rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden transition-transform hover:scale-[1.02]`}>
             {pkg.highlight && (
               <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-white text-[10px] font-bold py-1 tracking-widest">
                 الأكثر مبيعاً
               </div>
             )}
             {pkg.highlight && <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF8577]/20 blur-[50px] rounded-full pointer-events-none"></div>}
             
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${pkg.highlight ? 'bg-[#FF8577]/10 text-[#FF8577]' : 'bg-white/5 text-slate-400'}`}>
               <i className={`fas ${pkg.icon} text-2xl`}></i>
             </div>
             
             <h3 className="text-sm font-bold text-slate-400 mb-2">{pkg.name}</h3>
             <div className="text-3xl font-black text-white mb-1">{pkg.points.toLocaleString()} <span className="text-sm">نقطة</span></div>
             <div className="text-[#FF8577] font-bold text-xl mb-6">{pkg.price}</div>
             
             <div className="bg-[#0B0F19] w-full p-4 rounded-xl border border-white/5 mb-6 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">يعادل مشاهدات:</span>
                  <span className="font-black text-[#FF8577]">+{pkg.views}</span>
                </div>
                <div className="h-[1px] w-full bg-white/5"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">أو يعادل لايكات:</span>
                  <span className="font-black text-white">+{pkg.likes}</span>
                </div>
             </div>
             
             <a 
               href="https://instagram.com/your_instagram_handle" 
               target="_blank" 
               rel="noreferrer"
               className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${pkg.highlight ? 'bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-white shadow-[0_0_20px_rgba(255,133,119,0.4)]' : 'bg-[#0B0F19] text-slate-300 hover:bg-white/5 border border-white/5'}`}
             >
                <i className="fab fa-instagram"></i> شراء عبر انستجرام
             </a>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30 shrink-0">
             <i className="fab fa-instagram text-2xl text-purple-400"></i>
           </div>
           <div>
             <h3 className="text-xl font-bold text-white mb-1">تواصل معنا على انستجرام</h3>
             <p className="text-slate-400 text-sm">عملية الشراء تتم يدوياً وفورياً لضمان الأمان. أرسل لنا رسالة لطلب شحن الرصيد.</p>
           </div>
        </div>
        <a 
          href="https://instagram.com/your_instagram_handle" 
          target="_blank" 
          rel="noreferrer"
          className="relative z-10 px-8 py-3 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition-colors shrink-0 flex items-center gap-2"
        >
          انتقال للرسائل <i className="fas fa-arrow-left text-sm"></i>
        </a>
      </div>

    </div>
  );
}

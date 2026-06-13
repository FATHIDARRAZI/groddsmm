'use client';

import React from 'react';

export default function RemoveAdsPage() {
  const premiumFeatures = [
    'تجربة خالية تماماً من الإعلانات (100% Ad-Free)',
    'تخطي وإلغاء فترة الانتظار (No Cooldown)',
    'بدون شاشات رعاية (No Sponsor Screens)',
    'دعم فني VIP فوري وأولوية قصوى',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto pb-12 animate-fade-in relative z-10 font-cairo">
      
      {/* Header */}
      <div className="text-center mb-12 mt-4">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full text-purple-400 text-xs font-bold mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:bg-purple-500/20">
          <i className="fas fa-gem"></i> ترقية الحساب
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
          ارتقِ بتجربتك إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">VIP</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto font-medium leading-relaxed">
          تخلص من الإعلانات المزعجة وفترات الانتظار، واستمتع بتجربة سلسة وفائقة السرعة.
        </p>
      </div>

      {/* Modern Pricing Card */}
      <div className="bg-[#121214]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors duration-700"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          
          {/* Features List */}
          <div className="w-full md:w-1/2 space-y-6 text-right order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/5 pt-8 md:pt-0 md:pr-10">
            <h3 className="text-lg font-bold text-white mb-6">المميزات الحصرية:</h3>
            <ul className="space-y-5">
              {premiumFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-4 text-slate-300 text-sm font-medium group/item hover:text-white transition-colors">
                  <span className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 text-purple-400 group-hover/item:scale-110 group-hover/item:bg-purple-500/20 transition-all shadow-inner">
                    <i className="fas fa-check text-[10px]"></i>
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Action */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 order-1 md:order-2">
            <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
              تفعيل دائم لمرة واحدة
            </div>
            
            <div className="flex items-end gap-2 mb-8 relative">
              <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">50</span>
              <span className="text-2xl text-slate-400 font-bold mb-2">درهم</span>
            </div>
            
            <a 
              href="https://www.instagram.com/grodd_media/" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-4 bg-gradient-to-r from-white to-slate-200 text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-pulse"></div>
              <i className="fab fa-instagram text-xl"></i> تفعيل عبر إنستغرام
            </a>
            
            <div className="flex items-center gap-2 mt-6 text-slate-500 text-xs font-medium">
               <i className="fas fa-shield-alt text-green-500/70"></i>
               <span>دفع آمن. يتم التفعيل في دقائق معدودة.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

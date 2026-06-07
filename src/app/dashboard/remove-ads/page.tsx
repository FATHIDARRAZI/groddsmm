'use client';

import React, { useState } from 'react';
import RemoveAdsChatModal from '@/components/RemoveAdsChatModal';

export default function RemoveAdsPage() {
  const [isChatOpen, setIsChatOpen] = useState(true);

  const premiumFeatures = [
    {
      title: 'تجربة خالية تماماً من الإعلانات (100% Ad-Free)',
      description: 'تصفح سريع وسلس لجميع صفحات المنصة بدون أي بنرات إعلانية أو نوافذ منبثقة مزعجة.',
      icon: 'fa-shield-halved',
      color: 'from-pink-500/20 to-[#FF8577]/20 border-pink-500/30 text-pink-400',
    },
    {
      title: 'تخطي وإلغاء فترة الانتظار (No Cooldown)',
      description: 'ودع فترة الانتظار البالغة دقيقتين بين كل طلب مجاني والآخر. أطلق حملاتك متتالية وفوراً!',
      icon: 'fa-bolt',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      title: 'بدون شاشات رعاية (No Sponsor Screens)',
      description: 'تخطي شاشة الانتظار الإلزامية البالغة 30 ثانية قبل إطلاق حملتك. تفعيل الطلب يتم في أجزاء من الثانية.',
      icon: 'fa-forward',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'دعم فني VIP فوري وأولوية قصوى',
      description: 'أولوية معالجة قصوى لحملاتك ودعم فني مخصص لحل أي استفسار أو مشكلة تواجهك بسرعة مضاعفة.',
      icon: 'fa-crown',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 md:pb-12 animate-fade-in relative z-10 font-cairo">
      
      {/* Cinematic Header */}
      <div className="relative w-full rounded-[3rem] overflow-hidden bg-[#0A0D14] border border-white/5 shadow-2xl mb-12 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500/20 to-[#FF8577]/20 border border-pink-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
          <i className="fas fa-eye-slash text-2xl text-pink-400"></i>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white mb-4 leading-tight">
          ترقية الحساب وإزالة الإعلانات
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed">
          استمتع بتجربة فائقة السرعة بدون أي إعلانات أو فترات انتظار مع ميزات VIP الحصرية.
        </p>
      </div>

      <div className="space-y-8">
        {/* Features Card */}
        <div className="bg-[#121214]/80 border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 justify-end">
            مميزات الترقية الفائقة
            <i className="fas fa-list-check text-pink-500"></i>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col items-end text-right hover:border-white/10 hover:bg-white/[0.04] transition-all group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} border flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300`}>
                  <i className={`fas ${feat.icon} text-lg`}></i>
                </div>
                <h4 className="text-white font-bold text-sm mb-2">{feat.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Action Card */}
        <div className="bg-gradient-to-tr from-[#121214] to-[#1C1C1E] border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-full text-pink-400 text-xs font-bold w-fit mx-auto">
            <i className="fas fa-coins"></i> القيمة والتفعيل
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-bold">تفعيل دائم لمرة واحدة</p>
            <h3 className="text-4xl font-black text-white">50 درهم فقط</h3>
          </div>
          
          <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
            الدفع يتم بشكل آمن وسهل. تواصل معنا على حسابنا الرسمي والوحيد على الإنستغرام وأرسل التحويل وسيقوم فريقنا بتفعيل الميزة لحسابك في دقائق!
          </p>
          
          <a 
            href="https://www.instagram.com/grodd_media/" 
            target="_blank" 
            rel="noreferrer"
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-[#FF8577] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:opacity-95 active:scale-98 transition-all relative overflow-hidden group/btn"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            <i className="fab fa-instagram text-xl"></i> تفعيل عبر إنستغرام الآن
          </a>
        </div>
      </div>

      {/* Floating AI Chat Assistant Widget */}
      <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[999999] flex flex-col items-start pointer-events-none dir-ltr">
        <RemoveAdsChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        
        {/* Floating Bubble Trigger */}
        <div className="flex items-center gap-3 pointer-events-auto group">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(236,72,153,0.3)] transition-all transform hover:scale-110 active:scale-95 border-2 border-white/10 ${
              isChatOpen 
                ? 'bg-[#1C1C1E] text-white rotate-90 shadow-none' 
                : 'bg-gradient-to-tr from-pink-500 to-[#FF8577] text-white'
            }`}
          >
            <i className={`fas ${isChatOpen ? 'fa-times' : 'fa-comment-dots'} text-xl md:text-2xl`}></i>
            {!isChatOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full border-2 border-[#0B0F19] animate-pulse shadow-lg"></span>
            )}
          </button>
          
          {!isChatOpen && (
            <div className="bg-white text-black font-black text-[10px] md:text-xs px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-slate-200 transform translate-x-2 group-hover:translate-x-0">
              اسأل المساعد الذكي عن إزالة الإعلانات
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

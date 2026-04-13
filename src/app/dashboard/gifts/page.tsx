'use client';

import React from 'react';

export default function GiftsPage() {
  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 mb-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative">
         <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
         <i className="fas fa-gift text-6xl text-purple-500 relative z-10 animate-bounce"></i>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black text-white mb-4">صندوق الهدايا اليومي</h1>
      <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed mb-8">
        قم بتسجيل الدخول يومياً للحصول على هدايا مجانية ونقاط إضافية لدعم خوارزميات حسابك. 
        الهدايا تتجدد كل 24 ساعة.
      </p>

      <button className="px-8 py-4 rounded-xl font-extrabold text-white text-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(168,85,247,0.4)] flex items-center gap-3">
         <i className="fas fa-box-open"></i> فتح صندوق اليوم
      </button>

      <div className="mt-12 bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-sm font-bold text-slate-300 mb-4 text-center">الوقت المتبقي للصندوق القادم</h3>
        <div className="flex justify-center items-center gap-4 dir-ltr font-mono">
           <div className="bg-[#0B0F19] text-[#FF8577] px-4 py-3 rounded-lg text-2xl font-black border border-white/5 shadow-inner">04<span className="text-[10px] block text-slate-500 text-center font-sans tracking-widest mt-1">HOURS</span></div>
           <div className="text-xl text-slate-600 font-black">:</div>
           <div className="bg-[#0B0F19] text-[#FF8577] px-4 py-3 rounded-lg text-2xl font-black border border-white/5 shadow-inner">45<span className="text-[10px] block text-slate-500 text-center font-sans tracking-widest mt-1">MINS</span></div>
        </div>
      </div>
    </div>
  );
}

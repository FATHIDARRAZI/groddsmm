import React from 'react';

export default function AffiliateCard() {
  return (
    <section className="w-full max-w-[1200px] mx-auto mt-16 mb-16 px-4" dir="rtl">
      <div className="w-full bg-[#1c1c1e] rounded-[32px] p-8 md:p-12 border border-black/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-12 items-center">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-bl from-pink-600/20 to-transparent blur-3xl pointer-events-none"></div>
        
        {/* Left Content */}
        <div className="flex-1 relative z-10 text-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <span className="text-xs font-bold text-slate-300 tracking-wider">برنامج التسويق بالعمولة</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            احصل على نسبة تصل إلى <span className="text-pink-500">50%</span> من مشتريات كل إحالة - مدى الحياة
          </h2>
          
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
            قم بدعوة الأصدقاء والعملاء عبر رابطك الشخصي: ستحصل على حصة من كل طلب يقومون به تضاف إلى رصيدك. كلما زاد عدد الإحالات النشطة، ارتفعت النسبة - لتصل إلى 50%. تضاف الأرباح تلقائياً ويمكنك إنفاقها على أي خدمة.
          </p>
          
          <button className="px-6 py-3 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors text-sm">
            المزيد حول برنامج التسويق بالعمولة &larr;
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 relative z-10 w-full max-w-[500px]">
          <div className="text-7xl md:text-9xl font-black text-[#E11D48] mb-4 text-center md:text-left drop-shadow-lg" dir="ltr">
            50<span className="text-5xl md:text-7xl">%</span>
          </div>
          
          <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 relative">
            {/* Floating Tags */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 md:left-24 px-3 py-1 bg-green-900/40 border border-green-500/30 rounded-full text-green-400 text-xs flex items-center gap-1 shadow-lg">
              <i className="fas fa-check"></i> إحالة <span dir="ltr">#988</span>
            </div>
            <div className="absolute -top-8 right-4 md:right-10 px-3 py-1 bg-green-900/40 border border-green-500/30 rounded-full text-green-400 text-xs flex items-center gap-1 shadow-lg">
              <i className="fas fa-check"></i> إحالة <span dir="ltr">#1042</span>
            </div>

            <div className="flex items-end gap-2 mb-8 text-right">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">رابطك الشخصي</label>
                <div className="bg-[#1C1C1E] border border-white/10 rounded-lg px-4 py-3 text-slate-300 text-sm truncate text-left dir-ltr">
                  grodd-smm.online?ref=...
                </div>
              </div>
              <button className="bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap">
                إنشاء حساب
              </button>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4 block">أرباح الإحالة</span>
              <div className="flex items-end justify-between h-24 gap-2">
                <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                  <div className="w-full bg-[#4C1D2A] rounded-t-md relative group h-4 transition-all hover:brightness-110"></div>
                  <span className="text-xs font-bold text-slate-400">20% <br/><span className="text-[10px] font-normal text-slate-500">البداية</span></span>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                  <div className="w-full bg-[#881337] rounded-t-md relative group h-10 transition-all hover:brightness-110"></div>
                  <span className="text-xs font-bold text-slate-400">30%</span>
                </div>
                <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                  <div className="w-full bg-[#E11D48] rounded-t-md relative group h-16 transition-all shadow-[0_0_15px_rgba(225,29,72,0.5)]"></div>
                  <span className="text-xs font-bold text-slate-400">50% <br/><span className="text-[10px] font-normal text-slate-500">الحد الأقصى</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

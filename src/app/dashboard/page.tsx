'use client';

import React, { useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function DashboardHome() {
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<'likes' | 'views'>('likes');
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointsToSpend, setPointsToSpend] = useState(30);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const handleLaunch = () => {
    if (!postLink) return setErrorMsg('الرجاء إدخال الرابط أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPostLink('');
      setRecaptchaToken('');
      alert('تم تقديم طلبك بنجاح. يتم مراجعته الآن في سجل الطلبات.');
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 animate-fade-in relative z-10">
      {/* Premium Floating Header */}
      <div className="w-full space-y-4 text-center">
         <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            إطلاق طلب <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">جديد</span> <span className="text-pink-500">.</span>
         </h1>
         <p className="text-slate-500 font-bold text-sm md:text-base max-w-md mx-auto leading-relaxed">
            أدخل الرابط أدناه وحدد الكمية المطلوبة لبدء عملية الترويج فوراً وحقق انتشاراً واسعاً.
         </p>
      </div>



      <div className="relative group">
        {/* Cinematic Background Glows */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
        
        <div className="glass-panel rounded-[3rem] p-10 md:p-14 relative overflow-hidden border-white/5 bg-[#09090b]/80 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          {/* Animated Internal Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/[0.03] blur-[120px] rounded-full pointer-events-none group-hover:bg-pink-500/[0.07] transition-all duration-1000"></div>
          
          <div className="space-y-10 relative z-10">
            {/* Content Link Section */}
            <div className="flex flex-col gap-4 group/input">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black text-slate-500 uppercase">رابط المحتوى</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-pink-500 transition-all duration-300">
                  <i className="fas fa-link text-sm"></i>
                </div>
                <input
                  type="text"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="ضع الرابط هنا..."
                  className="w-full bg-[#050505]/60 border border-white/5 rounded-3xl py-6 pr-16 pl-8 text-right dir-rtl text-white font-outfit text-base placeholder-slate-800 focus:outline-none focus:border-pink-500/40 focus:bg-black/80 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Service Selection & Quantity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col gap-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase px-2">الخدمة المطلوبة</label>
                  <div className="flex bg-[#050505]/60 p-2 rounded-3xl border border-white/5 shadow-inner">
                    <button 
                      onClick={() => setService('likes')} 
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase transition-all duration-500 ${service === 'likes' ? 'bg-gradient-to-b from-[#1C1C1E] to-[#121214] text-white shadow-xl border border-white/10 ring-1 ring-pink-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${service === 'likes' ? 'bg-pink-500 text-white' : 'bg-white/5'}`}>
                        <i className="fas fa-heart text-[12px]"></i>
                      </div>
                      إعجابات
                    </button>
                    <button 
                      onClick={() => setService('views')} 
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase transition-all duration-500 ${service === 'views' ? 'bg-gradient-to-b from-[#1C1C1E] to-[#121214] text-white shadow-xl border border-white/10 ring-1 ring-pink-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${service === 'views' ? 'bg-pink-500 text-white' : 'bg-white/5'}`}>
                        <i className="fas fa-eye text-[12px]"></i>
                      </div>
                      مشاهدات
                    </button>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase px-2">الكمية المطلوبة</label>
                  <div className="bg-[#050505]/60 px-8 py-4 rounded-3xl border border-white/5 flex items-center justify-between h-[76px] shadow-inner relative overflow-hidden group/qty">
                     <div className="absolute inset-0 bg-pink-500/[0.02] translate-y-full group-hover/qty:translate-y-0 transition-transform duration-700"></div>
                     <span className="text-white font-black text-2xl font-outfit relative z-10 tracking-tight">
                        {service === 'likes' ? pointsToSpend : Math.floor(pointsToSpend * 200 / 30)}
                     </span>
                     <div className="flex flex-col items-end relative z-10">
                        <span className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-4 py-1.5 rounded-full border border-pink-500/20 uppercase">
                           {service === 'likes' ? 'إعجاب' : 'مشاهدة'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Points Cost Slider Section */}
            <div className="space-y-6 bg-[#050505]/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-black text-slate-500 uppercase">تكلفة النقاط</span>
                  <span className="text-[9px] text-slate-600 font-bold">اسحب لتحديد الميزانية المطلوبة</span>
                </div>
                <div className="flex items-baseline gap-1 dir-rtl">
                  <span className="text-2xl font-black text-pink-500 font-outfit leading-none">{pointsToSpend}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase">نقطة</span>
                </div>
              </div>
              
              <div className="relative py-6 group/slider dir-rtl">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-black/60 rounded-full border border-white/5 shadow-inner"></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-l from-pink-600 to-pink-400 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-none"
                  style={{ width: `${((pointsToSpend - 30) / (3000 - 30)) * 100}%`, right: 0 }}
                ></div>
                <input 
                  type="range" 
                  min="30" 
                  max="3000" 
                  step="30" 
                  value={pointsToSpend} 
                  onChange={(e) => setPointsToSpend(Number(e.target.value))}
                  className="absolute top-1/2 -translate-y-1/2 w-full h-12 opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)] border-[6px] border-pink-500 pointer-events-none transition-transform duration-200 flex items-center justify-center group-active/slider:scale-125"
                  style={{ right: `calc(${((pointsToSpend - 30) / (3000 - 30)) * 100}% - 14px)` }}
                >
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
            </div>


            {/* Verification Section */}
            <div className="flex flex-col items-center gap-4 py-4">
               <div className="p-4 rounded-[2.5rem] bg-[#050505]/60 border border-white/5 shadow-inner scale-95 hover:scale-100 transition-transform duration-500">
                 <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" />
               </div>
               {errorMsg && (
                 <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-6 py-2 rounded-full animate-bounce">
                    <i className="fas fa-exclamation-triangle text-pink-500 text-[10px]"></i>
                    <span className="text-pink-500 text-[10px] font-black uppercase">{errorMsg}</span>
                 </div>
               )}
            </div>

            {/* Launch Button */}
            <button
              onClick={handleLaunch}
              disabled={isProcessing}
              className="w-full py-7 mt-2 rounded-[2.5rem] font-black text-white text-xl bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 active:scale-[0.98] transition-all duration-500 shadow-[0_20px_60px_rgba(236,72,153,0.3)] flex items-center justify-center gap-5 disabled:opacity-50 overflow-hidden relative group/btn border-t border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span className="tracking-tighter uppercase italic">جاري المعالجة...</span>
                </div>
              ) : (
                <>
                  <span className="tracking-tighter">إطلاق الطلب الآن</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-pink-500 transition-all duration-500">
                    <i className="fas fa-rocket text-sm"></i>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


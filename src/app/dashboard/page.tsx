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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-500/10 to-[#FF8577]/10 border border-white/5 rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8577]/5 blur-[80px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl font-black text-white mb-2">تقديم طلب جديد 🚀</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">استخدم نقاطك بحكمة لرفع خوارزميات محتواك فورياً. كل طلب يتم تسجيله في قائمة التاريخ.</p>
        
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col gap-2 group/input">
            <label className="text-xs font-bold text-slate-500 tracking-widest block text-right w-full mb-1">رابط المحتوى (Post Link)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold group-focus-within/input:text-[#FF8577] transition-colors">
                <i className="fas fa-link"></i>
              </div>
              <input
                type="text"
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                placeholder="https://social.media/your-awesome-post"
                className="w-full bg-[#18181A] border border-white/5 rounded-xl py-4 pr-12 pl-4 text-left dir-ltr text-white placeholder-slate-600 focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <label className="text-xs font-bold text-slate-500 tracking-widest block text-right w-full mb-1">الخطة الإعلانية (Strategy)</label>
            <div className="flex flex-col sm:flex-row bg-[#0D0D0E] p-1 rounded-xl w-full border border-white/5 gap-1 sm:gap-0">
              <button onClick={() => setService('likes')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${service === 'likes' ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-white border border-transparent'}`}>
                <i className={`fas fa-heart ${service === 'likes' ? 'text-[#FF8577]' : 'text-slate-600'}`}></i> لايكات
              </button>
              <button onClick={() => setService('views')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${service === 'views' ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-white border border-transparent'}`}>
                <i className={`fas fa-eye ${service === 'views' ? 'text-slate-300' : 'text-slate-600'}`}></i> مشاهدات
              </button>
            </div>
          </div>

          {/* Dynamic Quantity Slider */}
          <div className="flex flex-col gap-4 mt-4 bg-[#0D0D0E] p-5 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">الكمية المطلوبة (Quantity)</span>
              <span className="text-white text-xl drop-shadow-[0_0_10px_rgba(255,133,119,0.5)] flex items-center gap-2">
                 {service === 'likes' ? pointsToSpend : Math.floor(pointsToSpend * 200 / 30)} 
                 <span className="text-xs text-[#FF8577] bg-[#FF8577]/10 px-2 py-1 rounded border border-[#FF8577]/20">
                   {service === 'likes' ? 'لايك 🤍' : 'مشاهدة 👁️'}
                 </span>
              </span>
            </div>
            
            <input 
              type="range" 
              min="30" 
              max="3000" 
              step="30" 
              value={pointsToSpend} 
              onChange={(e) => setPointsToSpend(Number(e.target.value))}
              className="w-full accent-[#FF8577] bg-[#1C1C1E] h-2 rounded-lg appearance-none cursor-pointer outline-none"
            />
            
            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-white/5">
               <span className="text-slate-500">التكلفة الإجمالية للحملة:</span>
               <span className="text-[#FF8577] font-mono tabular-nums">{pointsToSpend} نقطة</span>
            </div>
          </div>

          <div className="flex justify-center w-full my-6 max-w-full overflow-hidden">
            <div className="bg-[#121214] p-2 rounded-xl shadow-inner border border-white/5 flex justify-center w-full md:w-auto max-w-full overflow-x-auto">
              <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" />
            </div>
          </div>

          {errorMsg && <div className="text-red-500 text-sm text-center font-bold animate-pulse">{errorMsg}</div>}

          <button
            onClick={handleLaunch}
            disabled={isProcessing}
            className="w-full py-4 mt-2 rounded-xl font-extrabold text-[#1F0A07] text-lg bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,133,119,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-rocket text-sm"></i> إرسال الطلب الآن</>}
          </button>
        </div>
      </div>
    </div>
  );
}

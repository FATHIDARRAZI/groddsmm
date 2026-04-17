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
      <div className="text-center md:text-right space-y-2">
         <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl font-outfit">
            تحسين الخوارزميات <span className="text-red-600">.</span>
         </h1>
         <p className="text-slate-500 font-bold text-sm md:text-base max-w-lg md:ml-0 md:mr-auto">
            قم بزيادة الوصول العضوي وتنشيط حسابك عبر تقنيات الترويج الذكية.
         </p>
      </div>

      <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-red-600/10 transition-all duration-700"></div>
        
        <div className="space-y-8 relative z-10">
          <div className="flex flex-col gap-3 group/input">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Content Destination</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-600 group-focus-within/input:text-red-500 transition-colors">
                <i className="fas fa-paper-plane text-xs"></i>
              </div>
              <input
                type="text"
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                placeholder="https://social.media/post/..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pr-14 pl-6 text-left dir-ltr text-white font-outfit text-sm placeholder-slate-700 focus:outline-none focus:border-red-600/30 focus:bg-black/60 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategy</label>
                <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => setService('likes')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${service === 'likes' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-white'}`}>
                    <i className="fas fa-heart text-[10px]"></i> Likes
                  </button>
                  <button onClick={() => setService('views')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${service === 'views' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-white'}`}>
                    <i className="fas fa-eye text-[10px]"></i> Views
                  </button>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Quote</label>
                <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center justify-between h-full">
                   <span className="text-white font-black text-xl font-outfit">
                      {service === 'likes' ? pointsToSpend : Math.floor(pointsToSpend * 200 / 30)}
                   </span>
                   <span className="text-[10px] font-black text-red-500 bg-red-600/10 px-3 py-1 rounded-full border border-red-600/20 uppercase">
                      {service === 'likes' ? 'Likes' : 'Views'}
                   </span>
                </div>
             </div>
          </div>

          <div className="space-y-4 bg-black/20 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500">Allocation Level</span>
              <span className="text-red-500 font-outfit">{pointsToSpend} Points</span>
            </div>
            
            <input 
              type="range" 
              min="30" 
              max="3000" 
              step="30" 
              value={pointsToSpend} 
              onChange={(e) => setPointsToSpend(Number(e.target.value))}
              className="w-full accent-red-600 bg-black/40 h-1.5 rounded-full appearance-none cursor-pointer outline-none"
            />
          </div>

          <div className="flex justify-center w-full mt-4">
             <div className="bg-black/40 p-3 rounded-[2rem] border border-white/5 scale-90 md:scale-100">
               <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" />
             </div>
          </div>

          {errorMsg && <div className="text-red-500 text-xs text-center font-black animate-pulse uppercase tracking-wider">{errorMsg}</div>}

          <button
            onClick={handleLaunch}
            disabled={isProcessing}
            className="w-full py-6 mt-4 rounded-3xl font-black text-white text-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.97] transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden relative group/btn"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
            {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-bolt-lightning text-sm text-yellow-500"></i> تشغيل الحملة الآن</>}
          </button>
        </div>
      </div>

      {/* Mobile-Only Native Ad Unit beneath the primary card */}
      {isClient && (
        <div className="md:hidden mt-2 bg-[#0B0F19]/50 rounded-2xl overflow-hidden border border-white/5 flex flex-col items-center justify-center h-[280px] relative w-full shadow-inner mx-auto max-w-[320px]">
           <p className="absolute text-[10px] text-slate-600 font-bold top-2 tracking-widest z-0">ADVERTISEMENT</p>
           <iframe src="/ad-300.html" width="300" height="250" frameBorder="0" scrolling="no" className="z-10 bg-transparent rounded-lg relative mt-4"></iframe>
        </div>
      )}
    </div>
  );
}

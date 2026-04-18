'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

// Segment Array (Rigged Setup)
const segments = [
  { id: 0, text: '10K حسابات', type: 'followers', icon: 'fa-users', bgColor: '#0B0F19', textColor: 'text-white', isSafe: false, points: 0 },
  { id: 1, text: '5 نقاط', type: 'points', icon: 'fa-coins', bgColor: '#FF8577', textColor: 'text-[#1F0A07]', isSafe: true, points: 5 },
  { id: 2, text: '5K مشاهدة', type: 'views', icon: 'fa-eye', bgColor: '#1A1A24', textColor: 'text-white', isSafe: false, points: 0 },
  { id: 3, text: '10 نقاط', type: 'points', icon: 'fa-coins', bgColor: '#ec4899', textColor: 'text-white', isSafe: true, points: 10 },
  { id: 4, text: '1K لايك', type: 'likes', icon: 'fa-heart', bgColor: '#0B0F19', textColor: 'text-white', isSafe: false, points: 0 },
  { id: 5, text: '15 نقطة', type: 'points', icon: 'fa-coins', bgColor: '#FF8577', textColor: 'text-[#1F0A07]', isSafe: true, points: 15 },
  { id: 6, text: '25K مشاهدة', type: 'views', icon: 'fa-fire', bgColor: '#1A1A24', textColor: 'text-white', isSafe: false, points: 0 },
  { id: 7, text: '20 نقطة', type: 'points', icon: 'fa-gift', bgColor: '#8b5cf6', textColor: 'text-white', isSafe: true, points: 20 },
];

export default function GiftsPage() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<{text: string, points: number, icon: string} | null>(null);
  const [timeToNextSpin, setTimeToNextSpin] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(30);

  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const conicCss = segments.map((s, i) => `${s.bgColor} ${i * 45}deg ${i * 45 + 45}deg`).join(', ');

  useEffect(() => {
    if (!isMounted) return;

    // [DEV MODE BYPASS]: Force unlock for unlimited testing
    localStorage.removeItem('last_spin_time');
    setTimeToNextSpin(null);

    const lastSpin = localStorage.getItem('last_spin_time');
    if (lastSpin) {

      const remainingMs = parseInt(lastSpin, 10) + (1 * 60 * 60 * 1000) - Date.now();
      if (remainingMs > 0) {
        setTimeToNextSpin(Math.ceil(remainingMs / 1000));
      } else {
        localStorage.removeItem('last_spin_time');
      }
    }
  }, [isMounted]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeToNextSpin !== null && timeToNextSpin > 0) {
      timer = setInterval(() => {
        setTimeToNextSpin((prev) => prev! - 1);
      }, 1000);
    } else if (timeToNextSpin !== null && timeToNextSpin <= 0) {
      setTimeToNextSpin(null);
      localStorage.removeItem('last_spin_time');
    }
    return () => clearInterval(timer);
  }, [timeToNextSpin]);

  useEffect(() => {
    let adInterval: NodeJS.Timeout;
    if (isWatchingAd && adTimer > 0) {
      adInterval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(adInterval);
  }, [isWatchingAd, adTimer]);

  const initiateAdWall = () => {
    if (isSpinning || timeToNextSpin !== null) return;
    if (!recaptchaToken) {
      alert("الرجاء إكمال التحقق البشري أولاً (Verify you are human)");
      return;
    }
    
    setIsSpinning(true);
    setAdTimer(30);
    setIsWatchingAd(true);
  };

  const executeRealSpin = () => {
    setIsWatchingAd(false);
    setWonPrize(null);

    const safeSegments = segments.filter(s => s.isSafe);
    const rand = Math.random();
    let targetSegment;
    if (rand < 0.4) {
      targetSegment = safeSegments.find(s => s.points === 5)!;
    } else if (rand < 0.7) {
      targetSegment = safeSegments.find(s => s.points === 10)!;
    } else if (rand < 0.9) {
      targetSegment = safeSegments.find(s => s.points === 15)!;
    } else {
      targetSegment = safeSegments.find(s => s.points === 20)!;
    }

    const fullSpins = 6 * 360;
    const randomOffset = Math.floor(Math.random() * 30) - 15; 
    const sliceTargetAngle = (360 - (targetSegment.id * 45)) % 360;
    const finalRotationAmount = fullSpins + sliceTargetAngle + randomOffset;

    setRotation(prev => prev + finalRotationAmount);

    setTimeout(async () => {
      setWonPrize(targetSegment);
      setIsSpinning(false);
      setIsClaiming(true);
      
      try {
        const res = await fetch('/api/gifts/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: targetSegment.points })
        });
        
        if (res.ok) {
           router.refresh(); 
           window.dispatchEvent(new Event('pointsUpdated')); 
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsClaiming(false);
        // [DEV MODE BYPASS]: Disabled lock for testing
        // localStorage.setItem('last_spin_time', Date.now().toString());
        // setTimeToNextSpin(1 * 60 * 60);
      }

    }, 7000);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return { h: h < 10 ? `0${h}` : h, m: m < 10 ? `0${m}` : m };
  };

  if (!isMounted) return null;

  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center pt-8 relative z-10">
      
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
          عجلة الحظ <span className="text-pink-500">اليومية</span>
        </h1>
        <p className="text-slate-500 font-bold text-sm md:text-base max-w-lg mx-auto">
          جرب حظك الآن واربح رصيد نقاط مجاني لدعم حسابك! المحاولة تتجدد كل ساعة واحدة.
        </p>
      </div>

      <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] mx-auto mb-16 group">
        <div className="absolute inset-0 bg-pink-500/10 blur-[100px] rounded-full group-hover:bg-pink-500/20 transition-all duration-700"></div>
        <div className="absolute -inset-4 border border-white/5 rounded-full animate-pulse-slow"></div>

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
           <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-pink-500 relative">
              <div className="absolute -top-[42px] -left-[18px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] border-t-white"></div>
           </div>
        </div>

        <div 
          className="w-full h-full rounded-full border-[12px] border-[#1C1C1E] shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
          style={{ 
            background: `conic-gradient(from -22.5deg, ${conicCss})`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 7s cubic-bezier(0.1, 0, 0.1, 1)'
          }}
        >
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none"></div>

          {segments.map((seg, i) => (
            <div
              key={seg.id}
              className="absolute top-0 left-0 w-full h-full flex justify-center pointer-events-none"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <div className={`pt-8 md:pt-14 flex flex-col items-center gap-2 ${seg.textColor}`}>
                <i className={`fas ${seg.icon} text-xl md:text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]`}></i>
                <span className="text-[12px] md:text-lg font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-center leading-none">
                  {seg.text.split(' ')[0]}<br/>
                  <span className="text-[9px] md:text-[12px] opacity-90 uppercase tracking-widest">{seg.text.split(' ')[1]}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#1C1C1E] rounded-full border-4 border-white/10 shadow-2xl z-20 flex items-center justify-center">
            <div className="w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-pulse"></div>
        </div>
      </div>

      {timeToNextSpin === null ? (
        <div className="flex flex-col items-center gap-6 mt-4 w-full">
          <div className="bg-[#121214] p-2 rounded-xl shadow-inner border border-white/5 flex justify-center w-full md:w-auto overflow-hidden">
            <ReCAPTCHA
              sitekey={activeSiteKey}
              onChange={(token: string | null) => setRecaptchaToken(token || '')}
              theme="dark"
            />
          </div>
          <button 
            onClick={initiateAdWall}
            disabled={isSpinning || !recaptchaToken}
            className={`px-12 py-5 rounded-2xl w-full max-w-sm font-extrabold text-[#1F0A07] text-xl transition-all shadow-[0_4px_20px_rgba(255,133,119,0.4)] flex items-center justify-center gap-4 ${isSpinning || !recaptchaToken ? 'opacity-50 cursor-not-allowed bg-slate-500' : 'bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98]'}`}
          >
             <i className={`fas fa-sync-alt ${isSpinning ? 'animate-spin' : ''}`}></i> 
             {isSpinning ? 'جاري التجهيز...' : 'تدوير العجلة الآن'}
          </button>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-8 w-full max-w-sm animate-fade-in shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] pointer-events-none"></div>
          <h3 className="text-sm font-bold text-slate-300 mb-6 text-center tracking-widest relative z-10">المحاولة القادمة بعد</h3>
          <div className="flex justify-center items-center gap-6 dir-ltr font-mono relative z-10">
             <div className="flex flex-col items-center">
               <div className="bg-[#0B0F19] text-[#FF8577] px-5 py-4 rounded-xl text-3xl font-black border border-white/5 shadow-inner w-20 flex justify-center">{formatTimer(timeToNextSpin).h}</div>
               <span className="text-[10px] text-slate-500 font-sans tracking-widest mt-2">HOURS</span>
             </div>
             <div className="text-2xl text-slate-700 font-black mb-6">:</div>
             <div className="flex flex-col items-center">
               <div className="bg-[#0B0F19] text-[#FF8577] px-5 py-4 rounded-xl text-3xl font-black border border-white/5 shadow-inner w-20 flex justify-center">{formatTimer(timeToNextSpin).m}</div>
               <span className="text-[10px] text-slate-500 font-sans tracking-widest mt-2">MINS</span>
             </div>
          </div>
        </div>
      )}

      {wonPrize && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-xl animate-fade-in" onClick={() => !isClaiming && setWonPrize(null)}></div>
           <div className="bg-gradient-to-b from-[#1C1C1E] to-[#121214] border border-[#FF8577]/30 p-10 rounded-3xl shadow-[0_0_100px_rgba(255,133,119,0.2)] max-w-md w-full relative z-10 animate-slide-up transform transition-all text-center">
             <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-[#FF8577] to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-inner border-[6px] border-black/50">
                <i className={`fas ${wonPrize.icon} text-4xl text-white`}></i>
             </div>
             {isClaiming ? (
               <>
                 <h2 className="text-4xl font-black text-white mb-2 animate-pulse">جاري الإيداع...</h2>
                 <p className="text-slate-400 mb-8 max-w-[250px] mx-auto text-sm leading-relaxed">
                   يرجى الانتظار، جاري تحويل {wonPrize.points} نقطة بأمان إلى قاعدة البيانات الخاصة بحسابك.
                 </p>
                 <button disabled className="bg-[#FF8577]/50 text-[#1F0A07]/50 px-8 py-4 rounded-xl font-bold w-full flex items-center justify-center gap-3 cursor-wait transition-all">
                    <i className="fas fa-spinner fa-spin"></i> توثيق الإيداع
                 </button>
               </>
             ) : (
               <>
                 <h2 className="text-4xl font-black text-white mb-2">ربحت {wonPrize.points} نقطة!</h2>
                 <p className="text-slate-400 mb-8 max-w-[250px] mx-auto text-sm leading-relaxed">
                   تمت إضافة {wonPrize.points} نقطة إلى رصيد حسابك بنجاح. استخدمها الآن لرفع تفاعل حساباتك مجاناً.
                 </p>
                 <Link href="/dashboard" className="bg-[#FF8577] text-[#1F0A07] px-8 py-4 rounded-xl font-bold w-full flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all">
                    <i className="fas fa-layer-group"></i> التوجه إلى لوحة التحكم
                 </Link>
               </>
             )}
           </div>
        </div>
      )}

      {isWatchingAd && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center bg-[#0B0F19] text-white p-4">
          <div className="absolute top-8 w-full px-8 flex justify-between items-center max-w-4xl">
             <div className="bg-[#1C1C1E] px-4 py-2 rounded-full border border-white/10 text-[#FF8577] font-bold text-sm tracking-widest flex items-center gap-2 shadow-inner">
               <i className="fas fa-lock opacity-50"></i> إعلان ممول
             </div>
             {adTimer > 0 ? (
               <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center font-mono text-xl font-bold bg-[#121214] text-slate-400">
                 {adTimer}
               </div>
             ) : (
               <button 
                 type="button"
                 onClick={executeRealSpin}
                 className="w-12 h-12 rounded-full border-2 border-[#FF8577] flex items-center justify-center text-xl font-bold bg-[#FF8577]/10 text-[#FF8577] hover:bg-[#FF8577] hover:text-white transition-all cursor-pointer touch-manipulation shadow-[0_0_20px_rgba(255,133,119,0.5)] animate-pulse"
               >
                 <i className="fas fa-times pointer-events-none"></i>
               </button>
             )}
          </div>

          <div className="mt-8 text-center max-w-md animate-fade-in px-4">
             <h2 className="text-2xl font-black mb-2 text-white">جاري تجهيز العجلة...</h2>
             <p className="text-slate-400 text-sm leading-relaxed mb-4">
               {adTimer > 0 
                 ? 'يرجى الانتظار حتى انتهاء الوقت لضمان تسجيل حسابك بالخوادم قبل السحب لتجنب ضياع النقاط.' 
                 : 'تم تسجيل الاستجابة بنجاح! اضغط على علامة (X) بالأعلى لبدء السحب.'}
             </p>
             <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
                <p className="text-red-400 text-[10px] md:text-xs font-bold dir-rtl">
                  <i className="fas fa-exclamation-triangle mr-1"></i> تنبيه: هذا مجرد إعلان خارجي، نحن لا نشجع على المراهنة أو القمار. يرجى الحذر.
                </p>
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-0 w-full max-w-[600px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
             {/* Trying the Banner ID method */}
             <iframe 
                src="/ad-smart.html" 
                width="300" 
                height="250" 
                frameBorder="0" 
                className="animate-fade-in bg-transparent"
                loading="lazy"
             ></iframe>

             {/* Fallback Smart Link Text Link (High Revenue) */}
             <div className="mt-4 pb-4">
                <a 
                   href="https://evacuateenclose.com/zp6sv5d21e?key=8550d4deddea59bbc5e5765e239b7830" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-pink-500 hover:text-pink-400 font-bold text-sm underline animate-pulse"
                >
                   إضغط هنا إذا لم يظهر الإعلان (Click here if ad is white)
                </a>
             </div>
          </div>


        </div>
      )}

    </div>
  );
}

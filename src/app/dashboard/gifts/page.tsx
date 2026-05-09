'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';
import Script from 'next/script';
import SafeAdSlot from '@/components/SafeAdSlot';

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

const SMART_LINK_URL = "https://evacuateenclose.com/zeyns3fb?key=cb01eb11742914d2a3e8c0cd74d17e70";

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
  const [hasClickedAd, setHasClickedAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(20);

  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const conicCss = segments.map((s, i) => `${s.bgColor} ${i * 45}deg ${i * 45 + 45}deg`).join(', ');

  useEffect(() => {
    if (!isMounted) return;

    // Load cooldown from localStorage
    const checkCooldown = () => {
      // Disable cooldown in development for testing
      if (process.env.NODE_ENV === 'development') {
        setTimeToNextSpin(null);
        return;
      }

      const lastSpin = localStorage.getItem('last_spin_time');
      if (lastSpin) {
        const remainingMs = parseInt(lastSpin, 10) + (1 * 60 * 60 * 1000) - Date.now();
        if (remainingMs > 0) {
          setTimeToNextSpin(Math.ceil(remainingMs / 1000));
        } else {
          localStorage.removeItem('last_spin_time');
          setTimeToNextSpin(null);
        }
      }
    };
    
    checkCooldown();
  }, [isMounted]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeToNextSpin !== null && timeToNextSpin > 0) {
      timer = setInterval(() => {
        setTimeToNextSpin((prev) => (prev && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (timeToNextSpin !== null && timeToNextSpin <= 0) {
      setTimeToNextSpin(null);
      localStorage.removeItem('last_spin_time');
    }
    return () => clearInterval(timer);
  }, [timeToNextSpin]);

  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleVisibility = () => setIsTabActive(!document.hidden);
    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    let adInterval: NodeJS.Timeout;
    if (isWatchingAd && hasClickedAd && adTimer > 0) {
      adInterval = setInterval(() => {
        // ONLY decrement if the user is NOT looking at our page (they are likely on the ad)
        if (document.hidden) {
          setAdTimer((prev) => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(adInterval);
  }, [isWatchingAd, hasClickedAd, adTimer]);

  const handleSmartLinkClick = () => {
    window.open(SMART_LINK_URL, '_blank');
    setHasClickedAd(true);
  };

  const initiateAdWall = () => {
    if (isSpinning || timeToNextSpin !== null) return;
    if (!recaptchaToken) {
      alert("الرجاء إكمال التحقق البشري أولاً (Verify you are human)");
      return;
    }
    
    setIsSpinning(true);
    setAdTimer(20);
    setHasClickedAd(false);
    setIsWatchingAd(true);
    // REMOVED auto-open to ensure timer starts ONLY on click as requested
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
      
      // Save spin time for cooldown (Skip in dev)
      if (process.env.NODE_ENV !== 'development') {
        localStorage.setItem('last_spin_time', Date.now().toString());
        setTimeToNextSpin(3600); // 1 hour cooldown
      } else {
        setTimeToNextSpin(null);
      }

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
      }
    }, 7000);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { 
      h: h < 10 ? `0${h}` : h, 
      m: m < 10 ? `0${m}` : m,
      s: s < 10 ? `0${s}` : s
    };
  };

  if (!isMounted) return null;

  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center pt-8 relative z-10">
      {/* Social Bar Ad Script (Increased Revenue) */}
      <Script 
        src="//evacuateenclose.com/3e8c62702cd2303189cddf06f9f175cd/invoke.js"
        strategy="lazyOnload"
      />
      
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
            className={`px-12 py-5 rounded-2xl w-full max-sm font-extrabold text-[#1F0A07] text-xl transition-all shadow-[0_4px_20px_rgba(255,133,119,0.4)] flex items-center justify-center gap-4 ${isSpinning || !recaptchaToken ? 'opacity-50 cursor-not-allowed bg-slate-500' : 'bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98]'}`}
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
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center bg-[#0B0F19] text-white p-4 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="w-full flex justify-between items-center max-w-4xl z-[100] mb-8 shrink-0">
             <div className="bg-[#1C1C1E] px-4 py-2 rounded-full border border-white/10 text-[#FF8577] font-bold text-xs md:text-sm tracking-widest flex items-center gap-2 shadow-inner">
               <i className="fas fa-lock opacity-50"></i> إعلان ممول
             </div>
             {(adTimer > 0 || !hasClickedAd) ? (
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 flex items-center justify-center font-mono text-lg md:text-xl font-bold bg-[#121214] text-slate-400">
                 {hasClickedAd ? adTimer : '--'}
               </div>
             ) : (
               <button 
                 type="button"
                 onClick={executeRealSpin}
                 className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#FF8577] flex items-center justify-center text-xl font-bold bg-[#FF8577]/10 text-[#FF8577] hover:bg-[#FF8577] hover:text-white transition-all cursor-pointer touch-manipulation shadow-[0_0_20px_rgba(255,133,119,0.5)] animate-pulse"
               >
                 <i className="fas fa-times pointer-events-none"></i>
               </button>
             )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl py-4 overflow-hidden relative">
            {hasClickedAd ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-8 animate-fade-in text-center p-6">
                <div className="relative">
                   <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] flex items-center justify-center transition-all duration-500 ${adTimer > 0 ? (isTabActive ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'border-[#FF8577] animate-pulse shadow-[0_0_30px_rgba(255,133,119,0.3)]') : 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]'}`}>
                      <span className="text-5xl md:text-7xl font-black font-mono">
                        {adTimer > 0 ? adTimer : <i className="fas fa-check"></i>}
                      </span>
                   </div>
                   {adTimer > 0 && isTabActive && (
                     <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-2 rounded-lg text-xs font-bold animate-bounce shadow-xl">
                        <i className="fas fa-pause mr-1"></i> مُتوقف
                     </div>
                   )}
                </div>

                <div className="max-w-md space-y-4">
                  {adTimer > 0 ? (
                    isTabActive ? (
                      <>
                        <h3 className="text-2xl md:text-3xl font-black text-yellow-500">توقف العداد!</h3>
                        <p className="text-slate-300 leading-relaxed">
                          لقد عدت إلى هذه الصفحة مبكراً. يرجى العودة لصفحة الإعلان وإكمال التصفح لمدة <span className="text-white font-bold">{adTimer} ثانية</span> أخرى لتفعيل السحب.
                        </p>
                        <button 
                          onClick={() => window.open(SMART_LINK_URL, '_blank')}
                          className="bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                          <i className="fas fa-external-link-alt"></i> العودة للإعلان الآن
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl md:text-3xl font-black text-[#FF8577] animate-pulse">جاري التحقق...</h3>
                        <p className="text-slate-400">
                          استمر في تصفح صفحة الإعلان... سيتم تفعيل زر الإغلاق فور انتهاء الوقت.
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <h3 className="text-2xl md:text-3xl font-black text-green-500">اكتمل التحقق بنجاح!</h3>
                      <p className="text-slate-300">
                        شكراً لانتظارك. يمكنك الآن إغلاق هذه النافذة بالضغط على علامة (X) في الأعلى والبدء في تدوير عجلة الحظ.
                      </p>
                    </>
                  )}
                </div>

                <div className="pt-8 border-t border-white/5 w-full max-w-sm">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">
                     إحصائيات الجلسة - Session Status
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                         <div className="text-[10px] text-slate-500 mb-1">الحالة</div>
                         <div className={`text-xs font-bold ${adTimer > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                           {adTimer > 0 ? 'قيد الانتظار' : 'مكتمل'}
                         </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                         <div className="text-[10px] text-slate-500 mb-1">المتصفح</div>
                         <div className="text-xs font-bold text-white">نشط</div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <>
                {/* Top Banner Space (Mobile Ad) */}
                <div className="mb-6 w-full flex justify-center">
                   <SafeAdSlot 
                      src="/ad-320.html" 
                      width="320" 
                      height="50" 
                      className="rounded-lg opacity-90 shadow-lg"
                   />
                </div>

                <div className="text-center max-w-md animate-fade-in px-4 mb-6">
                   <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">تفعيل عجلة الحظ</h2>
                   <p className="text-[#FF8577] text-sm font-bold bg-[#FF8577]/10 py-2 px-4 rounded-full inline-block animate-bounce mb-4">
                     ⚠️ يجب الضغط على الزر بالأسفل لتفعيل العداد
                   </p>
                   
                   <button 
                     onClick={handleSmartLinkClick}
                     className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-3"
                   >
                     <i className="fas fa-external-link-alt"></i> إضغط هنا لتفعيل السحب الآن
                   </button>
                </div>

                <div className="bg-gradient-to-br from-[#1C1C1E] to-[#121214] border border-white/10 rounded-2xl p-6 w-full max-w-[600px] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] group">
                   <div className="absolute inset-0 bg-pink-500/5 group-hover:bg-pink-500/10 transition-all duration-500"></div>
                   
                   <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-4 border border-pink-500/30">
                        <i className="fas fa-gift text-4xl text-pink-500 animate-pulse"></i>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">عرض خاص للمستخدمين!</h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-xs">
                        اضغط على الزر بالأسفل لزيارة الرابط الممول وتفعيل سحب النقاط فوراً.
                      </p>
                      
                      <button 
                         onClick={handleSmartLinkClick}
                         className="bg-white text-black px-10 py-4 rounded-xl font-black text-lg hover:bg-pink-500 hover:text-white transition-all shadow-xl active:scale-95"
                      >
                         زيارة الرابط الآن <i className="fas fa-external-link-alt ml-2"></i>
                      </button>
                   </div>

                   <div className="mt-6 pt-6 border-t border-white/5 w-full text-center relative z-10">
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                        إعلان ذكي - Smart Link Placement
                      </p>
                   </div>
                </div>
              </>
            )}
          </div>

            {/* Bottom Banner Space (Desktop Banner) */}
            <div className="mt-8 w-full flex justify-center opacity-90 grayscale-0 transition-all">
               <SafeAdSlot 
                  src="/ad-468.html" 
                  width="468" 
                  height="60" 
                  className="rounded-lg shadow-lg"
               />
            </div>
          </div>
      )}
    </div>
  );
}

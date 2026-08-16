'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { checkAdBlock } from '@/lib/adBlockDetector';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const SMART_LINK_URL = "https://evacuateenclose.com/zeyns3fb?key=cb01eb11742914d2a3e8c0cd74d17e70";

export default function DailyCoinsPage() {
  const router = useRouter();
  
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  
  // Ad & Timer
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(15);
  const [isTabActive, setIsTabActive] = useState(true);

  // Success Modal State
  const [successState, setSuccessState] = useState<{ show: boolean; title: string; message: string }>({ show: false, title: '', message: '' });

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden && document.hasFocus());
    };
    
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    
    handleVisibility();

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_streak, last_daily_claim')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setCurrentStreak(profile.daily_streak || 0);
          
          if (profile.last_daily_claim) {
            const lastClaim = new Date(profile.last_daily_claim);
            const now = new Date();
            const isSameDay = 
              lastClaim.getUTCFullYear() === now.getUTCFullYear() &&
              lastClaim.getUTCMonth() === now.getUTCMonth() &&
              lastClaim.getUTCDate() === now.getUTCDate();
              
            setHasClaimedToday(isSameDay);
          }
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingAd && adTimer > 0) {
      interval = setInterval(() => {
        if (!isTabActive) {
          setAdTimer(prev => prev - 1);
        }
      }, 1000);
    } else if (isWatchingAd && adTimer <= 0) {
      setIsWatchingAd(false);
      executeClaim('boosted');
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, adTimer, isTabActive]);

  useEffect(() => {
    if (isWatchingAd && adTimer > 0) {
      document.title = `⏱️ (${adTimer}ث) جاري المضاعفة | Grodd SMM`;
    } else {
      document.title = 'لوحة التحكم | Grodd SMM';
    }
    return () => {
      document.title = 'لوحة التحكم | Grodd SMM';
    };
  }, [isWatchingAd, adTimer]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ec4899', '#f43f5e', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#f43f5e', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const initiateBoost = async () => {
    if (isClaiming || hasClaimedToday) return;

    const isBlocked = await checkAdBlock();
    if (isBlocked) {
      Swal.fire({
        title: 'مانع الإعلانات مفعل!',
        text: 'يبدو أنك تستخدم مانع إعلانات (AdBlock). هذه الخدمة مجانية وتعتمد على الإعلانات لتغطية التكاليف. يرجى تعطيل مانع الإعلانات للاستمرار.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ترقية الحساب (VIP)',
        cancelButtonText: 'إغلاق',
        background: '#121214',
        color: '#ffffff',
        confirmButtonColor: '#a855f7',
        cancelButtonColor: '#334155',
        customClass: {
          popup: 'border border-white/5 rounded-3xl',
          confirmButton: 'rounded-xl font-black px-6 py-3',
          cancelButton: 'rounded-xl font-black px-6 py-3'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/remove-ads');
        }
      });
      return;
    }

    window.open(SMART_LINK_URL, '_blank');
    setIsWatchingAd(true);
    setAdTimer(15);
    setIsTabActive(false);
  };

  const executeClaim = async (type: 'base' | 'boosted') => {
    if (isClaiming || hasClaimedToday) return;
    setIsClaiming(true);

    try {
      const res = await fetch('/api/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      const data = await res.json();

      if (res.ok) {
        setHasClaimedToday(true);
        setCurrentStreak(data.newStreak);
        
        let message = `حصلت على ${data.pointsAdded} نقطة بنجاح!`;
        if (data.chestOpened) {
          message = `تهانينا! لقد فتحت الصندوق الغامض وحصلت على ${data.pointsAdded} نقطة! 🎉`;
        }
        
        setSuccessState({ show: true, title: 'نجاح!', message });
        triggerConfetti();
        
        router.refresh(); 
        window.dispatchEvent(new Event('pointsUpdated')); 
      } else {
        setSuccessState({ show: true, title: 'عذراً', message: data.error || "Failed to claim reward." });
      }
    } catch (err) {
      console.error(err);
      setSuccessState({ show: true, title: 'خطأ بالاتصال', message: "الرجاء المحاولة مرة أخرى." });
    } finally {
      setIsClaiming(false);
    }
  };

  const renderStreakDays = () => {
    const days = [1, 2, 3, 4, 5];
    return (
      <div className="relative w-full my-12 flex justify-between items-center z-0 px-2 md:px-8">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -z-10 rounded-full mx-6 md:mx-16 transform -translate-y-1/2"></div>
        {/* Active Line (RTL) */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(Math.min(currentStreak, 4) / 4) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-1/2 right-0 h-1 bg-gradient-to-l from-pink-600 to-rose-400 -z-10 rounded-full mx-6 md:mx-16 transform -translate-y-1/2 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
        ></motion.div>

        {days.map((day, idx) => {
          const isAchieved = day <= currentStreak;
          const isNext = day === currentStreak + 1 && !hasClaimedToday;
          const isChest = day === 5;
          
          return (
            <motion.div 
              key={day} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex flex-col items-center"
            >
              {/* Day Bubble */}
              <div 
                className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl border-2 shadow-xl backdrop-blur-md transition-all duration-300
                  ${isAchieved ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 
                    isNext ? 'bg-white/10 border-white/30 text-white/90 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 
                    'bg-black/40 border-white/5 text-white/20'}`}
              >
                <i className={`fas ${isChest ? 'fa-treasure-chest text-yellow-500' : 'fa-fire'}`}></i>
              </div>
              {/* Label */}
              <div className={`mt-3 text-xs md:text-sm font-bold ${isAchieved ? 'text-pink-400' : isNext ? 'text-white' : 'text-slate-600'}`}>
                اليوم {day}
              </div>
              {/* Checkmark */}
              {isAchieved && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-[#121214] shadow-lg"
                >
                  <i className="fas fa-check"></i>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-32">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 relative z-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4"
      >
        <div className="inline-block px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-bold mb-2">
          💰 نقاط مجانية كل يوم
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-xl">
          المكافآت <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">اليومية</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          سجل دخولك يومياً لجمع النقاط. استخدم زر <span className="text-pink-400 font-bold">المضاعفة x3</span> لجمع النقاط بسرعة وبناء سلسلة الأيام لفتح الصندوق الغامض!
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-[#1c1c1e] to-[#121214] border border-white/5 p-6 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden text-center max-w-3xl mx-auto"
      >
        {/* Glow Effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-2 relative z-10">سلسلة المضاعفة 🚀</h2>
        <p className="text-sm md:text-base text-slate-400 relative z-10">اجمع المكافأة المضاعفة <span className="text-pink-400 font-bold">5 أيام متتالية</span> لفتح الصندوق!</p>

        {renderStreakDays()}

        <AnimatePresence mode="wait">
          {successState.show ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8 rounded-3xl max-w-lg mx-auto backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-3xl text-green-400"></i>
              </div>
              <h3 className="text-2xl font-black text-green-400 mb-2">{successState.title}</h3>
              <p className="text-slate-300 text-lg">{successState.message}</p>
              <p className="text-slate-500 text-sm mt-4 font-medium">عُد غداً للحصول على المزيد!</p>
            </motion.div>
          ) : hasClaimedToday ? (
            <motion.div 
              key="claimed"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-lg mx-auto backdrop-blur-sm"
            >
              <i className="fas fa-clock text-4xl text-slate-400 mb-4"></i>
              <h3 className="text-xl font-bold text-white mb-2">تم استلام المكافأة اليوم</h3>
              <p className="text-slate-400">لقد قمت بجمع مكافأتك بالفعل. عُد غداً لإكمال السلسلة!</p>
            </motion.div>
          ) : isWatchingAd ? (
            <motion.div 
              key="ad"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 rounded-3xl flex flex-col items-center max-w-lg mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                  animate={{ width: isTabActive ? '0%' : `${((15 - adTimer) / 15) * 100}%` }}
                />
              </div>

              {isTabActive ? (
                <>
                  <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-pause text-3xl text-yellow-500 animate-pulse"></i>
                  </div>
                  <h3 className="text-2xl font-black text-yellow-500 mb-3">العداد متوقف! ⏸️</h3>
                  <p className="text-slate-300 text-lg leading-relaxed">يرجى العودة إلى صفحة الإعلان التي فُتحت للتو والبقاء هناك حتى ينتهي الوقت.</p>
                </>
              ) : (
                <>
                  <div className="relative w-24 h-24 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                      <circle 
                        cx="48" cy="48" r="45" fill="none" stroke="#ec4899" strokeWidth="6"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * ((15 - adTimer) / 15))}
                        className="transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{adTimer}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-pink-400 mb-2">جاري التحقق...</h3>
                  <p className="text-slate-400">لا تغلق صفحة الإعلان، يتم تجهيز المكافأة المضاعفة.</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-2xl mx-auto"
            >
              <button 
                onClick={() => executeClaim('base')}
                disabled={isClaiming}
                className="group flex-1 py-6 rounded-3xl font-black text-slate-300 bg-[#2C2C2E] border border-white/5 hover:bg-[#3C3C3E] hover:border-white/10 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden"
              >
                <i className="fas fa-coins text-2xl text-slate-400 group-hover:text-yellow-500 transition-colors"></i>
                <span className="text-xl">مكافأة عادية</span>
                <span className="text-xs font-bold text-slate-500 bg-black/30 px-3 py-1 rounded-full">+10 نقاط فقط</span>
              </button>
              
              <button 
                onClick={initiateBoost}
                disabled={isClaiming}
                className="group flex-[2] py-6 rounded-3xl font-black text-white bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 transition-all flex flex-col items-center justify-center gap-2 shadow-[0_10px_40px_rgba(236,72,153,0.4)] border-2 border-pink-400/50 hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-rocket text-3xl animate-bounce"></i>
                  <span className="text-2xl md:text-3xl">ضاعف المكافأة x3</span>
                </div>
                <span className="text-sm font-bold text-pink-100 bg-black/20 px-4 py-1.5 rounded-full mt-1 backdrop-blur-md">
                  +30 نقطة (يتطلب الانتظار 15 ثانية)
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}

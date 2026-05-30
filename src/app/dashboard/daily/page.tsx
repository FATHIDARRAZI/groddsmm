'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

const SMART_LINK_URL = "https://evacuateenclose.com/zeyns3fb?key=cb01eb11742914d2a3e8c0cd74d17e70";

export default function DailyCoinsPage() {
  const router = useRouter();
  
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  
  // To handle the boost mechanic delay
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(15); // Wait 15s for boosted

  const [isTabActive, setIsTabActive] = useState(true);

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

  // Timer Effect for Boosted Claim
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingAd && adTimer > 0) {
      interval = setInterval(() => {
        if (!isTabActive) {
          setAdTimer(prev => prev - 1);
        }
      }, 1000);
    } else if (isWatchingAd && adTimer <= 0) {
      // Execute claim once timer finishes
      setIsWatchingAd(false);
      executeClaim('boosted');
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, adTimer, isTabActive]);

  // Update document title with daily timer
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

  const initiateBoost = () => {
    if (isClaiming || hasClaimedToday) return;
    window.open(SMART_LINK_URL, '_blank');
    setIsWatchingAd(true);
    setAdTimer(15);
    setIsTabActive(false); // Immediately start counting!
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
        
        let message = `نجاح! حصلت على ${data.pointsAdded} نقطة.`;
        if (data.chestOpened) {
          message += ' لقد فتحت الصندوق الغامض وحصلت على الجائزة الكبرى!';
        }
        alert(message);
        
        router.refresh(); 
        window.dispatchEvent(new Event('pointsUpdated')); 
      } else {
        alert(data.error || "Failed to claim reward.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsClaiming(false);
    }
  };

  const renderStreakDays = () => {
    const days = [1, 2, 3, 4, 5];
    return (
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 my-8">
        {days.map(day => {
          const isAchieved = day <= currentStreak;
          const isNext = day === currentStreak + 1 && !hasClaimedToday;
          const isChest = day === 5;
          
          return (
            <div key={day} className={`flex flex-col items-center p-3 md:p-4 rounded-xl border ${isAchieved ? 'border-pink-500 bg-pink-500/10' : isNext ? 'border-white/20 bg-white/5 animate-pulse' : 'border-white/5 bg-[#1C1C1E] opacity-50'} w-20 md:w-24 relative overflow-hidden transition-all`}>
              <div className="text-[10px] text-slate-400 font-bold mb-2 tracking-widest uppercase">اليوم {day}</div>
              <i className={`fas ${isChest ? 'fa-treasure-chest' : 'fa-fire'} text-2xl md:text-3xl ${isAchieved ? 'text-pink-500' : 'text-slate-600'}`}></i>
              {isAchieved && (
                <div className="absolute -bottom-1 -right-1 text-green-500 bg-[#0B0F19] rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-green-500">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="w-full flex justify-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in relative z-10 pt-4">
      
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
          المكافآت <span className="text-pink-500">اليومية</span>
        </h1>
        <p className="text-slate-400 font-bold text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          سجل دخولك يومياً واحصل على نقاط مجانية. استخدم الرابط الممول لمضاعفة مكافأتك 3 أضعاف وبناء سلسلة الانتصارات للحصول على الصندوق الغامض!
        </p>
      </div>

      <div className="bg-[#121214] border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center max-w-3xl mx-auto">
        
        <h2 className="text-2xl font-black text-white mb-2">سلسلة المضاعفة 🚀</h2>
        <p className="text-sm text-slate-500">اجمع المكافأة المضاعفة 5 أيام متتالية لفتح الصندوق!</p>

        {renderStreakDays()}

        {hasClaimedToday ? (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl animate-fade-in">
            <i className="fas fa-check-circle text-5xl text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"></i>
            <h3 className="text-2xl font-black text-green-400 mb-2">تم الاستلام بنجاح</h3>
            <p className="text-slate-400 font-bold">عُد غداً للحصول على مكافأتك القادمة!</p>
          </div>
        ) : isWatchingAd ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-2xl flex flex-col items-center">
            {isTabActive ? (
              <>
                <i className="fas fa-pause text-5xl text-yellow-500 mb-4 animate-bounce"></i>
                <h3 className="text-2xl font-black text-yellow-500 mb-2">متوقف مؤقتاً</h3>
                <p className="text-slate-400 font-bold">يرجى العودة إلى صفحة الإعلان لإكمال العداد.</p>
              </>
            ) : (
              <>
                <i className="fas fa-spinner fa-spin text-5xl text-pink-500 mb-4"></i>
                <h3 className="text-2xl font-black text-pink-500 mb-2">جاري التحقق...</h3>
                <p className="text-slate-300 font-bold text-xl mb-2">{adTimer} ثانية</p>
                <p className="text-slate-500 text-sm">لا تغلق صفحة الإعلان حتى ينتهي الوقت.</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-2xl mx-auto">
            <button 
              onClick={() => executeClaim('base')}
              disabled={isClaiming}
              className="flex-1 py-5 rounded-2xl font-black text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-1 shadow-inner active:scale-95"
            >
              <span className="text-lg">مكافأة عادية</span>
              <span className="text-sm font-bold text-slate-500">+10 نقاط (بدون سلسلة)</span>
            </button>
            
            <button 
              onClick={initiateBoost}
              disabled={isClaiming}
              className="flex-[2] py-5 rounded-2xl font-black text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 transition-all flex flex-col items-center justify-center gap-1 shadow-[0_0_30px_rgba(236,72,153,0.3)] border border-pink-400/50 active:scale-95"
            >
              <span className="text-2xl flex items-center gap-2"><i className="fas fa-rocket"></i> ضاعف المكافأة x3</span>
              <span className="text-sm font-bold text-pink-200">+30 نقطة & زيادة السلسلة</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { createSupabaseClient } from '@/lib/supabase';
import SafeAdSlot from '@/components/SafeAdSlot';

export default function FollowersPage() {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [quantity, setQuantity] = useState(100);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  
  const [privateAlertMsg, setPrivateAlertMsg] = useState<string | null>(null);

  const [showAdModal, setShowAdModal] = useState(false);
  const [adWaitTime, setAdWaitTime] = useState(0);
  const [removeAds, setRemoveAds] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [serviceConfig, setServiceConfig] = useState<any>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserPoints();
    fetchServiceConfig();
  }, []);

  const fetchServiceConfig = async () => {
    const { data } = await supabase.from('services')
      .select('provider_cost_per_1000, markup_multiplier, min_quantity, max_quantity')
      .eq('category', 'instagram')
      .eq('service_type', 'followers')
      .single();
    if (data) setServiceConfig(data);
  };

  const fetchUserPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('points_balance, remove_ads').eq('id', user.id).single();
      if (profile) {
        setUserPoints(profile.points_balance);
        setRemoveAds(profile.remove_ads);
      }
    }
  };

  const calculateCost = (qty: number) => {
    if (!serviceConfig) return qty * 2; // fallback
    const cost = serviceConfig.provider_cost_per_1000 || 0.10;
    const markup = serviceConfig.markup_multiplier || 3.0;
    return Math.ceil((qty / 1000) * cost * 1000 * markup);
  };

  const getMaxAffordableQty = () => {
    if (!serviceConfig || userPoints <= 0) return serviceConfig?.min_quantity || 10;
    const cost = serviceConfig.provider_cost_per_1000 || 0.10;
    const markup = serviceConfig.markup_multiplier || 3.0;
    const costPerItem = cost * markup;
    const affordable = Math.floor(userPoints / costPerItem);
    const roundedAffordable = Math.floor(affordable / 10) * 10;
    
    const absoluteMax = serviceConfig.max_quantity || 100000;
    const minQty = serviceConfig.min_quantity || 10;
    
    if (roundedAffordable < minQty) return minQty;
    return Math.min(roundedAffordable, absoluteMax);
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const handleFetchProfile = async () => {
    if (!targetUsername) return;
    
    setIsFetchingProfile(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/ig-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername })
      });
      const data = await res.json();
      
      if (data.success) {
        setProfileData(data.data);
        setShowTargetModal(false);
      } else {
        setErrorMsg(data.error || 'فشل جلب بيانات الحساب');
      }
    } catch (e) {
      setErrorMsg('حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const postAdAction = async () => {
    setShowAdModal(false);
    executeOrder();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdModal && adWaitTime > 0) {
      timer = setInterval(() => setAdWaitTime(p => p - 1), 1000);
    } else if (showAdModal && adWaitTime === 0) {
      postAdAction();
    }
    return () => clearInterval(timer);
  }, [showAdModal, adWaitTime]);

  const handleLaunch = () => {
    if (!profileData) return setErrorMsg('الرجاء اختيار الهدف أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');
    if (profileData.is_private) {
       setPrivateAlertMsg(profileData.private_error_message || 'حساب خاص!');
       return;
    }

    if (removeAds) {
      postAdAction();
    } else {
      setAdWaitTime(10);
      setShowAdModal(true);
    }
  };

  const executeOrder = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          link: targetUsername, 
          serviceType: 'followers', 
          category: 'instagram', 
          recaptchaToken, 
          quantity: quantity,
          totalCost: quantity * 2 
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecaptchaToken('');
        fetchUserPoints();
        alert(data.message);
        // Dispatch event to update points in layout
        window.dispatchEvent(new Event('pointsUpdated'));
      } else {
        setErrorMsg(data.error);
        setRecaptchaToken('');
        setTurnstileKey(prev => prev + 1);
      }
    } catch (e) { 
      setErrorMsg('فشل إرسال الطلب'); 
      setRecaptchaToken('');
      setTurnstileKey(prev => prev + 1);
    }
    finally { 
      setIsProcessing(false); 
      setShowAdModal(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in relative z-10 pb-10">
        
        <div className="w-full text-center">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              زيادة <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">متابعين انستقرام</span>
           </h1>
        </div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-10 border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-3xl shadow-2xl">
           
           {!profileData ? (
             <div className="flex flex-col items-center justify-center py-10 gap-6">
                <div className="w-24 h-24 rounded-full bg-pink-500/10 flex flex-col justify-center items-center text-pink-500 mb-4">
                   <i className="fas fa-user-plus text-4xl mb-1"></i>
                </div>
                <button 
                  onClick={() => setShowTargetModal(true)}
                  className="w-full max-w-xs py-4 rounded-full font-bold text-slate-900 dark:text-white border-2 border-slate-200 dark:border-[#2A2A2D] hover:bg-slate-100 dark:hover:bg-[#1C1C1E] transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-user-circle text-pink-500"></i>
                  اختر الهدف
                </button>
             </div>
           ) : (
             <div className="flex flex-col gap-8">
                {/* Profile Card */}
                <div className="bg-slate-50 dark:bg-[#121214] rounded-2xl w-full p-4 flex items-center gap-4 border border-black/5 dark:border-white/5 shadow-inner relative">
                  <button 
                    onClick={() => { setProfileData(null); setTargetUsername(''); }}
                    className="absolute top-4 left-4 text-xs font-bold text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    تغيير
                  </button>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shrink-0">
                     <img 
                       src={profileData.profile_pic || `https://ui-avatars.com/api/?name=${profileData.username}&background=random`} 
                       alt="Avatar" 
                       referrerPolicy="no-referrer"
                       className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                     />
                  </div>
                  <div className="flex-1 dir-rtl text-right overflow-hidden">
                     <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">{profileData.full_name || profileData.username}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 truncate dir-ltr text-right">@{profileData.username}</p>
                     <div className="flex gap-3 text-xs font-bold justify-start mt-1">
                        <span className="text-slate-900 dark:text-white">{formatNumber(profileData.followers)} <span className="text-slate-500 font-normal">متابع</span></span>
                        <span className="text-slate-900 dark:text-white">{formatNumber(profileData.posts)} <span className="text-slate-500 font-normal">منشور</span></span>
                     </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-slate-100 dark:bg-black/40 p-8 rounded-[2rem] border border-black/5 dark:border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-slate-900 dark:text-white">{calculateCost(quantity)}</span></span>
                    <span className="text-sm font-black text-pink-500 uppercase">الكمية: <span className="text-slate-900 dark:text-white">{formatNumber(quantity)}</span></span>
                  </div>
                  <input 
                    type="range" 
                    min={serviceConfig?.min_quantity || 10} 
                    max={getMaxAffordableQty()} 
                    step={10} 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full accent-pink-500" 
                  />
                </div>

                {/* Info Note */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                   <div className="mt-0.5 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <i className="fas fa-info text-yellow-500 text-xs"></i>
                   </div>
                   <div className="text-right flex-1">
                      <h4 className="text-yellow-500 font-bold text-sm mb-1">ملاحظة هامة</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        يتم إرسال المتابعين تدريجياً وبشكل آمن، وقد يستغرق اكتمال الطلب حتى 24 ساعة.
                      </p>
                   </div>
                </div>

                {/* Private Warning */}
                {profileData.is_private && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 mt-2">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-lock text-red-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-red-500 font-bold text-sm mb-1">حساب خاص (Private)</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                          هذا الحساب خاص. يرجى تحويله إلى عام (Public) لتتمكن من استخدام أدواتنا. لا يمكن إرسال المتابعين لحساب خاص.
                        </p>
                     </div>
                  </div>
                )}

                <div className="flex flex-col items-center gap-4 mt-2">
                   <div className="p-4 rounded-[2rem] bg-slate-50 dark:bg-black/60 border border-black/5 dark:border-white/5 flex justify-center min-h-[85px] items-center">
                     <Turnstile
                        key={turnstileKey}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                        onSuccess={(token: string) => setRecaptchaToken(token)}
                        options={{ theme: 'dark' }}
                     />
                   </div>
                   {errorMsg && <p className="text-pink-500 text-sm font-black animate-pulse">{errorMsg}</p>}
                </div>

                <button 
                  onClick={handleLaunch} 
                  disabled={isProcessing || profileData.is_private} 
                  className={`w-full py-6 rounded-[2rem] font-black text-white text-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                    profileData.is_private 
                      ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-70' 
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 
                   profileData.is_private ? <span>افتح الحساب للطلب</span> : <span>اطلب الآن</span>}
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Target Username Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowTargetModal(false)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             
             <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-6">
                <i className="fas fa-user-search text-3xl"></i>
             </div>
             
             <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">أدخل اسم المستخدم</h2>
             
             <div className="w-full relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl font-mono">@</span>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-left text-slate-900 dark:text-white font-outfit text-lg focus:outline-none focus:border-pink-500/50 transition-colors"
                  dir="ltr"
                  autoFocus
                />
             </div>

             {errorMsg && <p className="text-pink-500 text-sm font-bold mb-4 w-full text-center">{errorMsg}</p>}

             <div className="flex w-full gap-3 dir-rtl">
                <button 
                  onClick={handleFetchProfile} 
                  disabled={isFetchingProfile || !targetUsername}
                  className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex justify-center items-center disabled:opacity-50"
                >
                  {isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : 'موافق (OK)'}
                </button>
                <button 
                  onClick={() => setShowTargetModal(false)} 
                  className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all"
                >
                  إلغاء
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Private Alert Modal */}
      {privateAlertMsg && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setPrivateAlertMsg(null)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <i className="fas fa-lock text-red-500 text-2xl"></i>
             </div>
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">حساب خاص!</h3>
             <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">{privateAlertMsg}</p>
             <button 
               onClick={() => setPrivateAlertMsg(null)} 
               className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-lg hover:scale-[1.02] transition-all"
             >
               فهمت، سأقوم بتغييره
             </button>
           </div>
        </div>
      )}

      {/* Ad Wait Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl animate-fade-in"></div>
          <div className="relative z-10 w-full max-w-[420px] flex flex-col animate-slide-up bg-[#0A0A0A] border border-red-500/20 rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
                style={{ width: `${Math.min(100, (adWaitTime / 10) * 100)}%` }}
              ></div>
            </div>
            <div className="w-full flex justify-between items-center mb-6 pt-2">
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-xs font-black text-red-400 tracking-wider">
                  {adWaitTime > 0 ? `يرجى الانتظار ${adWaitTime}ث` : 'جاري التنفيذ...'}
                </span>
              </div>
              <div className="bg-white/5 px-4 py-1.5 rounded-full">
                <span className="text-xs font-bold text-slate-400">إعلان سبونسر</span>
              </div>
            </div>
            <div className="w-full flex justify-center mb-6">
              <div className="w-[300px] h-[250px] bg-[#050505] rounded-2xl overflow-hidden border border-white/5 relative flex justify-center items-center">
                <SafeAdSlot src="/ad-300.html" width="300" height="250" className="mx-auto" loading="lazy" />
              </div>
            </div>
            <div className="w-full text-center px-2">
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4 font-medium">
                شكراً لدعمك المنصة! مشاهدة الإعلانات تساعدنا على إبقاء الخدمات مجانية ومنخفضة التكلفة للجميع.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

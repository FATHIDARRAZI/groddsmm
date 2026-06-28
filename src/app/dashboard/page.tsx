'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
// import ReCAPTCHA from 'react-google-recaptcha';
import { createSupabaseClient } from '@/lib/supabase';
import SafeAdSlot from '@/components/SafeAdSlot';



const SOCIAL_CATEGORIES = [
  { id: 'instagram', icon: 'fa-instagram', color: 'text-[#E1306C]', name: 'انستقرام' },
  { id: 'tiktok', icon: 'fa-tiktok', color: 'text-white', name: 'تيك توك' },
  { id: 'facebook', icon: 'fa-facebook', color: 'text-[#1877F2]', name: 'فيسبوك' },
  { id: 'youtube', icon: 'fa-youtube', color: 'text-[#FF0000]', name: 'يوتيوب' },
];

export default function DashboardHome() {
  const [category, setCategory] = useState<string>('instagram');
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<'likes' | 'views' | 'followers'>('followers');
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [userPoints, setUserPoints] = useState(0);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [privateAlertMsg, setPrivateAlertMsg] = useState<string | null>(null);

  const [removeAds, setRemoveAds] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWaitTime, setAdWaitTime] = useState(0);

  const profileFetchPromise = useRef<Promise<any> | null>(null);

  const getLimits = useCallback(() => {
    if (category === 'instagram' && service === 'followers') return { min: 100, max: 100000 };
    if (category === 'tiktok' && service === 'likes') return { min: 10, max: 100000 };
    if (category === 'tiktok' && service === 'followers') return { min: 10, max: 10000000 };
    if (category === 'tiktok' && service === 'views') return { min: 100, max: 100000000 };
    if (category === 'facebook' && service === 'followers') return { min: 10, max: 2000000 };
    return { min: 100, max: 10000 };
  }, [category, service]);

  useEffect(() => {
    const limits = getLimits();
    if (quantity < limits.min) setQuantity(limits.min);
    if (quantity > limits.max) setQuantity(limits.max);
  }, [category, service, getLimits]);

  // Utility to format big numbers
  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserPoints();
  }, []);

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

  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';



  const postAdAction = async () => {
    setShowAdModal(false);
    if (service === 'followers' && category === 'instagram') {
      if (profileFetchPromise.current) {
         // Show spinner if somehow still loading
         setIsProcessing(true);
         const result = await profileFetchPromise.current;
         setIsProcessing(false);
         if (result.success) {
           setShowProfileConfirm(true);
         }
      }
    } else {
      executeOrder();
    }
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

  const executeOrder = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setShowProfileConfirm(false);
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          link: postLink, serviceType: service, category, recaptchaToken, 
          quantity: quantity,
          totalCost: service === 'followers' ? quantity * 2 : service === 'views' ? Math.ceil(quantity / 50) : quantity
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostLink(''); setRecaptchaToken('');
        fetchUserPoints();
        alert(data.message);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) { setErrorMsg('فشل إرسال الطلب'); }
    finally { 
      setIsProcessing(false); 
      setShowAdModal(false);
    }
  };

  const submitOrder = async () => {
    if (category === 'instagram' && service === 'followers' && profileData?.is_private) {
      setPrivateAlertMsg(profileData.private_error_message || 'هذا الحساب خاص (Private). يرجى تحويل الحساب إلى عام (Public) وإعادة المحاولة لاحقاً.');
      return;
    }
    
    setShowProfileConfirm(false);
    executeOrder();
  };

  const handleLaunch = async () => {
    if (!postLink || postLink === '@') return setErrorMsg(service === 'followers' ? 'الرجاء إدخال اسم المستخدم أولاً' : 'الرجاء إدخال الرابط أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');
    
    if (service === 'followers' && category === 'instagram') {
      setIsFetchingProfile(true);
      setErrorMsg('');
      const fetchPromise = fetch('/api/ig-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: postLink })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          setProfileData(data.data);
          return { success: true, data: data.data };
        } else {
          setErrorMsg(data.error || 'فشل جلب بيانات الحساب');
          return { success: false };
        }
      }).catch(() => {
        setErrorMsg('حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.');
        return { success: false };
      }).finally(() => {
        setIsFetchingProfile(false);
      });
      
      profileFetchPromise.current = fetchPromise;
    }

    if (removeAds) {
      postAdAction();
    } else {
      setAdWaitTime(10);
      setShowAdModal(true);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 animate-fade-in relative z-10 pb-20">
        
        {/* Centered Order Form */}
        <div className="w-full space-y-4 text-center">
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              إطلاق طلب <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">جديد</span>
           </h1>
        </div>

        <div className="glass-panel rounded-[3rem] p-10 md:p-14 border-white/5 bg-[#09090b]/80 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="space-y-10 relative z-10">
            {/* Category Selector */}
            <div className="flex flex-col gap-4 items-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">اختر المنصة</label>
              <div className="flex justify-center gap-3 md:gap-6">
                {SOCIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === 'facebook') setService('followers');
                    }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
                      category === cat.id 
                        ? 'bg-gradient-to-tr from-white/10 to-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/20 scale-110' 
                        : 'bg-black/40 border border-white/5 opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    title={cat.name}
                  >
                    <i className={`fab ${cat.icon} ${cat.color} text-2xl md:text-3xl drop-shadow-md group-hover:drop-shadow-xl transition-all`}></i>
                    {/* Optional text label below icon if needed later, kept minimal for now */}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black text-slate-500 uppercase px-2">
                {service === 'followers' ? 'اسم المستخدم (يوزرنيم)' : 'رابط المحتوى'}
              </label>
              <div className="relative">
                {service === 'followers' && (
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg font-mono">@</span>
                )}
                <input
                  type="text"
                  value={postLink}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (service === 'followers') {
                      // Remove @ if they typed it, we'll auto prefix it below for the value state
                      val = val.replace(/^@/, '');
                      if (val.length > 0) val = '@' + val;
                    }
                    setPostLink(val);
                  }}
                  placeholder={service === 'followers' ? 'username' : 'ضع الرابط هنا...'}
                  className={`w-full bg-black/60 border border-white/5 rounded-3xl py-6 pr-8 ${service === 'followers' ? 'pl-12' : 'pl-8'} text-right text-white font-outfit text-base focus:outline-none focus:border-pink-500/40 transition-all shadow-inner`}
                  dir={service === 'followers' ? 'ltr' : 'rtl'}
                />
              </div>
            </div>

            {category === 'youtube' ? (
              <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 text-center animate-fade-in shadow-xl mt-8">
                 <div className="w-20 h-20 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-6">
                   <i className="fab fa-youtube text-red-500 text-4xl"></i>
                 </div>
                 <h2 className="text-3xl font-black text-white mb-4 tracking-tight">قريباً جداً!</h2>
                 <p className="text-slate-400 font-bold text-lg">سيتم إضافة خدمات يوتيوب المميزة قريباً، شكراً لانتظارك.</p>
              </div>
            ) : (
              <>
                <div className={`grid ${category === 'facebook' ? 'grid-cols-1' : 'grid-cols-3'} gap-4 md:gap-8 mt-4`}>
                  <button onClick={() => { setService('followers'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'followers' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>متابعين</button>
                  {category !== 'facebook' && (
                    <>
                      <button onClick={() => { setService('likes'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'likes' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>إعجابات</button>
                      <button onClick={() => { setService('views'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'views' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>مشاهدات</button>
                    </>
                  )}
                </div>

                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-white">{service === 'followers' ? quantity * 2 : service === 'views' ? Math.ceil(quantity / 50) : quantity}</span></span>
                    <span className="text-xs font-black text-pink-500 uppercase">الكمية: <span className="text-white">{formatNumber(quantity)}</span></span>
                  </div>
                  <input type="range" min={getLimits().min} max={getLimits().max} step={getLimits().max > 1000000 ? 100 : 10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-full accent-pink-500" />
                </div>

                {category === 'facebook' && service === 'followers' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-info text-blue-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-blue-500 font-bold text-sm mb-1">ملاحظة بشأن سرعة التنفيذ</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          قد يتأخر وصول متابعين فيسبوك حتى <span className="text-white font-bold px-1 bg-white/10 rounded">24 ساعة</span>، يرجى التواصل معنا لتسريع الطلب إذا لزم الأمر.
                        </p>
                     </div>
                  </div>
                )}

                {category === 'instagram' && service === 'followers' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-info text-yellow-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-yellow-500 font-bold text-sm mb-1">ملاحظة هامة لحماية حسابك</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          يتم إرسال المتابعين بشكل تدريجي وآمن لضمان توافقها مع خوارزميات المنصة. قد يستغرق اكتمال الطلب <span className="text-white font-bold px-1 bg-white/10 rounded">24 ساعة أو أقل</span>.
                        </p>
                     </div>
                  </div>
                )}
              </>
            )}

            {category !== 'youtube' && (
              <>
                <div className="flex flex-col items-center gap-4 mt-6">
                   <div className="p-4 rounded-[2.5rem] bg-black/60 border border-white/5 scale-90">
                     {/* <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" /> */}
                     <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                        onSuccess={(token: string) => setRecaptchaToken(token)}
                        options={{ theme: 'dark' }}
                     />
                   </div>
                   {errorMsg && <p className="text-pink-500 text-xs font-black animate-pulse">{errorMsg}</p>}
                </div>

                <button onClick={handleLaunch} disabled={isProcessing || isFetchingProfile} className="w-full py-7 rounded-[2.5rem] font-black text-white text-xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 mt-4">
                  {isProcessing || isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : <span>إطلاق الطلب الآن</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Confirmation Modal */}
      {showProfileConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowProfileConfirm(false)}></div>
           <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 max-w-md w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             <button onClick={() => setShowProfileConfirm(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 transition-all">
                <i className="fas fa-times text-sm"></i>
             </button>
             
             <h2 className="text-2xl font-black text-white mb-2">هل هذا هو حسابك حقاً؟</h2>
             <p className="text-slate-400 text-sm text-center mb-6">يرجى التأكيد لنتمكن من إتمام طلبك بشكل صحيح.</p>
             
             <div className="bg-[#0B0F19] rounded-2xl w-full p-4 flex items-center gap-4 mb-8 border border-white/5 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shrink-0">
                   <img 
                     src={profileData?.profile_pic || `https://ui-avatars.com/api/?name=${postLink.replace('@', '')}&background=random`} 
                     alt="Avatar" 
                     referrerPolicy="no-referrer"
                     className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                     onError={(e) => {
                       e.currentTarget.src = `https://ui-avatars.com/api/?name=${postLink.replace('@', '')}&background=random`;
                     }}
                   />
                </div>
                <div className="flex-1 dir-rtl text-right overflow-hidden">
                   <h3 className="text-white font-bold text-lg truncate">{profileData?.full_name || postLink.replace('@', '')}</h3>
                   <p className="text-slate-400 text-sm mb-1 truncate dir-ltr text-right">@{profileData?.username || postLink.replace('@', '')}</p>
                   <div className="flex gap-3 text-xs font-bold justify-start mt-1">
                      <span className="text-white">{formatNumber(profileData?.followers)} <span className="text-slate-500 font-normal">متابع</span></span>
                      <span className="text-white">{formatNumber(profileData?.following)} <span className="text-slate-500 font-normal">يتابع</span></span>
                      <span className="text-white">{formatNumber(profileData?.posts)} <span className="text-slate-500 font-normal">منشور</span></span>
                   </div>
                </div>
             </div>

             <div className="flex w-full gap-3 dir-rtl">
                <button onClick={submitOrder} className="flex-[2] bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                  نعم، هذا حسابي <i className="fas fa-check text-sm mt-0.5"></i>
                </button>
                <button onClick={() => setShowProfileConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all">
                  تغيير الحساب
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Custom Private Account Alert Modal */}
      {privateAlertMsg && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPrivateAlertMsg(null)}></div>
           <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center text-center">
             
             <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <i className="fas fa-lock text-red-500 text-2xl"></i>
             </div>
             
             <h3 className="text-xl font-black text-white mb-3">حساب خاص!</h3>
             <p className="text-slate-400 text-sm leading-relaxed mb-8">{privateAlertMsg}</p>
             
             <button 
               onClick={() => {
                 setPrivateAlertMsg(null);
                 window.location.reload();
               }} 
               className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
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
          
          <div className="relative z-10 w-full max-w-[420px] flex flex-col animate-slide-up bg-[#0A0A0A] border border-red-500/20 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(220,38,38,0.05)] overflow-hidden">
            
            {/* Animated Progress Line at the very top of the modal */}
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
              <div className="w-[300px] h-[250px] bg-[#050505] rounded-2xl overflow-hidden border border-white/5 relative flex justify-center items-center shadow-lg shadow-black/50">
                <SafeAdSlot src="/ad-300.html" width="300" height="250" className="mx-auto" loading="lazy" />
              </div>
            </div>

            <div className="w-full text-center px-2">
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4 font-medium">
                شكراً لدعمك المنصة! مشاهدة الإعلانات تساعدنا على إبقاء الخدمات مجانية ومنخفضة التكلفة للجميع.
              </p>
              
              <div className="bg-[#1A0505] border border-red-900/30 rounded-2xl p-4 shadow-inner">
                <p className="text-red-500/90 text-[11px] font-black leading-relaxed">
                  إخلاء مسؤولية: الإعلانات غير تابعة لنا. يرجى عدم إيداع الأموال أو ممارسة القمار أو التداول فيها.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      )}


    </>
  );
}

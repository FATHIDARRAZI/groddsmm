'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import SafeAdSlot from '@/components/SafeAdSlot';
import { createSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';

type ServiceType = 'likes' | 'views' | 'followers';

export default function HomeClientForm() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [service, setService] = useState<ServiceType>('followers');
  const [step, setStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [sponsorTimeLeft, setSponsorTimeLeft] = useState(0);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [removeAds, setRemoveAds] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkRemoveAds() {
      const supabase = createSupabaseClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase.from('profiles').select('remove_ads').eq('id', user.id).single();
        if (profile?.remove_ads) {
          setRemoveAds(true);
        }
      }
    }
    checkRemoveAds();
  }, []);

  useEffect(() => {
    const savedCooldown = localStorage.getItem('smm_cooldown');
    if (savedCooldown) {
      const remainingMs = parseInt(savedCooldown, 10) - Date.now();
      if (remainingMs > 0) {
        setTimeout(() => {
          setTimeLeft(Math.ceil(remainingMs / 1000));
          setStep(3);
        }, 0);
      } else {
        localStorage.removeItem('smm_cooldown');
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && step === 3) {
      localStorage.removeItem('smm_cooldown');
      window.location.reload();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleFetchProfile = async () => {
    if (!username.trim()) {
      setErrorMsg('الرجاء إدخال اسم المستخدم (Username)');
      return;
    }
    setErrorMsg('');
    setIsFetchingProfile(true);
    setProfile(null);

    try {
      const res = await fetch('/api/ig-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        if (data.data.is_private) {
          setErrorMsg(data.data.private_error_message || 'الحساب خاص. يرجى تحويله إلى عام.');
        } else {
          setProfile(data.data);
        }
      } else {
        setErrorMsg(data.error || 'تعذر العثور على الحساب. تأكد من اسم المستخدم.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ في جلب بيانات الحساب.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const submitSmmRequest = useCallback(async () => {
    try {
      let finalLink = username.trim();
      
      if (service === 'likes' || service === 'views') {
        if (!profile?.recent_posts || profile.recent_posts.length === 0) {
          setErrorMsg('لا يوجد منشورات حديثة في هذا الحساب لتطبيق الخدمة عليها.');
          setStep(1);
          return;
        }
        finalLink = profile.recent_posts[0].url;
      }

      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: finalLink, serviceType: service, category: 'instagram', recaptchaToken })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.cooldownEnd) {
          const remainingMs = data.cooldownEnd - Date.now();
          if (remainingMs > 0) {
            localStorage.setItem('smm_cooldown', data.cooldownEnd.toString());
            setTimeLeft(Math.ceil(remainingMs / 1000));
            setStep(3);
            return;
          }
        }
        setErrorMsg(data.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
        setStep(1);
        return;
      }
      
      const targetTime = Date.now() + (2 * 60 * 1000);
      localStorage.setItem('smm_cooldown', targetTime.toString());
      setTimeLeft(2 * 60);
      setStep(3);
      setShowUnlockModal(true);
      setUsername('');
      setProfile(null);
      setRecaptchaToken('');
    } catch (err) {
      setErrorMsg('فشل الاتصال بالخادم.');
    }
  }, [username, service, recaptchaToken, profile]);

  const handleStartProcess = () => {
    if (!profile) {
      setErrorMsg('الرجاء البحث عن الحساب أولاً');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (!recaptchaToken) {
      setErrorMsg('الرجاء إكمال التحقق البشري أولاً');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setErrorMsg('');
    if (removeAds) {
      submitSmmRequest();
    } else {
      setStep(1.5);
      setSponsorTimeLeft(30);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 1.5 && sponsorTimeLeft > 0) {
      timer = setInterval(() => {
        setSponsorTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 1.5 && sponsorTimeLeft <= 0) {
      setTimeout(() => submitSmmRequest(), 0);
    }
    return () => clearInterval(timer);
  }, [step, sponsorTimeLeft, submitSmmRequest]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-3xl bg-slate-900 rounded-2xl p-8 sm:p-12 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 z-10 mx-auto transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-blue-500/80 to-transparent rounded-tl-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {(step === 1 || step === 1.5) && (
          <div className={`space-y-6 transition-all duration-500 relative ${step === 1.5 ? 'blur-sm pointer-events-none opacity-50' : 'animate-fade-in'}`}>
            
            <div className="flex flex-col gap-3 relative mb-6">
              <label className="text-sm font-bold text-slate-400 tracking-widest block text-right w-full mb-2">اسم المستخدم (Username)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500 font-bold">
                    <i className="fas fa-at text-xl"></i>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if(profile) setProfile(null);
                    }}
                    placeholder="مثال: cristiano"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pr-14 pl-4 text-left dir-ltr text-white text-lg placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                  />
                </div>
                <button
                  onClick={handleFetchProfile}
                  disabled={isFetchingProfile || !username.trim()}
                  className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                  <span className="hidden sm:inline">بحث</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm text-center font-bold mb-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {errorMsg}
              </div>
            )}

            {profile && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center gap-4 animate-fade-in mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50 relative shrink-0">
                  {profile.profile_pic ? (
                    <Image src={profile.profile_pic} alt={profile.username} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400"><i className="fas fa-user"></i></div>
                  )}
                </div>
                <div className="flex flex-col text-right flex-1 min-w-0">
                  <span className="text-white font-bold truncate text-lg dir-ltr text-left w-fit" dir="ltr">@{profile.username}</span>
                  <span className="text-slate-400 text-sm truncate">{profile.full_name}</span>
                </div>
                <div className="text-center shrink-0 pl-2">
                  <div className="text-white font-black text-lg">{new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(profile.followers)}</div>
                  <div className="text-slate-500 text-xs">متابع</div>
                </div>
              </div>
            )}

            {profile && (
              <div className="flex flex-col gap-3 mt-4 animate-fade-in">
                <label className="text-sm font-bold text-slate-400 tracking-widest block text-right w-full mb-2">الخدمة المجانية (Service)</label>
                <div className="flex flex-col sm:flex-row bg-slate-950 p-1.5 rounded-xl w-full border border-slate-800 gap-1 sm:gap-0">
                  <button
                    onClick={() => setService('followers')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
                      service === 'followers' ? 'bg-blue-600 text-white shadow-sm border border-blue-500' : 'text-slate-500 hover:text-white border border-transparent'
                    }`}
                  >
                    <i className={`fas fa-user-plus text-lg ${service === 'followers' ? 'text-white' : 'text-slate-600'}`}></i> متابعين
                  </button>
                  <button
                    onClick={() => setService('likes')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
                      service === 'likes' ? 'bg-blue-600 text-white shadow-sm border border-blue-500' : 'text-slate-500 hover:text-white border border-transparent'
                    }`}
                  >
                    <i className={`fas fa-heart text-lg ${service === 'likes' ? 'text-white' : 'text-slate-600'}`}></i> لايكات
                  </button>
                  <button
                    onClick={() => setService('views')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
                      service === 'views' ? 'bg-blue-600 text-white shadow-sm border border-blue-500' : 'text-slate-500 hover:text-white border border-transparent'
                    }`}
                  >
                    <i className={`fas fa-eye text-lg ${service === 'views' ? 'text-white' : 'text-slate-600'}`}></i> مشاهدات
                  </button>
                </div>
              </div>
            )}

            {profile && (
              <div className="flex justify-center w-full my-8 max-w-full animate-fade-in">
                <div className="bg-slate-950 p-3 rounded-xl shadow-inner border border-slate-800 flex justify-center min-h-[85px] items-center">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                    onSuccess={(token: string) => setRecaptchaToken(token)}
                    onError={() => setErrorMsg('فشل التحقق، يرجى المحاولة مرة أخرى')}
                    options={{ theme: 'dark' }}
                  />
                </div>
              </div>
            )}

            {profile && (
              <button
                onClick={handleStartProcess}
                className="w-full py-5 mt-4 rounded-xl font-extrabold text-white text-xl bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 animate-fade-in"
              >
                بدء إطلاق الحملة <i className="fas fa-rocket text-lg"></i>
              </button>
            )}

            <div className="w-full flex items-center gap-4 mt-6">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-slate-500 text-xs font-bold px-2">أو اكتشف المزيد</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            {!isLoggedIn ? (
              <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/auth/login" className="flex-1 py-3 rounded-xl font-bold bg-white dark:bg-[#1C1C1E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-center flex justify-center items-center gap-2">
                  <i className="fas fa-sign-in-alt text-slate-500"></i> تسجيل الدخول
                </Link>
                <Link href="/auth/signup" className="flex-1 py-3 rounded-xl font-bold bg-[#ec4899]/10 text-[#ec4899] hover:bg-[#ec4899]/20 border border-[#ec4899]/20 transition-all text-center flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                  <i className="fas fa-user-plus"></i> إنشاء حساب
                </Link>
              </div>
            ) : (
              <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/dashboard" className="flex-1 py-3 rounded-xl font-bold bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 transition-all text-center flex justify-center items-center gap-2 shadow-md">
                  <i className="fas fa-layer-group text-[#FF8577]"></i> الانتقال إلى لوحة التحكم
                </Link>
              </div>
            )}

            <div className="w-full mt-4 p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3 text-right">
              <i className="fas fa-info-circle text-slate-400 mt-0.5"></i>
              <div className="text-xs text-slate-400 leading-relaxed">
                <strong>وكالة Grodd للحملات التسويقية مستقلة تماماً.</strong> حملاتنا تعمل وفق سياسات الاستخدام وتعتمد فقط على المحتوى العام لغايات التقييم والترويج. اقرأ المزيد &lt;&lt; <a href="#" className="text-purple-400 hover:text-purple-300 underline">سياسة الاستخدام للشركات</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === 1.5 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md transition-all"></div>
              
          <div className="relative z-10 w-full max-w-[728px] flex flex-col items-center animate-fade-in">
            <div className="w-full flex justify-between items-end mb-2">
              <div className="bg-white dark:bg-[#1C1C1E] px-3 py-1 rounded-t-lg border border-black/5 dark:border-white/5 border-b-0">
                <Link href="/dashboard/remove-ads" className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
              </div>
              <div className="bg-white dark:bg-[#1C1C1E] px-3 py-1 rounded-t-lg text-[#FF8577] text-[10px] font-bold tracking-widest cursor-not-allowed border border-black/5 dark:border-white/5 border-b-0 flex items-center gap-2 dir-ltr">
                <span>يرجى الانتظار {sponsorTimeLeft} ثانية</span>
                <i className="fas fa-times"></i>
              </div>
            </div>
            
            <div className="bg-white rounded-b-xl rounded-tl-xl shadow-[0_0_50px_rgba(255,133,119,0.1)] overflow-hidden flex flex-col items-center justify-center w-full min-h-[90px] md:min-h-[90px] border border-white/5 relative">
              <div className="hidden md:flex w-full items-center justify-center min-h-[90px]">
                <SafeAdSlot src="/ad-728.html" width="728" height="90" className="mx-auto" loading="lazy" />
              </div>
              <div className="flex md:hidden w-full items-center justify-center min-h-[250px] overflow-hidden max-w-full">
                <div className="scale-[0.9] sm:scale-100 origin-center flex justify-center items-center">
                  <SafeAdSlot src="/ad-300.html" width="300" height="250" className="mx-auto" loading="lazy" />
                </div>
              </div>
            </div>
            
            <div className="w-full mt-6 bg-white dark:bg-[#161618] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-4 flex justify-center items-center gap-2">
                <i className="fas fa-spinner fa-spin text-[#FF8577]"></i> جاري تحضير طلبك...
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center text-sm mb-6">
                يرجى عدم إغلاق هذه الصفحة. جاري التواصل مع السيرفرات وإرسال الطلب.
              </p>
              
              <div className="w-full bg-slate-100 dark:bg-[#0D0D0E] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] transition-all duration-1000 ease-linear"
                  style={{ width: `${((30 - sponsorTimeLeft) / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in py-10 relative z-10">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-check-circle text-5xl text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">تم إرسال طلبك بنجاح!</h2>
          
          <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-2xl border border-black/5 dark:border-white/5 w-full">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-bold">
              لقد وضعنا طلبك في طابور التنفيذ السريع.
            </p>
            <p className="text-slate-500 text-sm mt-3">
              الرجاء الانتظار قليلاً قبل إرسال طلب جديد.
            </p>
          </div>

          <div className="flex flex-col items-center bg-white dark:bg-black/30 w-full py-6 rounded-2xl border border-black/5 dark:border-white/5">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">الوقت المتبقي للطلب القادم</span>
            <span className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-outfit">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="w-full h-px bg-black/5 dark:bg-white/5 my-4"></div>
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                const target = document.getElementById('pricing-plans');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-4 rounded-xl font-bold bg-[#1F0A07] dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              🚀 تخطى الانتظار واشتري الآن
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

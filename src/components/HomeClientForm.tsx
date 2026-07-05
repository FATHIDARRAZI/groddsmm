'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import SafeAdSlot from '@/components/SafeAdSlot';
import { createSupabaseClient } from '@/lib/supabase';

type ServiceType = 'likes' | 'views';

const SOCIAL_CATEGORIES = [
  { id: 'instagram', icon: 'fa-instagram', color: 'text-[#E1306C]', name: 'انستقرام', size: 'text-3xl md:text-4xl scale-[0.9]' },
  { id: 'tiktok', icon: 'fa-tiktok', color: 'text-white', name: 'تيك توك', size: 'text-4xl md:text-5xl' },
];

export default function HomeClientForm() {
  const [category, setCategory] = useState<string>('instagram');
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<ServiceType>('likes');
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

  const submitSmmRequest = useCallback(async () => {
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: postLink.trim(), serviceType: service, category, recaptchaToken })
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
      setPostLink('');
      setRecaptchaToken('');
    } catch (err) {
      setErrorMsg('فشل الاتصال بالخادم.');
    }
  }, [postLink, service, recaptchaToken, category]);

  const handleStartProcess = () => {
    if (!postLink.trim()) {
      setErrorMsg('الرجاء إدخال رابط المنشور الخاص بك');
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
    <div className="w-full max-w-3xl bg-gradient-to-b from-white to-slate-50 dark:from-[#1C1C1E] dark:to-[#121214] rounded-3xl p-8 sm:p-12 relative shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-black/5 dark:border-white/5 z-10 mx-auto transition-colors duration-300">
      <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-purple-500/80 to-transparent rounded-tl-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {(step === 1 || step === 1.5) && (
          <div className={`space-y-6 transition-all duration-500 relative ${step === 1.5 ? 'blur-sm pointer-events-none opacity-50' : 'animate-fade-in'}`}>
            <div className="flex flex-col gap-4 items-center w-full mb-8 mt-2">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest text-center w-full block">اختر المنصة (Platform)</label>
              <div className="flex justify-center gap-3 md:gap-5">
                {SOCIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all group ${
                      category === cat.id 
                        ? 'bg-gradient-to-tr from-black/5 to-black/5 dark:from-white/10 dark:to-white/5 shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-black/10 dark:border-white/20 scale-110' 
                        : 'bg-slate-100 dark:bg-black/40 border border-black/5 dark:border-white/5 opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={cat.name}
                  >
                    <i className={`fab ${cat.icon} ${cat.color} ${cat.size} drop-shadow-md group-hover:drop-shadow-xl transition-all`}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 relative group/input">
              <label className="text-sm font-bold text-slate-500 tracking-widest block text-right w-full mb-2">رابط المحتوى (Post Link)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500 font-bold group-focus-within/input:text-[#FF8577] transition-colors">
                  <i className="fas fa-link text-xl"></i>
                </div>
                <input
                  type="text"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="ضع الرابط هنا..."
                  className="w-full bg-slate-50 dark:bg-[#18181A] border border-black/5 dark:border-white/5 rounded-2xl py-6 md:py-8 pr-14 pl-4 text-left dir-ltr text-slate-900 dark:text-white text-lg md:text-xl placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577] transition-all shadow-inner"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-sm text-center font-bold animate-pulse">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8">
              <label className="text-sm font-bold text-slate-500 tracking-widest block text-right w-full mb-2">الخطة الإعلانية (Strategy)</label>
              <div className="flex flex-col sm:flex-row bg-slate-100 dark:bg-[#0D0D0E] p-1.5 rounded-2xl w-full border border-black/5 dark:border-white/5 gap-1 sm:gap-0">
                <button
                  onClick={() => setService('likes')}
                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                    service === 'likes' ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-black/5 dark:border-white/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <i className={`fas fa-heart text-xl ${service === 'likes' ? 'text-[#FF8577]' : 'text-slate-400 dark:text-slate-600'}`}></i> زيادة لايكات
                </button>
                <button
                  onClick={() => setService('views')}
                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-xl font-bold text-base md:text-lg transition-all duration-300 ${
                    service === 'views' ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-sm border border-black/5 dark:border-white/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <i className={`fas fa-eye text-xl ${service === 'views' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}></i> زيادة مشاهدات
                </button>
              </div>
            </div>

            <div className="flex justify-center w-full my-8 max-w-full overflow-hidden">
              <div className="bg-slate-50 dark:bg-[#121214] p-3 rounded-2xl shadow-inner border border-black/5 dark:border-white/5 flex justify-center w-full md:w-auto max-w-full overflow-x-auto">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token: string) => setRecaptchaToken(token)}
                  onError={() => setErrorMsg('فشل التحقق، يرجى المحاولة مرة أخرى')}
                  options={{ theme: 'dark' }}
                />
              </div>
            </div>

            <button
              onClick={handleStartProcess}
              className="w-full py-6 mt-4 rounded-2xl font-extrabold text-[#1F0A07] text-xl md:text-2xl bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-[#FF8577]/30 shadow-[0_4px_20px_rgba(255,133,119,0.3)] flex items-center justify-center gap-3"
            >
              بدء إطلاق الحملة <i className="fas fa-rocket text-lg md:text-xl"></i>
            </button>

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
              <div className="relative w-full h-3 bg-slate-100 dark:bg-[#0B0F19] rounded-full overflow-hidden shadow-inner flex">
                 <div className="absolute top-0 right-0 h-full luminary-gradient-bg transition-all duration-1000 ease-linear" style={{ width: `${(1 - sponsorTimeLeft / 30) * 100}%` }}></div>
              </div>
              <p className="text-center text-slate-500 text-xs mt-4">نحن نعتمد على الإعلانات لإبقاء الخدمة مجانية للجميع.</p>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-6 animate-fade-in space-y-6 mt-12 w-full max-w-xl mx-auto z-10 relative">
          <div className="w-24 h-24 mx-auto bg-[#FF8577]/10 rounded-full flex items-center justify-center border border-[#FF8577]/20 mb-2 shadow-[0_0_30px_rgba(255,133,119,0.2)]">
            <i className="fas fa-check text-4xl text-[#FF8577]"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تم اطلاق حملتك التسويقية المجانية بنجاح!</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">بدأ تحسين الخوارزميات ونشر المحتوى. يرجى الانتظار لاستقرار النتائج وبداية فترة التقييم المدرجة بالعداد الزمني.</p>
          </div>

          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-2xl">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold block w-full text-center">الوقت المتبقي للطلب القادم</div>
            <div className="text-5xl font-mono font-extrabold luminary-gradient-text tabular-nums text-center w-full block">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      )}

      {showUnlockModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md transition-all"></div>
          <div className="relative z-10 w-full max-w-[450px] bg-gradient-to-br from-white to-slate-50 dark:from-[#1C1C1E] dark:to-[#121827] border border-[#FF8577]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,133,119,0.2)] animate-fade-in flex flex-col items-center text-center">
             
             <button 
               onClick={() => setShowUnlockModal(false)}
               className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
             >
               <i className="fas fa-times text-xl"></i>
             </button>

             <div className="w-20 h-20 bg-[#FF8577]/10 rounded-full flex items-center justify-center text-[#FF8577] text-3xl mb-6 shadow-inner border border-[#FF8577]/20">
                <i className="fas fa-gift"></i>
             </div>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تهانينا! تمت إضافة طلبك 🚀</h2>
             <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
               تمت الجدولة بنجاح. هل تريد الحصول على <strong>1,000 مشاهدة إضافية</strong> فوراً وبشكل مجاني تماماً؟
             </p>

             <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 mb-6">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-3">أنشئ حساب مجاني في المنصة لفتح برنامج شركاء النجاح وتحصل على:</p>
                <ul className="text-right text-xs text-slate-700 dark:text-slate-300 space-y-2 dir-rtl">
                  <li className="flex gap-2 items-center"><i className="fas fa-check text-green-500"></i> رصيد مجاني ترحيبي.</li>
                  <li className="flex gap-2 items-center"><i className="fas fa-check text-green-500"></i> مكافآت يومية متجددة.</li>
                  <li className="flex gap-2 items-center"><i className="fas fa-check text-green-500"></i> مهام سهلة بآلاف النقاط.</li>
                </ul>
             </div>

             <div className="w-full flex flex-col gap-3">
               <Link href="/auth/signup" onClick={() => setShowUnlockModal(false)} className="w-full py-4 bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-[#1F0A07] rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,133,119,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02]">
                 <i className="fas fa-user-plus"></i> إنشاء حساب مجاني الآن
               </Link>
               <button onClick={() => setShowUnlockModal(false)} className="w-full py-3 text-slate-500 hover:text-slate-300 text-xs font-bold transition-all underline decoration-slate-600 hover:decoration-slate-400">
                 لا شكراً، سأكتفي بالطلب الحالي
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

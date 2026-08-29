'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export default function HomeClientForm() {
  const [profileUrl, setProfileUrl] = useState('');
  const [step, setStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseClient();
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
      });
    };
    checkAuth();
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

  const handleGet = () => {
    if (!profileUrl.trim()) return;
    
    // Simulate a successful request for the new UI
    const targetTime = Date.now() + (5 * 60 * 1000);
    localStorage.setItem('smm_cooldown', targetTime.toString());
    setTimeLeft(5 * 60);
    setStep(3);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex flex-col items-center z-10 mx-auto" dir="rtl">
      <div className="text-center mb-8 max-w-2xl px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
          احصل على متابعين انستقرام مجاناً
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          أدخل رابط حسابك على انستقرام واحصل على متابعين تجريبيين. الخدمة مجانية - لكن البدء بطيء والجودة منخفضة. هل ترغب بخدمة أسرع وأفضل؟ جرب خدماتنا المدفوعة.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-[#1c212d] rounded-[24px] p-6 md:p-8 relative shadow-2xl border border-white/5 transition-all duration-300">
        
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="رابط الحساب (Profile URL)"
                className="w-full bg-[#151922] border border-white/10 rounded-xl py-4 px-5 text-white text-base placeholder-slate-500 focus:outline-none focus:border-[#E11D48] transition-all shadow-inner text-left dir-ltr"
                dir="ltr"
              />
            </div>

            <div className="text-center">
              <span className="text-slate-500 text-sm font-medium">انتظر 5 دقائق، ويمكنك الطلب مرة أخرى.</span>
            </div>

            <button
              onClick={handleGet}
              disabled={!profileUrl.trim()}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-[#E11D48] hover:bg-[#BE123C] transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              طلب المجاني
            </button>
            
            {!isLoggedIn ? (
              <>
                <div className="w-full flex items-center gap-4 mt-2">
                  <div className="h-px bg-white/5 flex-1"></div>
                  <span className="text-slate-500 text-sm font-bold px-2">أو اكتشف المزيد</span>
                  <div className="h-px bg-white/5 flex-1"></div>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/login" className="flex-1 py-3.5 rounded-xl font-bold bg-[#262626] text-white hover:bg-[#333] border border-white/5 transition-all text-center flex justify-center items-center gap-2">
                    <i className="fas fa-sign-in-alt text-slate-400 rotate-180"></i> تسجيل الدخول
                  </Link>
                  <Link href="/auth/signup" className="flex-1 py-3.5 rounded-xl font-bold bg-[#E11D48]/10 text-[#E11D48] hover:bg-[#E11D48]/20 border border-[#E11D48]/30 transition-all text-center flex justify-center items-center gap-2">
                    <i className="fas fa-user-plus"></i> إنشاء حساب
                  </Link>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col gap-3 mt-4">
                <Link href="/dashboard" className="w-full py-3.5 rounded-xl font-bold bg-[#1C1C1E] text-white hover:bg-white/10 border border-white/5 transition-all text-center flex justify-center items-center gap-2">
                  <i className="fas fa-layer-group text-[#FF8577]"></i> الذهاب إلى لوحة التحكم
                </Link>
              </div>
            )}

            <div className="w-full mt-2 p-4 bg-[#211624] border border-purple-900/30 rounded-xl flex items-start gap-3 text-right">
              <i className="fas fa-info-circle text-slate-400 mt-0.5"></i>
              <div className="text-xs text-slate-400 leading-relaxed">
                <strong>وكالة Grodd للحملات التسويقية مستقلة تماماً.</strong> حملاتنا تعمل وفق سياسات الاستخدام وتعتمد فقط على المحتوى العام لغايات التقييم والترويج. اقرأ المزيد &lt;&lt; <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">سياسة الاستخدام للشركات</Link>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in py-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-check-circle text-4xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-white">تم إرسال الطلب بنجاح!</h2>
            
            <div className="bg-[#151922] p-6 rounded-2xl border border-white/5 w-full">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3 block">الوقت المتبقي للطلب القادم</span>
              <span className="text-5xl font-black text-white tabular-nums tracking-tight font-outfit">{formatTime(timeLeft)}</span>
            </div>
            
            <button
              onClick={() => {
                const target = document.getElementById('pricing-plans');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 transition-all mt-4"
            >
              تخطى الانتظار - اشتري الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

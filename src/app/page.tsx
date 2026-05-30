'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReCAPTCHA from 'react-google-recaptcha';
import SafeAdSlot from '@/components/SafeAdSlot';
import Navbar from '@/components/Navbar';

const AdsterraNative = ({ idStr, src }: { idStr: string, src: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || ref.current.firstChild) return;
    const s = document.createElement('script');
    s.async = true;
    s.dataset.cfasync = 'false';
    s.src = src;
    const d = document.createElement('div');
    d.id = idStr;
    ref.current.appendChild(s);
    ref.current.appendChild(d);

    const container = ref.current;
    return () => {
      if (container) {
        try {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        } catch (e) {
          console.warn('Silent cleanup error:', e);
        }
      }
    };
  }, [idStr, src]);
  return <div ref={ref} className="w-full flex justify-center" />;
};

type ServiceType = 'likes' | 'views';

export default function Home() {
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<ServiceType>('likes');
  const [step, setStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [sponsorTimeLeft, setSponsorTimeLeft] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [showIdleAd, setShowIdleAd] = useState(false);
  const [hasSeenIdleAd, setHasSeenIdleAd] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  // Screen size detection for responsive ads
  useEffect(() => {
    const initTimer = setTimeout(() => setIsMobile(window.innerWidth < 768), 0);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Idle Timer (15s inactivity)
  useEffect(() => {
    if (hasSeenIdleAd || showIdleAd || step !== 1) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowIdleAd(true);
        setHasSeenIdleAd(true);
      }, 15000);
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer, true));

    return () => {
      clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, resetTimer, true));
    };
  }, [hasSeenIdleAd, showIdleAd, step]);

  // Check localStorage for active cooldown on mount
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

  // Manage cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && step === 3) {
      localStorage.removeItem('smm_cooldown');
      window.location.reload(); // Refresh the page automatically
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const submitSmmRequest = useCallback(async () => {
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: postLink.trim(), serviceType: service, recaptchaToken })
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
      
      // Success, start 2 min cooldown timer UI
      const targetTime = Date.now() + (2 * 60 * 1000);
      localStorage.setItem('smm_cooldown', targetTime.toString());
      setTimeLeft(2 * 60);
      setStep(3);
      setPostLink('');
      setRecaptchaToken('');
    } catch (err) {
      void err;
      setErrorMsg('فشل الاتصال بالخادم.');
    }
  }, [postLink, service, recaptchaToken]);

  const handleStartProcess = () => {
    if (!postLink.trim()) {
      setErrorMsg('الرجاء إدخال رابط المنشور الخاص بك');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (!recaptchaToken) {
      setErrorMsg('الرجاء إكمال التحقق البشري أولاً (Verify you are human)');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    

    setErrorMsg('');
    setStep(1.5);
    setSponsorTimeLeft(30);
  };

  // Manage sponsor screen timer
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
    <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-12 pb-24 w-full">
      {/* Top Banner Ad */}
      <div className="w-full flex flex-col items-center justify-center mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#121827]/40 p-2 shadow-inner min-h-[106px] max-w-4xl mx-auto">
        {isMobile !== null && (
          isMobile ? (
            <div className="flex w-full justify-center min-h-[250px]">
              <SafeAdSlot src="/ad-300.html" width="300" height="250" className="bg-transparent rounded-lg" />
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <SafeAdSlot src="/ad-728.html" width="728" height="90" className="bg-transparent rounded-lg" />
            </div>
          )
        )}
      </div>

      <div className="text-center mb-10 w-full z-10 relative">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-relaxed">ابدأ إطلاق</h1>
        <h1 className="text-4xl md:text-6xl font-black luminary-gradient-text mb-6 leading-relaxed">حملتك التسويقية المجانية</h1>
        <p className="text-[#A3A3A3] text-sm md:text-lg max-w-md mx-auto leading-loose">أدخل رابط المحتوى الخاص بك (Content Link) لرفع معدل التفاعل والوصول لحسابك فوراً.</p>
      </div>

      <div className="w-full max-w-xl bg-gradient-to-b from-[#1C1C1E] to-[#121214] rounded-2xl p-5 sm:p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 z-10 mx-auto">
        {/* Subtle top border highlight */}
        <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-gradient-to-r from-purple-500/80 to-transparent rounded-tl-2xl pointer-events-none"></div>
        
        <div className="relative z-10">

          {(step === 1 || step === 1.5) && (
            <div className={`space-y-6 transition-all duration-500 relative ${step === 1.5 ? 'blur-sm pointer-events-none opacity-50' : 'animate-fade-in'}`}>
              <div className="flex flex-col gap-2 relative group/input">
                <label className="text-xs font-bold text-slate-500 tracking-widest block text-right w-full mb-1">رابط المحتوى (Post Link)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold group-focus-within/input:text-[#FF8577] transition-colors">
                    <i className="fas fa-link"></i>
                  </div>
                  <input
                    type="text"
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    placeholder="https://social.media/your-awesome-post"
                    className="w-full bg-[#18181A] border border-white/5 rounded-xl py-4 pr-12 pl-4 text-left dir-ltr text-white placeholder-slate-600 focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577] transition-all shadow-inner"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm text-center font-bold animate-pulse">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-6">
                <label className="text-xs font-bold text-slate-500 tracking-widest block text-right w-full mb-1">الخطة الإعلانية (Strategy)</label>
                <div className="flex flex-col sm:flex-row bg-[#0D0D0E] p-1 rounded-xl w-full border border-white/5 gap-1 sm:gap-0">
                  <button
                    onClick={() => setService('likes')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                      service === 'likes' ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-white border border-transparent'
                    }`}
                  >
                    <i className={`fas fa-heart ${service === 'likes' ? 'text-[#FF8577]' : 'text-slate-600'}`}></i> زيادة لايكات
                  </button>
                  <button
                    onClick={() => setService('views')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                      service === 'views' ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-white border border-transparent'
                    }`}
                  >
                    <i className={`fas fa-eye ${service === 'views' ? 'text-slate-300' : 'text-slate-600'}`}></i> زيادة مشاهدات
                  </button>
                </div>
              </div>

              <div className="flex justify-center w-full my-6 max-w-full overflow-hidden">
                <div className="bg-[#121214] p-2 rounded-xl shadow-inner border border-white/5 flex justify-center w-full md:w-auto max-w-full overflow-x-auto">
                  <ReCAPTCHA
                    sitekey={activeSiteKey}
                    onChange={(token: string | null) => setRecaptchaToken(token || '')}
                    onErrored={() => setErrorMsg('فشل التحقق، يرجى المحاولة مرة أخرى')}
                    theme="dark"
                  />
                </div>
              </div>

              <button
                onClick={handleStartProcess}
                className="w-full py-4 mt-2 rounded-xl font-extrabold text-[#1F0A07] text-lg bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-[#FF8577]/30 shadow-[0_4px_20px_rgba(255,133,119,0.3)] flex items-center justify-center gap-3"
              >
                بدء إطلاق الحملة <i className="fas fa-rocket text-sm"></i>
              </button>

              <div className="w-full flex items-center gap-4 mt-6">
                <div className="h-px bg-white/5 flex-1"></div>
                <span className="text-slate-500 text-xs font-bold px-2">أو اكتشف المزيد</span>
                <div className="h-px bg-white/5 flex-1"></div>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/auth/login" className="flex-1 py-3 rounded-xl font-bold bg-[#1C1C1E] text-slate-300 hover:text-white border border-white/5 hover:bg-white/5 transition-all text-center flex justify-center items-center gap-2">
                  <i className="fas fa-sign-in-alt text-slate-500"></i> تسجيل الدخول
                </Link>
                <Link href="/auth/signup" className="flex-1 py-3 rounded-xl font-bold bg-[#ec4899]/10 text-[#ec4899] hover:bg-[#ec4899]/20 border border-[#ec4899]/20 transition-all text-center flex justify-center items-center gap-2 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                  <i className="fas fa-user-plus"></i> إنشاء حساب
                </Link>
              </div>

              {/* Disclaimer */}
              <div className="w-full mt-4 p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3 text-right">
                <i className="fas fa-info-circle text-slate-400 mt-0.5"></i>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong>وكالة Grodd للحملات التسويقية مستقلة تماماً.</strong> حملاتنا تعمل وفق سياسات الاستخدام وتعتمد فقط على المحتوى العام لغايات التقييم والترويج. اقرأ المزيد &lt;&lt; <a href="#" className="text-purple-400 hover:text-purple-300 underline">سياسة الاستخدام للشركات</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {step === 1.5 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-md transition-all"></div>
              
          <div className="relative z-10 w-full max-w-[728px] flex flex-col items-center animate-fade-in">
            {/* Modal Header */}
            <div className="w-full flex justify-end mb-2">
              <div className="bg-[#1C1C1E] px-3 py-1 rounded-t-lg text-[#FF8577] text-[10px] font-bold tracking-widest cursor-not-allowed border border-white/5 border-b-0 flex items-center gap-2 dir-ltr">
                <span>يرجى الانتظار {sponsorTimeLeft} ثانية</span>
                <i className="fas fa-times"></i>
              </div>
            </div>
            
            {/* Adsterra Display Block */}
            <div className="bg-white rounded-b-xl rounded-tl-xl shadow-[0_0_50px_rgba(255,133,119,0.1)] overflow-hidden flex flex-col items-center justify-center w-full min-h-[90px] md:min-h-[90px] border border-white/5 relative">
              {isMobile !== null && (
                isMobile ? (
                  <div className="flex w-full items-center justify-center min-h-[250px] overflow-hidden max-w-full">
                    <div className="scale-[0.9] sm:scale-100 origin-center flex justify-center items-center">
                      <SafeAdSlot src="/ad-300.html" width="300" height="250" className="mx-auto" />
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-center min-h-[90px]">
                      <SafeAdSlot src="/ad-728.html" width="728" height="90" className="mx-auto" />
                  </div>
                )
              )}
            </div>
            
            {/* Countdown Bar */}
            <div className="w-full mt-6 bg-[#161618] rounded-2xl p-6 border border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold text-white text-center mb-4 flex justify-center items-center gap-2">
                <i className="fas fa-spinner fa-spin text-[#FF8577]"></i> جاري تحضير طلبك...
              </h3>
              <div className="relative w-full h-3 bg-[#0B0F19] rounded-full overflow-hidden shadow-inner flex">
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
            <h3 className="text-2xl font-bold text-white mb-2">تم اطلاق حملتك التسويقية المجانية بنجاح!</h3>
            <p className="text-slate-400 text-sm">بدأ تحسين الخوارزميات ونشر المحتوى. يرجى الانتظار لاستقرار النتائج وبداية فترة التقييم المدرجة بالعداد الزمني.</p>
          </div>

          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5 shadow-2xl">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold block w-full text-center">الوقت المتبقي للطلب القادم</div>
            <div className="text-5xl font-mono font-extrabold luminary-gradient-text tabular-nums text-center w-full block">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      )}




      {/* Adsterra Native Banner */}
      <div className="w-full max-w-5xl mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-inner overflow-hidden">
        <h3 className="text-slate-400 font-bold mb-4 text-xs font-mono uppercase tracking-widest opacity-50">Sponsored Advertisement</h3>
        <AdsterraNative 
           idStr="container-2700670eebf5646c9f8d65d6e35dec31" 
           src="https://evacuateenclose.com/2700670eebf5646c9f8d65d6e35dec31/invoke.js" 
        />
      </div>

      {/* Adsterra 728x90 Banner */}
      <div className="w-full max-w-4xl mt-8 flex flex-col items-center p-4 sm:p-8 bg-[#0B0F19]/50 rounded-2xl border border-white/5 shadow-inner overflow-hidden">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-4">إعلان سبونسر</p>
        {isMobile !== null && (
          isMobile ? (
            <div className="flex w-full justify-center min-h-[250px] overflow-hidden">
              <SafeAdSlot src="/ad-300.html" width="300" height="250" className="bg-transparent rounded-lg" />
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <SafeAdSlot src="/ad-728.html" width="728" height="90" className="bg-transparent rounded-lg" />
            </div>
          )
        )}
      </div>

      {/* Sleek Horizontal Features Row */}
      <div className="flex flex-wrap w-full justify-center mt-8 gap-4 sm:gap-6 md:gap-12 mb-16 relative z-10 px-4">
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-bolt text-slate-600"></i>
          <span>تحسين وتوجيه فوري</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-shield-alt text-slate-600"></i>
          <span>أمان وموثوقية قوية</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 text-[#A3A3A3] text-xs font-bold tracking-wider">
          <i className="fas fa-chart-line text-slate-600"></i>
          <span>دعم ورؤى مستمرة</span>
        </div>
      </div>

      {/* About Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 px-4 md:px-0 text-right dir-rtl">
        <h2 className="text-3xl md:text-3xl font-extrabold text-white mb-6">
          ما هي وكالة Grodd Media للتسويق الرقمي؟
        </h2>
        <div className="text-slate-300 space-y-4 leading-relaxed mb-12">
          <p className="text-lg font-medium text-white border-r-4 border-pink-500 pr-4">
            وكالة Grodd Media هي منصة تسويق رقمي B2B متخصصة في تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية على منصات مثل إنستجرام، باستخدام أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال.
          </p>
          <p>
            تتيح لك منصتنا تجربة حملات التسويق الرقمي الترويجية مجاناً لرفع كفاءة الخوارزميات وزيادة الموثوقية لحسابك من خلال تسريع الانتشار (Viral Reach) والوصول للجمهور الصحيح. في <strong>Grodd Media</strong>، تأتي خصوصيتك وأمان بياناتك في صدارة أولوياتنا وتتوافق تماماً مع سياسات الاستخدام العادل.
          </p>
          <div className="text-xs text-slate-500 mt-4 font-bold tracking-wider">
            <i className="fas fa-clock ml-2"></i>آخر تحديث: أبريل 2026 | <i className="fas fa-user-shield ml-2 mr-4"></i>بواسطة: فريق خبراء Grodd Labs
          </div>
        </div>
        
        <div className="flex justify-center mt-12 w-full">
          <Image 
            src="/img/grodd-mockup.png" 
            alt="Grodd SMM Mockup" 
            width={800}
            height={500}
            className="w-full max-w-2xl h-auto object-contain drop-shadow-[0_20px_50px_rgba(236,72,153,0.15)]" 
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">كيف تعمل حملات الترويج العضوي في Grodd Media؟</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium border-t border-b border-white/10 py-4 mt-4 shadow-inner bg-[#121827]/50 rounded-xl">
            تعمل حملاتنا عبر ثلاث خطوات أساسية: تحديد مسار المحتوى العام، إعداد الخطة الإعلانية لزيادة التفاعل، ثم توجيه الزوار الحقيقيين لتحسين نتائج الخوارزميات بشكل آمن.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-0">
          {/* Vertical Glowing Line */}
          <div className="absolute right-8 md:inset-x-0 md:mx-auto md:w-1 top-0 bottom-0 bg-gradient-to-b from-pink-500/50 via-purple-500/50 to-green-500/50 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-24 w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-pink-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-pink-500 text-pink-400 font-black text-sm shadow-[0_0_15px_rgba(236,72,153,0.4)]">1</span>
                  تحديد مسار المحتوى
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">انتقل إلى منصة إنستغرام لنسخ مسار/رابط المحتوى العام الذي تود إدراجه كوجهة رئيسية للحملة الإعلانية والتسويقية لنظامنا، سواء كان منشور أو ريلز.</p>
              </div>
            </div>
            
            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-pink-500 items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.6)] z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">1</span>
            </div>
            
            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-8 md:mb-0">
              <div className="relative w-full max-w-[500px]">
                <div className="absolute -inset-2 bg-gradient-to-tr from-pink-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <Image src="/img/choose_service.png" alt="الخطوة الأولى" width={600} height={400} className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-24 w-full group">
            <div className="order-1 md:order-1 w-full md:w-5/12 flex justify-center md:justify-start pr-16 md:pr-0 mb-8 md:mb-0">
              <div className="relative w-full max-w-[500px]">
                <div className="absolute -inset-2 bg-gradient-to-tl from-purple-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <Image src="/img/1-2-3-gooo.png" alt="الخطوة الثانية" width={600} height={400} className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>

            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-purple-500 items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)] z-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">2</span>
            </div>

            <div className="order-2 md:order-2 w-full md:w-5/12 pr-16 md:pl-12 text-right dir-rtl">
              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-purple-500 text-purple-400 font-black text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">2</span>
                  إدراج وإعداد الحملة
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">الصق الرابط في لوحة تحكم Grodd Media، حدد الخطة الإعلانية المناسبة (<strong className="text-white">تفاعل وتسويق أو وصول وانتشار</strong>)، ثم وافق على إطلاق حملتك.</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
               <div className="glass-panel p-8 rounded-3xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] border border-white/5">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-green-500/40 transition-colors duration-500"></div>
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                  <span className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#121827] border-2 border-green-500 text-green-400 font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]">3</span>
                  متابعة النتائج والتقارير
                </h3>
                <p className="text-slate-400 leading-relaxed md:ml-4 text-[15px]">تابع التقدم الملحوظ لمحتواك <strong className="text-white">بشكل مباشر</strong> عندما نوجّه الجماهير إليك. استخدم فترة التقييم المدرجة لتخطيط أداء حملتك السابقة والبدء مجدداً!</p>
              </div>
            </div>

            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#0B0F19] border-[4px] border-green-500 items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.6)] z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-xl">3</span>
            </div>

            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-8 md:mb-0">
               <div className="relative w-full max-w-[500px]">
                 <div className="absolute -inset-2 bg-gradient-to-tr from-green-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                 <div className="relative w-full h-[250px] bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden backdrop-blur-md transform group-hover:scale-[1.02] transition-transform duration-500 shadow-2xl">
                    <i className="fas fa-rocket text-7xl text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.6)] group-hover:-translate-y-4 group-hover:translate-x-4 transition-transform duration-500"></i>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sticky Banner Ad */}
      <div 
        className={`fixed left-0 right-0 z-50 flex flex-col items-center transition-all duration-300 ease-in-out ${
          isStickyVisible ? 'bottom-0' : '-bottom-[80px]'
        }`}
      >
        <button 
          onClick={() => setIsStickyVisible(!isStickyVisible)}
          className="w-12 h-6 bg-white rounded-t-lg flex items-center justify-center shadow-[0_-4px_10px_rgba(0,0,0,0.15)] hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 border-b-0"
        >
          <i className={`fas fa-chevron-${isStickyVisible ? 'down' : 'up'} text-gray-500 text-xs`}></i>
        </button>
        <div className="w-full bg-[#121827]/90 backdrop-blur-md border-t border-white/10 p-3 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.3)] min-h-[80px]">
          {isMobile !== null && (
            isMobile ? (
              <div className="flex w-full items-center justify-center">
                <SafeAdSlot src="/ad-320.html" width="320" height="50" />
              </div>
            ) : (
              <div className="flex w-full items-center justify-center">
                <SafeAdSlot src="/ad-468.html" width="468" height="60" />
              </div>
            )
          )}
        </div>
      </div>

      {/* Idle Ad Modal */}
      {showIdleAd && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-xl transition-all block"></div>
          <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center animate-fade-in bg-[#121827] border border-white/10 rounded-2xl shadow-2xl p-6">
            <button 
              onClick={() => setShowIdleAd(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 className="text-xl font-bold text-white mb-4 text-center mt-2">إعلان مدعوم</h3>
            <p className="text-slate-400 text-sm text-center w-full mb-6">شكراً لانتظارك! نحن نعتمد على الإعلانات لإبقاء هذه الخدمة مجانية.</p>
            
            <div className="w-full h-[250px] bg-white/5 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
              <SafeAdSlot src="/ad-300.html" width="300" height="250" />
            </div>
          </div>
        </div>
      )}

      {/* FAQ Schema Markup for GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "ما هي وكالة Grodd Media للتسويق الرقمي؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "وكالة Grodd Media هي منصة تسويق رقمي B2B متخصصة في تحسين خوارزميات التفاعل وتسريع الانتشار العضوي للعلامات التجارية على منصات مثل إنستجرام، باستخدام أدوات آمنة ترفع من موثوقية الحسابات بشكل قانوني وفعال."
                }
              },
              {
                "@type": "Question",
                "name": "كيف تعمل حملات الترويج العضوي في Grodd Media؟",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "تعمل حملاتنا عبر ثلاث خطوات أساسية: تحديد مسار المحتوى العام، إعداد الخطة الإعلانية لزيادة التفاعل، ثم توجيه الزوار الحقيقيين لتحسين نتائج الخوارزميات بشكل آمن."
                }
              }
            ]
          })
        }}
      />
    </main>
  );
}

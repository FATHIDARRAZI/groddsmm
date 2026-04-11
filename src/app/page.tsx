'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

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
  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

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

  // Manage cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && step === 3) {
      setTimeout(() => setStep(1), 0); // Auto reset to step 1 when cooldown finishes
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
      submitSmmRequest();
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
      <div className="w-full flex-col items-center justify-center mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#121827]/40 p-2 shadow-inner hidden md:flex min-h-[106px]">
        <iframe src="/ad-728.html" width="728" height="90" frameBorder="0" scrolling="no" className="mx-auto" />
      </div>
      <div className="w-full flex-col items-center justify-center mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#121827]/40 p-2 shadow-inner flex md:hidden min-h-[266px]">
        <iframe src="/ad-300.html" width="300" height="250" frameBorder="0" scrolling="no" className="mx-auto" />
      </div>

      <div className="w-full max-w-md glass-panel rounded-[2rem] p-8 relative overflow-hidden group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-3">ابدأ حملتك التسويقية المجانية</h1>
            <p className="text-slate-400 text-sm leading-relaxed">أدخل رابط المحتوى الخاص بك (Content Link) لرفع معدل التفاعل والوصول لحسابك فوراً عبر تقنياتنا المستندة للبيانات.</p>
          </div>

          {(step === 1 || step === 1.5) && (
            <div className={`space-y-6 transition-all duration-500 relative ${step === 1.5 ? 'blur-sm pointer-events-none opacity-50' : 'animate-fade-in'}`}>
              <div className="relative group/input">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold text-lg group-focus-within/input:text-pink-500 transition-colors">
                  <i className="fas fa-link"></i>
                </div>
                <input
                  type="text"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="رابط المنشور الخاص بك (Post Link)"
                  className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-xl py-4 pr-12 pl-4 text-left dir-ltr text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all shadow-inner"
                />
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm text-center font-bold animate-pulse">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-1 bg-[#0B0F19] rounded-xl border border-slate-700/50">
                <button
                  onClick={() => setService('likes')}
                  className={`relative py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    service === 'likes' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-heart text-pink-500 ml-2"></i> تفاعل وتسويق
                </button>
                <button
                  onClick={() => setService('views')}
                  className={`relative py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    service === 'views' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-play text-purple-500 ml-2"></i> وصول وانتشار
                </button>
              </div>

              <div className="flex justify-center w-full my-4">
                <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-200">
                  <ReCAPTCHA
                    sitekey={activeSiteKey}
                    onChange={(token: string | null) => setRecaptchaToken(token || '')}
                    onErrored={() => setErrorMsg('فشل التحقق، يرجى المحاولة مرة أخرى')}
                    theme="light"
                  />
                </div>
              </div>

              <button
                onClick={handleStartProcess}
                className="w-full py-4 rounded-xl font-bold text-white text-lg insta-gradient-bg animate-gradient-x hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                بدأ إطلاق الحملة <i className="fas fa-rocket mr-2 text-sm"></i>
              </button>

              {/* Disclaimer */}
              <div className="w-full mt-4 p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3 text-right">
                <i className="fas fa-info-circle text-slate-400 mt-0.5"></i>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong>وكالة Grodd للحملات التسويقية مستقلة تماماً.</strong> حملاتنا تعمل وفق سياسات الاستخدام وتعتمد فقط على المحتوى العام لغايات التقييم والترويج. اقرأ المزيد &lt;&lt; <a href="#" className="text-purple-400 hover:text-purple-300 underline">سياسة الاستخدام للشركات</a>
                </div>
              </div>
            </div>
          )}

          {step === 1.5 && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-xl transition-all"></div>
              
              <div className="relative z-10 w-full max-w-[728px] flex flex-col items-center animate-fade-in">
                {/* Modal Header */}
                <div className="w-full flex justify-end mb-2">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-t-lg text-white/50 text-[10px] uppercase font-bold tracking-widest cursor-not-allowed border border-white/5 border-b-0 flex items-center gap-2">
                    <span>Please wait {sponsorTimeLeft}s</span>
                    <i className="fas fa-times"></i>
                  </div>
                </div>
                
                {/* Adsterra Display Block */}
                <div className="bg-white rounded-b-xl rounded-tl-xl shadow-[0_0_50px_rgba(236,72,153,0.15)] overflow-hidden flex flex-col items-center justify-center w-full min-h-[90px] md:min-h-[90px] border border-white/10 relative">
                  <div className="hidden md:flex w-full items-center justify-center min-h-[90px]">
                    <iframe src="/ad-728.html" width="728" height="90" frameBorder="0" scrolling="no" className="mx-auto" />
                  </div>
                  <div className="flex md:hidden w-full items-center justify-center min-h-[250px]">
                    <iframe src="/ad-300.html" width="300" height="250" frameBorder="0" scrolling="no" className="mx-auto" />
                  </div>
                </div>
                
                {/* Countdown Bar */}
                <div className="w-full mt-6 bg-[#121827] rounded-2xl p-6 border border-white/5 shadow-2xl">
                  <h3 className="text-xl font-bold text-white text-center mb-4 flex justify-center items-center gap-2">
                    <i className="fas fa-spinner fa-spin text-pink-500"></i> جاري تحضير طلبك...
                  </h3>
                  <div className="relative w-full h-3 bg-[#0B0F19] rounded-full overflow-hidden shadow-inner flex">
                     <div className="absolute top-0 right-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear" style={{ width: `${(1 - sponsorTimeLeft / 30) * 100}%` }}></div>
                  </div>
                  <p className="text-center text-slate-500 text-xs mt-4">نحن نعتمد على الإعلانات لإبقاء الخدمة مجانية للجميع.</p>
                </div>
              </div>
            </div>
          )}



          {step === 3 && (
            <div className="text-center py-6 animate-fade-in space-y-6">
              <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                <i className="fas fa-check text-4xl text-green-400"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">تم اطلاق حملتك التسويقية المجانية بنجاح!</h3>
                <p className="text-slate-400 text-sm">بدأ تحسين الخوارزميات ونشر المحتوى. يرجى الانتظار لاستقرار النتائج وبداية فترة التقييم المدرجة بالعداد الزمني.</p>
              </div>

              <div className="bg-[#0B0F19] rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold">الوقت المتبقي للطلب القادم</div>
                <div className="text-5xl font-mono font-extrabold insta-gradient-text tabular-nums">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adsterra Native Banner */}
      <div className="w-full max-w-5xl mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-inner overflow-hidden">
        <h3 className="text-slate-400 font-bold mb-4 text-xs font-mono uppercase tracking-widest opacity-50">Sponsored Advertisement</h3>
        <AdsterraNative 
           idStr="container-2700670eebf5646c9f8d65d6e35dec31" 
           src="https://evacuateenclose.com/2700670eebf5646c9f8d65d6e35dec31/invoke.js" 
        />
      </div>

      {/* Adsterra 728x90 Banner */}
      <div className="w-full max-w-4xl mt-8 flex flex-col items-center">
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm flex items-center justify-center min-h-[90px] w-full">
          <iframe src="/ad-728.html" width="728" height="90" frameBorder="0" scrolling="no" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
        <div className="glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-yellow-400 text-xl"></i>
          </div>
          <h4 className="font-bold text-white text-lg">تحسين وتوجيه فوري</h4>
          <p className="text-sm text-slate-400 mt-2">نبدأ بنشر المحتوى وتحفيز الخوارزميات فور تأكيد إطلاق الحملة عبر أنظمتنا المتطورة.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-alt text-green-400 text-xl"></i>
          </div>
          <h4 className="font-bold text-white text-lg">أمان وموثوقية قوية</h4>
          <p className="text-sm text-slate-400 mt-2">النظام يعمل بصلاحيات آمنة تماماً دون طلب أي بيانات مرور (No Passwords Required).</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-sync text-purple-400 text-xl"></i>
          </div>
          <h4 className="font-bold text-white text-lg">دعم ورؤى مستمرة</h4>
          <p className="text-sm text-slate-400 mt-2">نظام التحليل لدينا يعمل باستمرار لضمان استقرار نتائج حملاتك وتقديم تقارير واقعية.</p>
        </div>
      </div>

      {/* About Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 px-4 md:px-0 text-right dir-rtl">
        <h2 className="text-3xl md:text-3xl font-extrabold text-white mb-6">
          عن خدماتنا في Grodd Media
        </h2>
        <div className="text-slate-300 space-y-4 leading-relaxed mb-12">
          <p>
            تقدم وكالتنا، <strong>Grodd Media</strong>، حلولاً احترافية لتعزيز التفاعل والنمو العضوي لحسابات إنستجرام للشركات وصناع المحتوى. تتيح لك منصتنا تجربة حملات التسويق الرقمي الترويجية مجاناً لرفع كفاءة الخوارزميات وزيادة الموثوقية لحسابك من خلال تسريع الانتشار (Viral Reach) والوصول للجمهور الصحيح.
          </p>
          <p>
            في <strong>Grodd Media</strong>، تأتي خصوصيتك وأمان بياناتك في صدارة أولوياتنا. كوكالة تقنية محترفة، أدواتنا التسويقية تتوافق تماماً مع سياسات الاستخدام العادل وتعمل على تضخيم وتحليل المحتوى العام فقط للوصول إلى الجمهور المستهدف، لضمان أعلى درجات الأمان لحسابات عملائنا.
          </p>
        </div>
        
        <div className="flex justify-center mt-12 w-full">
          <img 
            src="/img/grodd-mockup.png" 
            alt="Grodd SMM Mockup" 
            className="w-full max-w-2xl h-auto object-contain drop-shadow-[0_20px_50px_rgba(236,72,153,0.15)]" 
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">آلية إطلاق الحملة</h2>
          <p className="text-slate-400">ثلاث خطوات استراتيجية لتوجيه الزوار نحو محتواك.</p>
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
                <img src="/img/choose_service.png" alt="الخطوة الأولى" className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-24 w-full group">
            <div className="order-1 md:order-1 w-full md:w-5/12 flex justify-center md:justify-start pr-16 md:pr-0 mb-8 md:mb-0">
              <div className="relative w-full max-w-[500px]">
                <div className="absolute -inset-2 bg-gradient-to-tl from-purple-500 to-transparent rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <img src="/img/1-2-3-gooo.png" alt="الخطوة الثانية" className="relative rounded-3xl border border-white/10 shadow-2xl object-cover w-full h-auto transform group-hover:scale-[1.02] transition-transform duration-500" />
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
          <div className="hidden md:flex w-full items-center justify-center">
            <iframe src="/ad-468.html" width="468" height="60" frameBorder="0" scrolling="no" />
          </div>
          <div className="flex md:hidden w-full items-center justify-center">
            <iframe src="/ad-320.html" width="320" height="50" frameBorder="0" scrolling="no" />
          </div>
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
              <iframe src="/ad-300.html" width="300" height="250" frameBorder="0" scrolling="no" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [username, setUsername] = useState('');
  const [service, setService] = useState<ServiceType>('likes');
  const [step, setStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [processingTimeLeft, setProcessingTimeLeft] = useState(10);
  const [canSubmitSmm, setCanSubmitSmm] = useState(false);
  const [cfState, setCfState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [sponsorTimeLeft, setSponsorTimeLeft] = useState(0);
  const [isStickyVisible, setIsStickyVisible] = useState(true);

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
        body: JSON.stringify({ username: username.trim(), serviceType: service })
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
      setUsername('');
    } catch (err) {
      void err;
      setErrorMsg('فشل الاتصال بالخادم.');
      setStep(1);
    }
  }, [username, service]);

  const handleStartProcess = () => {
    if (!username.trim()) {
      setErrorMsg('الرجاء إدخال اسم المستخدم الخاص بك');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setErrorMsg('');
    
    // Open Adsterra Direct Link (Smartlink) instantly on click
    window.open('https://evacuateenclose.com/kht24xw1g?key=a0a3b894e66a14b9428e1435ba61a4c9', '_blank');

    setStep(1.5);
    setSponsorTimeLeft(30);
  };

  const handleTurnstileClick = () => {
    if (cfState !== 'idle') return;
    setCfState('loading');
    
    // Open Adsterra Direct Link (Smartlink)
    window.open('https://evacuateenclose.com/kht24xw1g?key=a0a3b894e66a14b9428e1435ba61a4c9', '_blank');
    
    setTimeout(() => {
      setCfState('success');
      setCanSubmitSmm(true);
      submitSmmRequest();
    }, 2000);
  };

  // Manage processing state timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && processingTimeLeft > 0 && !canSubmitSmm) {
      timer = setInterval(() => {
        setProcessingTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (processingTimeLeft <= 0 && step === 2 && !canSubmitSmm) {
      setTimeout(() => submitSmmRequest(), 0);
    }
    return () => clearInterval(timer);
  }, [step, processingTimeLeft, canSubmitSmm, submitSmmRequest]);

  // Manage sponsor screen timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 1.5 && sponsorTimeLeft > 0) {
      timer = setInterval(() => {
        setSponsorTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (step === 1.5 && sponsorTimeLeft <= 0) {
      setStep(2);
      setProcessingTimeLeft(10);
      setCanSubmitSmm(false);
      setCfState('idle');
    }
    return () => clearInterval(timer);
  }, [step, sponsorTimeLeft]);

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
            <h1 className="text-3xl font-extrabold text-white mb-3">اختر خدمتك المجانية</h1>
            <p className="text-slate-400 text-sm leading-relaxed">أدخل اسم المستخدم الخاص بك (Username) واختر الخدمة التي تناسبك لتعزيز حسابك فوراً.</p>
          </div>

          {(step === 1 || step === 1.5) && (
            <div className={`space-y-6 transition-all duration-500 relative ${step === 1.5 ? 'blur-sm pointer-events-none opacity-50' : 'animate-fade-in'}`}>
              <div className="relative group/input">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold text-lg group-focus-within/input:text-pink-500 transition-colors">
                  @
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم (Username)"
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
                  <i className="fas fa-heart text-pink-500 ml-2"></i> لايكات
                </button>
                <button
                  onClick={() => setService('views')}
                  className={`relative py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    service === 'views' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-play text-purple-500 ml-2"></i> مشاهدات
                </button>
              </div>

              <button
                onClick={handleStartProcess}
                className="w-full py-4 rounded-xl font-bold text-white text-lg insta-gradient-bg animate-gradient-x hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                إرسال الطلب الآن <i className="fas fa-rocket mr-2 text-sm"></i>
              </button>

              {/* Disclaimer */}
              <div className="w-full mt-4 p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl flex items-start gap-3 text-right">
                <i className="fas fa-info-circle text-slate-400 mt-0.5"></i>
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong>Grodd SMM لا يتبع لشركة Instagram™.</strong> نحن لا نستضيف أي محتوى خاص بإنستجرام. جميع الحقوق لمعطيات الحسابات تعود لأصحابها. "نحن نحترم الخصوصية — يتوفر المحتوى العام فقط." اقرأ المزيد &lt;&lt; <a href="#" className="text-purple-400 hover:text-purple-300 underline">سياسة الاستخدام</a>
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

          {step === 2 && (
            <div className="text-center py-6 animate-fade-in text-slate-300 space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-pink-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{processingTimeLeft}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">جاري المعالجة...</h3>
                <p className="text-sm text-slate-400">يرجى الانتظار {processingTimeLeft} ثواني أو تخطي الوقت بالإثبات.</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-[300px] h-[74px] bg-[#f9f9f9] border border-[#e0e0e0] rounded-[3px] shadow-[0px_0px_4px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 cursor-pointer hover:bg-white transition-colors"
                  onClick={handleTurnstileClick}
                >
                  <div className="flex items-center gap-3">
                    {cfState === 'idle' && (
                      <div className="w-7 h-7 border-[2px] border-[#c1c1c1] rounded-[3px] bg-white transition-colors"></div>
                    )}
                    {cfState === 'loading' && (
                      <div className="w-7 h-7 border-[3px] border-[#e0e0e0] border-t-[#F48120] rounded-full animate-spin"></div>
                    )}
                    {cfState === 'success' && (
                      <div className="w-7 h-7 bg-[#009900] rounded-full flex items-center justify-center shadow-sm">
                        <i className="fas fa-check text-white text-xs"></i>
                      </div>
                    )}
                    <span className="text-[#484848] text-[14px] font-sans">
                      {cfState === 'idle' && 'Verify you are human'}
                      {cfState === 'loading' && 'Verifying...'}
                      {cfState === 'success' && 'Success!'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <div className="flex items-center gap-1 opacity-90 mb-0.5">
                      <i className="fab fa-cloudflare text-[#F48120] text-xl"></i>
                      <span className="text-[#484848] font-bold text-[10px] tracking-wide">CLOUDFLARE</span>
                    </div>
                    <div className="text-[9px] text-[#A9A9A9] flex gap-1 mt-0.5">
                      <a href="#" className="hover:text-black">Privacy</a> • <a href="#" className="hover:text-black">Terms</a>
                    </div>
                  </div>
                </div>
                <div className="text-[#A9A9A9] text-xs font-sans">Not working? Click to report it</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-fade-in space-y-6">
              <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 mb-2">
                <i className="fas fa-check text-4xl text-green-400"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">تم تأكيد طلبك بنجاح!</h3>
                <p className="text-slate-400 text-sm">بدأ التفاعل بالوصول لحسابك. يرجى الانتظار لحين انتهاء العداد لطلب دفعة جديدة.</p>
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
           idStr="container-a026c7a487d9e7acd2f65169e285806a" 
           src="https://pl29009657.profitablecpmratenetwork.com/a026c7a487d9e7acd2f65169e285806a/invoke.js" 
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
          <h4 className="font-bold text-white text-lg">سرعة صاروخية</h4>
          <p className="text-sm text-slate-400 mt-2">توصل باللايكات والمشاهدات فوراً بمجرد تأكيد طلبك عبر النظام.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-alt text-green-400 text-xl"></i>
          </div>
          <h4 className="font-bold text-white text-lg">أمان وموثوقية 100%</h4>
          <p className="text-sm text-slate-400 mt-2">النظام لا يطلب كلمة مرورك إطلاقاً، فقط نحتاج اسم المستخدم.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center group hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-sync text-purple-400 text-xl"></i>
          </div>
          <h4 className="font-bold text-white text-lg">تحديث ومتابعة مستمرة</h4>
          <p className="text-sm text-slate-400 mt-2">خوادمنا تعمل على مدار 24 ساعة لضمان استلامك للخدمة المجانية.</p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-5xl mt-24 mb-16 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">كيف يعمل نظام Grodd SMM؟</h2>
          <p className="text-slate-400">ثلاث خطوات بسيطة تفصلك عن زيادة التفاعل في حسابك مجاناً.</p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 md:px-0">
          {/* Vertical Line */}
          <div className="absolute right-8 md:inset-x-0 md:mx-auto md:w-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500/50 via-purple-500/50 to-transparent"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-20 w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#121827] border-2 border-pink-500 text-white font-bold text-xs">1</span>
                اختر الخدمة واسم المستخدم
              </h3>
              <p className="text-slate-400 leading-relaxed md:ml-4">قم بكتابة اسم المستخدم (Username) الخاص بحسابك في إنستجرام، ثم اختر نوع الخدمة التي ترغب بها (لايكات أو مشاهدات).</p>
            </div>
            
            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#121827] border-4 border-pink-500 items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)] z-10">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            
            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-6 md:mb-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <img src="/img/choose_service.png" alt="الخطوة الأولى" className="relative rounded-2xl border border-white/10 shadow-2xl object-cover w-full h-auto max-w-[300px] hover:-translate-y-2 hover:scale-105 transition-transform duration-500" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-20 w-full group">
            <div className="order-1 md:order-1 w-full md:w-5/12 flex justify-center md:justify-start pr-16 md:pr-0 mb-6 md:mb-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <img src="/img/1-2-3-gooo.png" alt="الخطوة الثانية" className="relative rounded-2xl border border-white/10 shadow-2xl object-cover w-full h-auto max-w-[300px] hover:-translate-y-2 hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#121827] border-4 border-purple-500 items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10">
              <span className="text-white font-bold text-sm">2</span>
            </div>

            <div className="order-2 md:order-2 w-full md:w-5/12 pr-16 md:pl-12 text-right dir-rtl">
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#121827] border-2 border-purple-500 text-white font-bold text-xs">2</span>
                تأكيد الطلب البشري
              </h3>
              <p className="text-slate-400 leading-relaxed md:ml-4">انقر على زر "إرسال الطلب الآن" وانتظر قليلاً. سيطلب منك النظام التحقق البشري لضمان جودة الخدمة واستمراريتها.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col md:flex-row items-center justify-between w-full group">
            <div className="order-2 md:order-1 w-full md:w-5/12 pr-16 md:pr-12 text-right dir-rtl">
              <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#121827] border-2 border-green-500 text-white font-bold text-xs">3</span>
                استلام التفاعل
              </h3>
              <p className="text-slate-400 leading-relaxed md:ml-4">بمجرد الانتهاء، سيبدأ التفاعل بالوصول إلى حسابك مباشرة. يمكنك العودة لطلب دفعة جديدة بعد انتهاء العداد الزمني!</p>
            </div>

            {/* Desktop Center Circle */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#121827] border-4 border-green-500 items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10">
              <span className="text-white font-bold text-sm">3</span>
            </div>

            <div className="order-1 md:order-2 w-full md:w-5/12 flex justify-center md:justify-end pr-16 md:pr-0 mb-6 md:mb-0 relative">
               <div className="w-full max-w-[300px] h-[200px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                  <i className="fas fa-check-circle text-6xl text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] group-hover:scale-110 transition-transform duration-500"></i>
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
    </main>
  );
}

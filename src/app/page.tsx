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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [processingTimeLeft, setProcessingTimeLeft] = useState(10);
  const [canSubmitSmm, setCanSubmitSmm] = useState(false);
  const [cfState, setCfState] = useState<'idle' | 'loading' | 'success'>('idle');

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
    setStep(2);
    setProcessingTimeLeft(10);
    setCanSubmitSmm(false);
    setCfState('idle');
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
    } else if (processingTimeLeft === 0 && step === 2 && !canSubmitSmm) {
      // The user waited 10s, auto-trigger SMM call or let them click verify
      setTimeout(() => submitSmmRequest(), 0);
    }
    return () => clearInterval(timer);
  }, [step, processingTimeLeft, canSubmitSmm, submitSmmRequest]);

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

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
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
      {/* Sticky Banner Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121827]/90 backdrop-blur-md border-t border-white/10 p-3 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.3)] min-h-[70px]">
        <div className="hidden md:flex w-full items-center justify-center">
          <iframe src="/ad-468.html" width="468" height="60" frameBorder="0" scrolling="no" />
        </div>
        <div className="flex md:hidden w-full items-center justify-center">
          <iframe src="/ad-320.html" width="320" height="50" frameBorder="0" scrolling="no" />
        </div>
      </div>
    </main>
  );
}

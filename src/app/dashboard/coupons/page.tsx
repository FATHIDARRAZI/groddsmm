'use client';

import React, { useState } from 'react';

export default function CouponsPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error'|'success', msg: string} | null>(null);

  const submitCode = async () => {
    if (!code) return setStatus({ type: 'error', msg: 'الرجاء إدخال الكوبون أولاً' });
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        setCode('');
        // Trigger balance refresh in layout
        window.dispatchEvent(new Event('pointsUpdated'));
      } else {
        setStatus({ type: 'error', msg: data.error });
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'حدث خطأ أثناء تفعيل الكوبون' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh] relative px-4 overflow-hidden py-12">
      
      {/* Cinematic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-500/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Animated Icon Area */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-purple-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full"></div>
          <div className="w-32 h-32 bg-[#121827] border-2 border-white/5 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
             <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent"></div>
             <i className="fas fa-ticket-alt text-6xl text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 to-purple-400"></i>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FF8577] rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <i className="fas fa-gift text-white text-sm"></i>
          </div>
        </div>
        
        {/* Header Text */}
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight text-center">
          كوبونات <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8577] to-pink-500">الهدايا</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl text-center leading-relaxed font-medium mb-12 border-t border-b border-white/5 py-4">
          أدخل كود الكوبون الخاص بك هنا للحصول على رصيد نقاط فوري في محفظتك. تابعنا للحصول على أكواد جديدة وحصرية يومياً!
        </p>

        {/* Coupon Form Container */}
        <div className="w-full max-w-lg bg-[#0F1219]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500">
                <i className="fas fa-barcode text-xl"></i>
              </div>
              <input
                type="text"
                value={code}
                disabled={loading}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكوبون (مثال: GRODD2026)"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pr-14 pl-6 text-center dir-ltr text-white font-black text-xl tracking-[0.2em] placeholder:tracking-normal placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-8 p-4 rounded-2xl text-center font-black flex items-center justify-center gap-3 animate-fade-in ${
              status.type === 'error' 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                : 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
            }`}>
              <i className={`fas ${status.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
              {status.msg}
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={submitCode}
            disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-[#FF8577] to-pink-600 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(236,72,153,0.3)] flex items-center justify-center gap-4 disabled:opacity-50 overflow-hidden relative group/btn"
          >
             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
             {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles"></i>}
             {loading ? 'جاري التحقق...' : 'تفعيل الهدية الآن'}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">تحتاج للمساعدة؟</p>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          </div>
          
          <a 
            href="https://t.me/grodd_labsBot" 
            target="_blank" 
            rel="noreferrer"
            className="group flex items-center gap-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-400/30 px-8 py-4 rounded-3xl transition-all duration-500 shadow-inner"
          >
            <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <i className="fab fa-telegram text-white text-xl"></i>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-lg">انضم لقناتنا</p>
              <p className="text-blue-400/70 text-xs font-bold uppercase tracking-tighter">أكواد وهدايا حصرية يومياً</p>
            </div>
            <i className="fas fa-chevron-left text-slate-600 group-hover:text-white group-hover:-translate-x-1 transition-all mr-4"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

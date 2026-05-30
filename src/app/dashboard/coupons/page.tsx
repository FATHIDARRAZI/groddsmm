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
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4 relative py-12">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/5 blur-[90px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full flex flex-col items-center text-center">
        
        {/* Simple Header */}
        <h1 className="text-3xl font-black text-white mb-2">تفعيل الكوبونات</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          أدخل رمز الكوبون لشحن نقاطك على الفور
        </p>

        {/* Clean Glassmorphism Form Container */}
        <div className="w-full bg-[#121827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative space-y-6">
          
          <div className="relative group">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
              <i className="fas fa-barcode text-lg"></i>
            </div>
            <input
              type="text"
              value={code}
              disabled={loading}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="أدخل رمز الكوبون هنا"
              className="w-full bg-black/30 border border-white/10 rounded-xl py-4.5 pr-12 pl-4 text-center dir-ltr text-white font-bold text-lg tracking-wider focus:outline-none focus:border-pink-500/30 transition-all placeholder:tracking-normal placeholder:text-slate-600"
            />
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-fade-in ${
              status.type === 'error' 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              <i className={`fas ${status.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
              <span>{status.msg}</span>
            </div>
          )}

          <button 
            onClick={submitCode}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
             {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles text-sm"></i>}
             <span>{loading ? 'جاري التحقق...' : 'تفعيل الكوبون'}</span>
          </button>
        </div>

        {/* Minimal Support Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-500">
          <a 
            href="https://t.me/grodd_labsBot" 
            target="_blank" 
            rel="noreferrer" 
            className="text-pink-500/80 hover:text-pink-400 transition-colors flex items-center gap-1.5"
          >
            <i className="fab fa-telegram-plane"></i>
            <span>قناة التليجرام للأكواد اليومية</span>
          </a>
          <span className="hidden sm:inline text-slate-700">|</span>
          <a 
            href="https://www.instagram.com/grodd_media/" 
            target="_blank" 
            rel="noreferrer" 
            className="text-pink-500/80 hover:text-pink-400 transition-colors flex items-center gap-1.5"
          >
            <i className="fab fa-instagram"></i>
            <span>حساب إنستغرام للأكواد اليومية</span>
          </a>
        </div>

      </div>
    </div>
  );
}

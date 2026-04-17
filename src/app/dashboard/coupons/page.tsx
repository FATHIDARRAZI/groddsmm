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
    <div className="w-full animate-fade-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-32 h-32 bg-[#FF8577]/10 rounded-full flex items-center justify-center border border-[#FF8577]/20 mb-8 shadow-[0_0_50px_rgba(255,133,119,0.2)] relative">
         <div className="absolute inset-0 bg-[#FF8577]/20 blur-xl rounded-full"></div>
         <i className="fas fa-ticket-alt text-6xl text-[#FF8577] relative z-10"></i>
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black text-white mb-4">كوبونات النقاط</h1>
      <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed mb-8">
        قم بإدخال كود الهدية هنا وسيتم شحن محفظتك بالنقاط فوراً! تابع قناتنا على التليجرام للحصول على أحدث الأكواد.
      </p>

      <div className="w-full max-w-md bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 shadow-xl relative z-20">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold">
            <i className="fas fa-barcode"></i>
          </div>
          <input
            type="text"
            value={code}
            disabled={loading}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="أدخل الكوبون هنا (مثال: FREE100)"
            className="w-full bg-[#0B0F19] border border-white/5 rounded-xl py-4 pr-12 pl-4 text-center dir-ltr text-white font-bold leading-loose tracking-[0.2em] placeholder-slate-600 focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577] transition-all disabled:opacity-50"
          />
        </div>

        {status && (
          <div className={`mb-4 text-sm font-bold ${status.type === 'error' ? 'text-red-500' : 'text-green-500 animate-bounce'}`}>
            {status.msg}
          </div>
        )}

        <button 
          onClick={submitCode}
          disabled={loading}
          className="w-full py-4 rounded-xl font-extrabold text-white text-lg bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,133,119,0.4)] flex items-center justify-center gap-3 disabled:opacity-50"
        >
           {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
           {loading ? 'جاري التحقق...' : 'تفعيل الكوبون'}
        </button>
      </div>

      <a 
          href="https://t.me/grodd_labsBot" 
          target="_blank" 
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-bold"
        >
          <i className="fab fa-telegram"></i> انضم لقناة التليجرام للحصول على أكواد يومية
      </a>
    </div>
  );
}

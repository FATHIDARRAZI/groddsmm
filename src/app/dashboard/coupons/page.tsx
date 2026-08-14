'use client';

import React, { useState, useEffect } from 'react';

type Coupon = {
  id: string;
  code: string;
  points: number;
  is_redeemed: boolean;
};

export default function CouponsPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons/list');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error('Failed to fetch coupons:', e);
    } finally {
      setFetching(false);
    }
  };

  const submitCode = async (codeToSubmit = code) => {
    if (!codeToSubmit) return setStatus({ type: 'error', msg: 'الرجاء إدخال الكوبون أولاً' });
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToSubmit })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        if (codeToSubmit === code) setCode('');
        
        // Update local list
        setCoupons(prev => prev.map(c => c.code === codeToSubmit ? { ...c, is_redeemed: true } : c));
        
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

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCode(couponCode);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col min-h-[70vh] px-4 relative py-12">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/5 blur-[90px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full flex flex-col items-center text-center">
        
        {/* Simple Header */}
        <h1 className="text-3xl font-black text-white mb-2">تفعيل الكوبونات</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          أدخل رمز الكوبون لشحن نقاطك على الفور
        </p>

        {/* Clean Glassmorphism Form Container */}
        <div className="w-full max-w-md bg-[#121827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative space-y-6 mb-12">
          
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
            onClick={() => submitCode(code)}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
             {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles text-sm"></i>}
             <span>{loading ? 'جاري التحقق...' : 'تفعيل الكوبون'}</span>
          </button>
        </div>

        {/* Available Coupons Section */}
        <div className="w-full flex flex-col text-right mb-4">
           <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-start gap-2">
             <i className="fas fa-ticket-alt text-pink-500"></i>
             الكوبونات المتاحة
           </h2>
           <p className="text-slate-400 text-sm mb-6">
             انسخ أحد الأكواد التالية والصقه في المربع أعلاه للحصول على نقاط مجانية!
           </p>
           
           {fetching ? (
             <div className="flex justify-center py-10">
               <i className="fas fa-spinner fa-spin text-pink-500 text-2xl"></i>
             </div>
           ) : coupons.length === 0 ? (
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-500 font-medium">
               لا توجد أكواد متاحة في الوقت الحالي. تابعنا على إنستغرام للحصول على أكواد جديدة!
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {coupons.map((coupon) => (
                 <div key={coupon.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                   coupon.is_redeemed 
                     ? 'bg-slate-900/50 border-white/5 opacity-60 grayscale' 
                     : 'bg-[#16161A] border-pink-500/20 hover:border-pink-500/40 shadow-lg'
                 }`}>
                   <div className="flex flex-col gap-1">
                     <span className="text-white font-black text-lg tracking-widest dir-ltr text-left">{coupon.code}</span>
                     <span className={`text-xs font-bold ${coupon.is_redeemed ? 'text-slate-500' : 'text-pink-400'}`}>
                       {coupon.points.toLocaleString()} نقطة
                     </span>
                   </div>
                   
                   {coupon.is_redeemed ? (
                     <div className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                       <i className="fas fa-check"></i> مستخدم
                     </div>
                   ) : (
                     <div className="flex gap-2">
                       <button 
                         onClick={() => handleCopy(coupon.code)}
                         className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                         title="نسخ الكود"
                       >
                         <i className="fas fa-copy"></i>
                       </button>
                       <button 
                         onClick={() => submitCode(coupon.code)}
                         disabled={loading}
                         className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                         title="تفعيل الآن"
                       >
                         <i className="fas fa-bolt"></i>
                       </button>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Minimal Support Links */}
        <div className="mt-12 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-500">
          <a 
            href="https://t.me/grodd_media" 
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

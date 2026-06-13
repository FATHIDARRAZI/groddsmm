'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeAdSlot from './SafeAdSlot';

export default function DashboardAdModal({ removeAds = false }: { removeAds?: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [hasClosed, setHasClosed] = useState(false);

  // Initial 15s delay before showing the ad
  useEffect(() => {
    if (removeAds) return;
    if (hasClosed) return;
    
    // Set a timer to trigger the modal 15 seconds after page load/navigation
    const timer = setTimeout(() => {
      setTimeLeft(10);
      setShowModal(true);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [hasClosed, removeAds]);

  // Handle forced UI timer countdown
  useEffect(() => {
    if (removeAds) return;
    if (showModal && timeLeft > 0) {
      const waitTimer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(waitTimer);
    }
  }, [showModal, timeLeft, removeAds]);

  if (removeAds) return null;
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl bg-black/60 p-4">
      <div className="bg-[#121214] border border-[#FF8577]/20 rounded-3xl p-6 w-full max-w-md relative shadow-[0_0_100px_rgba(255,133,119,0.15)] animate-fade-in flex flex-col items-center">
        
        {/* Header/Close Logic */}
        <div className="w-full flex justify-between items-center mb-6">
          <span className="text-[10px] text-slate-500 font-bold tracking-widest bg-white/5 px-3 py-1 rounded-full">إعلان سبونسر</span>
          
          {timeLeft <= 0 ? (
            <button 
              onClick={() => { setShowModal(false); setHasClosed(true); }}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-[#FF8577]/10 text-[#FF8577] border border-[#FF8577]/20 rounded-full text-xs font-bold font-mono">
              يرجى الانتظار {timeLeft}ث
            </div>
          )}
        </div>

        {/* Ad Container */}
        <div className="w-[300px] h-[250px] bg-black rounded-lg overflow-hidden border border-white/5 flex items-center justify-center relative">
           <SafeAdSlot src="/ad-300.html" width="300" height="250" className="border-0 relative z-10" />
           {/* Fallback spinner while iframe loads internally */}
           <i className="fas fa-circle-notch fa-spin absolute text-white/20 text-3xl"></i>
        </div>
        
        <p className="text-xs text-slate-500 mt-6 text-center max-w-xs leading-relaxed">
          شكراً لدعمك المنصة! مشاهدة الإعلانات تساعدنا على إبقاء الخدمات مجانية ومنخفضة التكلفة للجميع.
        </p>
        <p className="text-[10px] text-red-400/90 mt-3 text-center max-w-xs leading-relaxed font-bold bg-red-500/10 py-1.5 px-3 rounded-lg border border-red-500/20">
          إخلاء مسؤولية: الإعلانات غير تابعة لنا. يرجى عدم إيداع الأموال أو ممارسة القمار أو التداول فيها.
        </p>

        <div className="w-full mt-4 pt-4 border-t border-white/5 flex items-center justify-center">
          <Link href="/dashboard/remove-ads" onClick={() => setShowModal(false)} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
        </div>
      </div>
    </div>
  );
}

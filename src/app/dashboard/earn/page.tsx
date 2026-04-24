'use client';

import React, { useEffect, useState } from 'react';
import SafeAdSlot from '@/components/SafeAdSlot';
import { createSupabaseClient } from '@/lib/supabase';

export default function EarnPage() {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Using CPAGrip Offerwall with your ID and tracking_id for secure point crediting
  const OFFERWALL_BASE_URL = 'https://playabledownload.com/show.php?l=1892302&tracking_id=';

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">عروض المهام (Offerwall) 🎁</h1>
          <p className="text-slate-400 text-sm">أكمل الاستبيانات، حمل التطبيقات، واربح آلاف النقاط فوراً. يتم تحديث الرصيد تلقائياً.</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
           <i className="fas fa-gift text-purple-400 text-xl"></i>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-inner">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 mt-1">
          <i className="fas fa-info-circle text-blue-500"></i>
        </div>
        <div>
          <h3 className="text-white font-bold mb-1">كيفية الربح؟</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            اختر أحد العروض أدناه (مثل تحميل لعبة أو إكمال استبيان). بمجرد الانتهاء من متطلبات العرض، سيتم إرسال إشعار إلى نظامنا وستحصل على النقاط تلقائياً. 
            <span className="text-yellow-500 font-bold block mt-1">ملاحظة: بعض العروض قد تستغرق من 5 إلى 15 دقيقة لإضافة النقاط.</span>
          </p>
        </div>
      </div>

      {/* Offerwall Container */}
      <div className="w-full bg-[#0B0F19] rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
             <i className="fas fa-spinner fa-spin text-3xl text-purple-500"></i>
             <p className="text-slate-400 font-bold tracking-widest text-sm">جاري تحميل العروض...</p>
          </div>
        ) : userId ? (
          <iframe 
            src={`${OFFERWALL_BASE_URL}${userId}`}
            className="w-full h-[800px] border-0"
            title="Offerwall"
          ></iframe>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-8">
             <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
               <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
             </div>
             <h3 className="text-white font-bold text-lg">يرجى تسجيل الدخول</h3>
             <p className="text-slate-400 text-sm">يجب أن تكون مسجلاً للدخول لتتمكن من رؤية العروض وكسب النقاط.</p>
          </div>
        )}
      </div>
      
      {/* Banner Ad Area */}
      <div className="w-full mt-12 bg-[#0B0F19]/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
        <p className="absolute text-[10px] text-slate-600 font-black tracking-widest top-3 uppercase">إعلان سبونسر</p>
        <div className="hidden md:flex w-full justify-center">
          <SafeAdSlot src="/ad-728.html" width="728" height="90" className="bg-transparent rounded-lg z-10" />
        </div>
        <div className="flex md:hidden w-full justify-center">
          <SafeAdSlot src="/ad-300.html" width="300" height="250" className="bg-transparent rounded-lg z-10" />
        </div>
      </div>

    </div>
  );
}

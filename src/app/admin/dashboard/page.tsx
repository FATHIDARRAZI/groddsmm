'use client';

import React, { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/admin/AdminSkeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [cooldownMinutes, setCooldownMinutes] = useState(2);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Actions Loading State
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        const cooldown = data.settings?.find((s: any) => s.key === 'order_cooldown_minutes');
        if (cooldown) setCooldownMinutes(cooldown.value);
      } else if (data.sql_hint) {
        setDbError(data.sql_hint);
      }
    } catch (e) {
      console.error('Failed to fetch settings');
    }
  }

  const handleUpdateSetting = async (key: string, value: any) => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        alert('تم تحديث الإعدادات بنجاح');
      } else {
        alert('فشل تحديث الإعدادات');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleClearCookies = () => {
    setActionLoading('cookies');
    // 1. Clear State
    localStorage.clear();
    sessionStorage.clear();
    // 2. Clear Cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    // 3. Reload
    setTimeout(() => {
        window.location.reload();
    }, 1000);
  };

  const handleSyncPrices = async () => {
    setActionLoading('prices');
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_prices' })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'تم تحديث الأسعار بنجاح');
      } else {
        alert(data.error || 'فشل تحديث الأسعار');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الاتصال بالمزود');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 pb-20">
        <div className="flex flex-col gap-2">
           <div className="w-64 h-8 bg-white/5 rounded animate-pulse"></div>
           <div className="w-96 h-4 bg-white/5 rounded animate-pulse mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-12 pb-24 relative z-10 animate-fade-in font-cairo">
      {/* Premium Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-2">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] ml-1">Terminal Status: Online</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter font-outfit uppercase">
               Command Center <span className="text-red-600">.</span>
            </h1>
            <p className="text-slate-500 font-bold max-w-sm">نظرة عامة شاملة على أداء المنصة والوضع المالي والتقني الحالي.</p>
         </div>
         <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest font-outfit">Syncing Live Data</span>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Provider Balance Card */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[50px] rounded-full group-hover:bg-red-600/20 transition-colors"></div>
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Liquidity Status</p>
           <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">${stats?.providerBalance.toFixed(2)}</h3>
              <span className="text-slate-600 text-xs font-black mb-1.5 font-outfit">USD</span>
           </div>
           <p className="mt-8 text-[11px] text-slate-500 leading-relaxed font-bold">
              الرصيد المتاح لدى المزود. تأكد من استمرارية الشحن.
           </p>
        </div>

        {/* Total Circulation Points */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full"></div>
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Market Circulation</p>
           <div className="flex items-end gap-2">
              <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">{stats?.totalCirculatingPoints?.toLocaleString()}</h3>
              <span className="text-slate-600 text-xs font-black mb-1.5 font-outfit">PTS</span>
           </div>
           <p className="mt-8 text-[11px] text-slate-500 leading-relaxed font-bold">
              إجمالي النقاط الموزعة في النظام حالياً.
           </p>
        </div>

        {/* Total Users */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/10 blur-[50px] rounded-full"></div>
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-4">User Database</p>
           <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">{stats?.totalUsers}</h3>
           <p className="mt-8 text-[11px] text-slate-500 leading-relaxed font-bold font-cairo">
              إجمالي الحسابات المسجلة والنشطة.
           </p>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full"></div>
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4">Order Throughput</p>
           <h3 className="text-4xl font-black text-white font-outfit tracking-tighter">{stats?.totalOrders}</h3>
           <p className="mt-8 text-[11px] text-slate-500 leading-relaxed font-bold font-cairo">
              إجمالي الحملات التي تم تشغيلها.
           </p>
        </div>
      </div>

      {/* Quick Actions / System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#121827] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
               <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <i className="fas fa-tools text-blue-500"></i>
                  إعدادات المنصة العامة
               </h4>
               <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div>
                        <p className="text-white font-bold text-lg">وقت الانتظار بين الطلبات</p>
                        <p className="text-slate-500 text-sm">حدد عدد الدقائق التي يجب على المستخدم (الزائر) انتظارها بين الطلبات.</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <input 
                           type="number" 
                           className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600/50 text-center font-black"
                           value={cooldownMinutes}
                           onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                        />
                        <button 
                           onClick={() => handleUpdateSetting('order_cooldown_minutes', cooldownMinutes)}
                           disabled={settingsLoading}
                           className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                        >
                           {settingsLoading ? <i className="fas fa-spinner fa-spin"></i> : 'حفظ'}
                        </button>
                     </div>
                  </div>

                  {dbError && (
                    <div className="bg-yellow-600/10 border border-yellow-600/20 p-6 rounded-2xl">
                       <p className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
                          <i className="fas fa-exclamation-triangle"></i>
                          تنبيه: قاعدة البيانات تتطلب تحديثاً
                       </p>
                       <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                          يرجى تشغيل الأمر البرمجي التالي في لوحة تحكم Supabase SQL لتفعيل الإعدادات:
                       </p>
                       <code className="block bg-black/60 p-4 rounded-lg text-green-500 text-[10px] font-mono select-all">
                          {dbError}
                       </code>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-[#121827] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
               <h4 className="text-xl font-bold text-white mb-6">إجراءات النظام السريعة</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleClearCookies}
                    disabled={!!actionLoading}
                    className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group disabled:opacity-50"
                  >
                     <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        {actionLoading === 'cookies' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
                     </div>
                     <div>
                        <p className="text-white font-bold">مسح الكوكيز القديمة</p>
                        <p className="text-slate-600 text-xs">تحسين أداء المتصفحات للمستخدمين</p>
                     </div>
                  </button>
                  <button 
                    onClick={handleSyncPrices}
                    disabled={!!actionLoading}
                    className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all text-left group disabled:opacity-50"
                  >
                     <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        {actionLoading === 'prices' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                     </div>
                     <div>
                        <p className="text-white font-bold">تحديث أسعار الخدمات</p>
                        <p className="text-slate-600 text-xs">جلب أحدث الأسعار من المزود</p>
                     </div>
                  </button>
               </div>
            </div>
         </div>

         <div className="bg-[#121827] p-8 rounded-[2.5rem] border border-white/5 shadow-xl text-white relative overflow-hidden h-fit">
            <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-red-600/10 blur-[50px] rounded-full"></div>
            <h4 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-3">
               <i className="fas fa-shield-alt text-red-500"></i>
               تنبيهات الأمان والحماية
            </h4>
            <ul className="space-y-6 relative z-10">
               <li className="flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${stats?.security?.apiStatus === 'Operational' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     <i className={`fas ${stats?.security?.apiStatus === 'Operational' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">حالة اتصال المزود (API)</p>
                     <p className={`text-[11px] font-bold ${stats?.security?.apiStatus === 'Operational' ? 'text-green-500' : 'text-red-500'}`}>
                        {stats?.security?.apiStatus === 'Operational' ? 'متصل ويعمل بكفاءة' : 'فشل الاتصال - تفقد المفاتيح'}
                     </p>
                  </div>
               </li>

               <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                     <i className="fas fa-user-slash"></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">الحسابات المحظورة</p>
                     <p className="text-[11px] text-yellow-500 font-bold">
                        تم حظر {stats?.security?.bannedAccounts} حسابات مخالفة حالياً
                     </p>
                  </div>
               </li>

               <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                     <i className="fas fa-fingerprint"></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">نظام الحماية من التعدد</p>
                     <p className="text-[11px] text-blue-500 font-bold">
                        نظام الحظر التلقائي {stats?.security?.multiAccountProtection}
                     </p>
                  </div>
               </li>
            </ul>
         </div>
      </div>
    </div>
  );
}

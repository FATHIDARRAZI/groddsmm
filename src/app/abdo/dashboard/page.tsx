'use client';

import React, { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/admin/AdminSkeleton';
import { toast } from 'react-hot-toast';

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
        toast.success('تم تحديث الإعدادات بنجاح');
      } else {
        toast.error('فشل تحديث الإعدادات');
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
        toast.success(data.message || 'تم تحديث الأسعار بنجاح');
      } else {
        toast.error(data.error || 'فشل تحديث الأسعار');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الاتصال بالمزود');
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
    <div className="space-y-8 pb-12 relative z-10 font-cairo">
      {/* Premium Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter uppercase">
               Dashboard
            </h1>
            <p className="text-slate-400 text-sm">نظرة عامة على أداء المنصة والوضع الحالي.</p>
         </div>
         <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Syncing Live Data</span>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Provider Balance Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Liquidity Status</p>
           <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-white tracking-tighter">${stats?.providerBalance.toFixed(2)}</h3>
              <span className="text-slate-500 text-xs font-bold mb-1">USD</span>
           </div>
           <p className="mt-4 text-xs text-slate-500">الرصيد المتاح لدى المزود.</p>
        </div>

        {/* Total Circulation Points */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Market Circulation</p>
           <div className="flex items-end gap-2">
              <h3 className="text-3xl font-bold text-white tracking-tighter">{stats?.totalCirculatingPoints?.toLocaleString()}</h3>
              <span className="text-slate-500 text-xs font-bold mb-1">PTS</span>
           </div>
           <p className="mt-4 text-xs text-slate-500">إجمالي النقاط الموزعة.</p>
        </div>

        {/* Total Users */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">User Database</p>
           <h3 className="text-3xl font-bold text-white tracking-tighter">{stats?.totalUsers}</h3>
           <p className="mt-4 text-xs text-slate-500 font-cairo">إجمالي الحسابات المسجلة.</p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Throughput</p>
           <h3 className="text-3xl font-bold text-white tracking-tighter">{stats?.totalOrders}</h3>
           <p className="mt-4 text-xs text-slate-500 font-cairo">إجمالي الطلبات.</p>
        </div>
      </div>

      {/* Quick Actions / System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
               <h4 className="text-lg font-bold text-white mb-6">إعدادات المنصة العامة</h4>
               <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div>
                        <p className="text-white font-bold">وقت الانتظار بين الطلبات</p>
                        <p className="text-slate-400 text-xs">الدقائق التي يجب على المستخدم انتظارها بين الطلبات.</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <input 
                           type="number" 
                           className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-center font-bold"
                           value={cooldownMinutes}
                           onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                        />
                        <button 
                           onClick={() => handleUpdateSetting('order_cooldown_minutes', cooldownMinutes)}
                           disabled={settingsLoading}
                           className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
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

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
               <h4 className="text-lg font-bold text-white mb-6">إجراءات النظام السريعة</h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleClearCookies}
                    disabled={!!actionLoading}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4 hover:bg-slate-800 transition-all text-left disabled:opacity-50"
                  >
                     <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        {actionLoading === 'cookies' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-alt"></i>}
                     </div>
                     <div>
                        <p className="text-white font-bold text-sm">مسح الكوكيز القديمة</p>
                        <p className="text-slate-500 text-xs">لتحسين أداء المتصفحات</p>
                     </div>
                  </button>
                  <button 
                    onClick={handleSyncPrices}
                    disabled={!!actionLoading}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-4 hover:bg-slate-800 transition-all text-left disabled:opacity-50"
                  >
                     <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        {actionLoading === 'prices' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                     </div>
                     <div>
                        <p className="text-white font-bold text-sm">تحديث أسعار الخدمات</p>
                        <p className="text-slate-500 text-xs">جلب أحدث الأسعار</p>
                     </div>
                  </button>
               </div>
            </div>
         </div>

         <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white relative overflow-hidden h-fit">
            <h4 className="text-lg font-bold mb-6 relative z-10">تنبيهات الأمان والحماية</h4>
            <ul className="space-y-4 relative z-10">
               <li className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stats?.security?.apiStatus === 'Operational' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     <i className={`fas ${stats?.security?.apiStatus === 'Operational' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">حالة اتصال المزود (API)</p>
                     <p className={`text-xs font-bold ${stats?.security?.apiStatus === 'Operational' ? 'text-green-400' : 'text-red-400'}`}>
                        {stats?.security?.apiStatus === 'Operational' ? 'متصل ويعمل بكفاءة' : 'فشل الاتصال'}
                     </p>
                  </div>
               </li>

               <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                     <i className="fas fa-user-slash"></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">الحسابات المحظورة</p>
                     <p className="text-xs text-slate-400">
                        تم حظر {stats?.security?.bannedAccounts} حساب
                     </p>
                  </div>
               </li>

               <li className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                     <i className="fas fa-fingerprint"></i>
                  </div>
                  <div>
                     <p className="text-sm font-bold">نظام الحماية</p>
                     <p className="text-xs text-slate-400">
                        {stats?.security?.multiAccountProtection}
                     </p>
                  </div>
               </li>
            </ul>
         </div>
      </div>
    </div>
  );
}

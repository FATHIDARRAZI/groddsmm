'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error('Failed to fetch coupons');
    } finally {
      setFetching(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, points })
      });
      const data = await res.json();
      
      if (data.success) {
        setCode('');
        await fetchCoupons();
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('تعذر إنشاء الكوبون');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الكوبون؟')) return;
    
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) await fetchCoupons();
    } catch (e) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl space-y-12 pb-24">
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-black text-white">إدارة الكوبونات</h1>
         <p className="text-slate-500 font-bold">إنشاء وتوزيع رموز المكافآت للمستخدمين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-[#121827] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden h-fit sticky top-10">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[50px] rounded-full"></div>
           <h4 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <i className="fas fa-plus-circle text-red-600"></i> إنشاء كوبون جديد
           </h4>
           
           <form onSubmit={handleCreateCoupon} className="space-y-6 relative z-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">كود الكوبون</label>
                 <input 
                    type="text" 
                    required
                    placeholder="مثال: RAMADAN24"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-600/50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">قيمة النقاط</label>
                 <input 
                    type="number" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-600/50"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                 />
              </div>

              {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'تفعيل الكود في النظام'}
              </button>
           </form>
        </div>

        {/* Coupon Inventory Table */}
        <div className="lg:col-span-2 bg-[#121827] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-bold text-white">الكوبونات النشطة حالياً</h4>
              <span className="bg-white/5 px-4 py-1.5 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {coupons.length} Active Codes
              </span>
           </div>

           {fetching ? (
             <div className="p-20 text-center text-slate-600 font-bold">جاري جلب البيانات من الخادم...</div>
           ) : coupons.length === 0 ? (
             <div className="p-20 text-center text-slate-600 italic">لا توجد كوبونات فعالة حالياً.</div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead>
                     <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4">الكود</th>
                        <th className="px-6 py-4 text-center">النقاط</th>
                        <th className="px-6 py-4 text-center">الاستخدامات</th>
                        <th className="px-6 py-4 text-center">الإجراء</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {coupons.map((c) => (
                       <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5">
                             <span className="font-mono text-white font-black tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">{c.code}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <span className="text-green-500 font-black">{c.points}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <div className="flex flex-col items-center">
                                <span className="text-white font-bold">{c.usage_count}</span>
                                <span className="text-[8px] text-slate-500 uppercase font-black">Redeemed</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <button 
                               onClick={() => handleDeleteCoupon(c.id)}
                               className="w-10 h-10 bg-red-600/10 text-red-500 rounded-xl border border-red-600/10 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                             >
                                <i className="fas fa-trash-alt"></i>
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

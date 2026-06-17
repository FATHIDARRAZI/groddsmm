'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

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
        toast.success('تم إنشاء الكوبون بنجاح');
        await fetchCoupons();
      } else {
        toast.error(data.error || 'فشل إنشاء الكوبون');
        setError(data.error);
      }
    } catch (e) {
      toast.error('تعذر إنشاء الكوبون');
      setError('تعذر إنشاء الكوبون');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الكوبون؟')) return;
    
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم حذف الكوبون بنجاح');
        await fetchCoupons();
      } else {
        toast.error('فشل حذف الكوبون');
      }
    } catch (e) {
      console.error('Delete failed');
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  return (
    <div className="max-w-6xl space-y-12 pb-24">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-6">
         <h1 className="text-2xl font-bold text-white">إدارة الكوبونات</h1>
         <p className="text-slate-400 text-sm">إنشاء وتوزيع رموز المكافآت للمستخدمين</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 p-6 relative overflow-hidden h-fit sticky top-10">
           <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <i className="fas fa-plus-circle text-blue-500"></i> إنشاء كوبون جديد
           </h4>
           
           <form onSubmit={handleCreateCoupon} className="space-y-4 relative z-10">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase px-1">كود الكوبون</label>
                 <input 
                    type="text" 
                    required
                    placeholder="مثال: RAMADAN24"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase px-1">قيمة النقاط</label>
                 <input 
                    type="number" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                 />
              </div>

              {error && <p className="text-xs text-red-500 font-bold px-1">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'تفعيل الكود في النظام'}
              </button>
           </form>
        </div>

        {/* Coupon Inventory Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
           <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-white">الكوبونات النشطة حالياً</h4>
              <span className="bg-slate-800 px-3 py-1 rounded text-slate-400 text-xs font-bold">
                {coupons.length} Active Codes
              </span>
           </div>

           {fetching ? (
             <div className="p-12 text-center text-slate-500 font-bold">جاري جلب البيانات من الخادم...</div>
           ) : coupons.length === 0 ? (
             <div className="p-12 text-center text-slate-500 italic">لا توجد كوبونات فعالة حالياً.</div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead>
                     <tr className="bg-slate-950 text-slate-400 text-xs font-bold border-b border-slate-800">
                        <th className="px-6 py-4">الكود</th>
                        <th className="px-6 py-4 text-center">النقاط</th>
                        <th className="px-6 py-4 text-center">الاستخدامات</th>
                        <th className="px-6 py-4 text-center">الإجراء</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {coupons.map((c) => (
                       <tr key={c.id} className="hover:bg-slate-800/50 transition-colors text-sm">
                          <td className="px-6 py-4">
                             <span className="font-mono text-white font-bold bg-slate-950 px-3 py-1 rounded border border-slate-800">{c.code}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <span className="text-green-500 font-bold">{c.points}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className="flex flex-col items-center">
                                <span className="text-white font-bold">{c.usage_count}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Redeemed</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <button 
                               onClick={() => handleDeleteCoupon(c.id)}
                               className="w-8 h-8 bg-red-500/10 text-red-500 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center"
                             >
                                <i className="fas fa-trash-alt text-xs"></i>
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

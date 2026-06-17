'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/history');
      const json = await res.json();
      if (json.data) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Processing':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold">قيد المعالجة</span>;
      case 'In progress':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-xs font-bold">جاري التنفيذ</span>;
      case 'Completed':
        return <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold">مكتمل</span>;
      case 'Partial':
        return <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-bold">مكتمل جزئياً</span>;
      case 'Canceled':
        return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold">ملغي</span>;
      default:
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 rounded-full text-xs font-bold">{status || 'غير معروف'}</span>;
    }
  };

  return (
    <div className="w-full animate-fade-in relative z-10 pb-20 dir-rtl">
      
      <div className="mb-8">
         <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <i className="fas fa-history text-[#FF8577]"></i>
            سجل الطلبات
         </h1>
         <p className="text-slate-400 mt-2 font-bold text-sm">تتبع حالة طلباتك ومسار التنفيذ في الوقت الفعلي.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 border-white/5 bg-[#09090b]/80 backdrop-blur-3xl shadow-xl">
         {loading ? (
           <div className="flex justify-center items-center py-20">
              <i className="fas fa-spinner fa-spin text-4xl text-[#FF8577]"></i>
           </div>
         ) : orders.length === 0 ? (
           <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                 <i className="fas fa-box-open text-3xl text-slate-500"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات بعد</h3>
              <p className="text-slate-400 mb-6 text-sm">لم تقم بإضافة أي طلبات حتى الآن.</p>
              <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-[#1F0A07] rounded-xl font-black text-sm hover:opacity-90 transition-all shadow-lg inline-block">
                 اطلب الآن
              </Link>
           </div>
         ) : (
           <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-right border-collapse">
               <thead>
                 <tr className="border-b border-white/10">
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">رقم الطلب</th>
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">الخدمة</th>
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">الرابط</th>
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">الكمية</th>
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">الحالة</th>
                   <th className="p-4 text-slate-400 font-bold text-xs uppercase tracking-wider">التاريخ</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {orders.map((order) => (
                   <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                     <td className="p-4">
                        <span className="font-mono text-xs font-bold text-[#FF8577]">#{order.provider_order_id}</span>
                     </td>
                     <td className="p-4">
                        <div className="font-bold text-sm text-white">{order.service_type === 'followers' ? 'متابعين' : 'مشاهدات'}</div>
                     </td>
                     <td className="p-4 max-w-[150px] truncate">
                        <a href={order.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline dir-ltr inline-block truncate w-full text-left">
                           {order.link}
                        </a>
                     </td>
                     <td className="p-4">
                        <div className="text-sm font-bold text-slate-300">{order.quantity}</div>
                     </td>
                     <td className="p-4">
                        {getStatusBadge(order.live_status || order.status)}
                     </td>
                     <td className="p-4">
                        <div className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o: any) => 
    o.provider_order_id?.includes(searchTerm) || 
    o.link?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-white">جميع طلبات المنصة</h1>
            <p className="text-slate-400 text-sm">متابعة حية لكل العمليات التي تتم عبر النظام</p>
         </div>
         <div className="relative">
            <input 
              type="text" 
              placeholder="البحث بالرابط أو معرف الطلب..." 
              className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-80 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
         </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">ID المزود</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">المستخدم</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">نوع الخدمة</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">الرابط المستهدف</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">الكمية</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">التكلفة</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">الحالة</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">التاريخ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <>
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </>
                  ) : (
                    filteredOrders.map((order: any) => {
                      const profile = order.profiles;
                      const userName = profile?.fullName || profile?.full_name || profile?.username || 'مستخدم مجهول';
                      
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/50 transition-colors text-sm">
                           <td className="px-6 py-5 text-center">
                              <span className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-lg border border-blue-600/10 font-bold">
                                 #{order.provider_order_id}
                              </span>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex flex-col">
                                 <span className="text-white font-bold">{userName}</span>
                                 <span className="text-[10px] text-slate-500 truncate w-32">{order.user_id}</span>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <span className="text-slate-300 font-bold">{order.service_type}</span>
                           </td>
                           <td className="px-6 py-5">
                              <a 
                                href={order.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-blue-400 hover:text-blue-300 underline truncate block w-48 text-[11px]"
                              >
                                 {order.link}
                              </a>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <span className="text-white font-black">{order.quantity}</span>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <span className="text-yellow-500 font-black">{order.points_cost} PTS</span>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                                order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-5 text-center text-[10px] text-slate-500">
                              {new Date(order.created_at).toLocaleString('en-GB')}
                           </td>
                        </tr>
                      );
                    })
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

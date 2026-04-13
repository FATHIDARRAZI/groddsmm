'use client';

import React, { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/history');
        const { data } = await res.json();
        if (data) {
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">سجل الطلبات 📜</h1>
          <p className="text-slate-400 text-sm">تابع حالة جميع طلباتك السابقة الحالية لتقييم النتائج.</p>
        </div>
        <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center border border-white/5">
           <i className="fas fa-history text-[#FF8577] text-xl"></i>
        </div>
      </div>

      <div className="w-full bg-[#1C1C1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-[#0B0F19]/50 border-b border-white/5">
              <tr>
                <th scope="col" className="px-6 py-4 font-black">رقم الطلب</th>
                <th scope="col" className="px-6 py-4 font-black">الرابط</th>
                <th scope="col" className="px-6 py-4 font-black">التكلفة (Charge)</th>
                <th scope="col" className="px-6 py-4 font-black">البداية (Start)</th>
                <th scope="col" className="px-6 py-4 font-black">المتبقي (Remains)</th>
                <th scope="col" className="px-6 py-4 font-black">الكمية</th>
                <th scope="col" className="px-6 py-4 font-black text-center">الحالة (Status)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <i className="fas fa-circle-notch fa-spin text-[#FF8577] text-2xl"></i>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-bold">لا يوجد طلبات سابقة.</td>
                </tr>
              ) : (
                orders.map((order, i) => {
                  const s = (order.live_status || 'Pending').toLowerCase();
                  const isDone = s === 'completed';
                  const isErr = s === 'canceled' || s === 'cancelled' || s === 'partial';

                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#FF8577]">#{order.provider_order_id}</td>
                      <td className="px-6 py-4 dir-ltr text-left text-xs max-w-[150px] truncate">{order.link}</td>
                      <td className="px-6 py-4 font-bold">{order.provider_charge || order.points_cost} {order.currency || 'pts'}</td>
                      <td className="px-6 py-4 font-mono text-white">{order.start_count}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{order.remains}</td>
                      <td className="px-6 py-4 font-mono text-white">{order.quantity}</td>
                      <td className="px-6 py-4 text-center items-center justify-center flex mt-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isDone ? 'bg-green-500/10 text-green-500' : isErr ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {order.live_status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Placeholder for absolutely positioned Ad or Pagination */}
      </div>
    </div>
  );
}

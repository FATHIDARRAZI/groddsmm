'use client';

import React from 'react';

export default function HistoryPage() {
  const dummyHistory = [
    { id: '#99812', link: 'instagram.com/p/...', service: 'لايكات', qty: 50, date: '12/04/2026', status: 'مكتمل' },
    { id: '#99811', link: 'tiktok.com/@u/...', service: 'مشاهدات', qty: 1000, date: '11/04/2026', status: 'جاري' },
    { id: '#99810', link: 'twitter.com/i/...', service: 'لايكات', qty: 200, date: '09/04/2026', status: 'مكتمل' },
  ];

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
                <th scope="col" className="px-6 py-4 font-black">الخدمة</th>
                <th scope="col" className="px-6 py-4 font-black">الكمية</th>
                <th scope="col" className="px-6 py-4 font-black">التاريخ</th>
                <th scope="col" className="px-6 py-4 font-black text-center">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {dummyHistory.map((order, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#FF8577]">{order.id}</td>
                  <td className="px-6 py-4 dir-ltr text-left text-xs max-w-[150px] truncate">{order.link}</td>
                  <td className="px-6 py-4 font-bold">{order.service}</td>
                  <td className="px-6 py-4 font-mono text-white">{order.qty}</td>
                  <td className="px-6 py-4 text-xs font-mono">{order.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      order.status === 'مكتمل' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Placeholder for absolutely positioned Ad or Pagination */}
      </div>
    </div>
  );
}

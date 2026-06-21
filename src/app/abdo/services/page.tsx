'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  category: string;
  service_type: string;
  provider_service_id: string;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (res.ok) {
        setServices(data);
      } else {
        toast.error(data.error || 'فشل جلب الخدمات');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Service>) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('تم التحديث بنجاح');
        fetchServices();
      } else {
        toast.error(data.error || 'فشل التحديث');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleSync = async (id: string, provider_service_id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch('/api/admin/services/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, provider_service_id })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`تمت المزامنة: (Min: ${data.min}, Max: ${data.max})`);
        fetchServices();
      } else {
        toast.error(data.error || 'فشل استيراد بيانات الخدمة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء مزامنة الخدمة');
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo">
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400 tracking-tight">
              إدارة الخدمات
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-medium">
              التحكم الشامل في معرفات الخدمات المرتبطة بمزود الـ SMM، حدود الكميات، وحالة التفعيل.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
             <i className="fas fa-server text-blue-500 text-xl"></i>
             <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">إجمالي الخدمات</p>
                <p className="text-white font-bold text-lg">{services.length}</p>
             </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-right border-collapse">
               <thead>
                 <tr className="bg-slate-950/50 text-slate-400 font-bold border-b border-slate-800/60">
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">المنصة</th>
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">الخدمة</th>
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">ID المزود</th>
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">الحد الأدنى</th>
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">الحد الأقصى</th>
                   <th className="px-8 py-5 text-xs tracking-wider uppercase font-extrabold">الحالة</th>
                   <th className="px-8 py-5 text-center text-xs tracking-wider uppercase font-extrabold">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/40">
                 {services.map((service) => (
                   <tr key={service.id} className="group hover:bg-slate-800/30 transition-all duration-300">
                     <td className="px-8 py-5 font-bold text-white flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/5 bg-slate-800/50 group-hover:scale-110 transition-transform duration-300">
                         {service.category === 'instagram' && <i className="fab fa-instagram text-2xl text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]"></i>}
                         {service.category === 'tiktok' && <i className="fab fa-tiktok text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"></i>}
                         {service.category === 'facebook' && <i className="fab fa-facebook text-2xl text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"></i>}
                       </div>
                       <span className="capitalize tracking-wide text-base">{service.category}</span>
                     </td>
                     
                     <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="text-white font-bold text-base">
                            {service.service_type === 'followers' && 'متابعين'}
                            {service.service_type === 'likes' && 'لايكات'}
                            {service.service_type === 'views' && 'مشاهدات'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">({service.service_type})</span>
                       </div>
                     </td>
                     
                     <td className="px-8 py-5">
                       <div className="relative group/input">
                         <input 
                           type="text" 
                           defaultValue={service.provider_service_id}
                           onBlur={(e) => {
                             if (e.target.value !== service.provider_service_id) {
                               handleUpdate(service.id, { provider_service_id: e.target.value });
                             }
                           }}
                           className="w-24 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-center font-mono font-bold transition-all"
                         />
                         <div className="absolute inset-0 bg-blue-500/10 rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none"></div>
                       </div>
                     </td>
                     
                     <td className="px-8 py-5">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 font-mono text-sm border border-slate-700/50">
                          {service.min_quantity.toLocaleString()}
                        </span>
                     </td>
                     
                     <td className="px-8 py-5">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 font-mono text-sm border border-slate-700/50">
                          {service.max_quantity.toLocaleString()}
                        </span>
                     </td>
                     
                     <td className="px-8 py-5">
                       <button
                         onClick={() => handleUpdate(service.id, { is_active: !service.is_active })}
                         className={`relative overflow-hidden px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                           service.is_active 
                             ? 'text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                             : 'text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                         }`}
                       >
                         <span className="relative z-10 flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${service.is_active ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                           {service.is_active ? 'مفعل' : 'معطل'}
                         </span>
                       </button>
                     </td>
                     
                     <td className="px-8 py-5 text-center">
                       <button
                         onClick={() => handleSync(service.id, service.provider_service_id)}
                         disabled={syncingId === service.id}
                         className="group/btn relative overflow-hidden inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                       >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                         <span className="relative z-10 flex items-center gap-2">
                           {syncingId === service.id ? (
                             <i className="fas fa-spinner animate-spin text-lg"></i>
                           ) : (
                             <i className="fas fa-cloud-download-alt text-lg group-hover/btn:scale-110 transition-transform"></i>
                           )}
                           استيراد البيانات
                         </span>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </main>
  );
}

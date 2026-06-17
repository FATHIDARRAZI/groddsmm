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
    <main className="flex-1 p-6 md:p-8 ml-0 md:ml-72 pb-32 md:pb-8 min-h-screen relative dir-rtl text-right">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold text-white mb-2">إدارة الخدمات</h1>
          <p className="text-slate-400 text-sm">تحكم في معرفات الخدمات (IDs) المتصلة بمزود الـ SMM وحدود الكمية الخاصة بها.</p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-right">
               <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                 <tr>
                   <th className="px-6 py-4">المنصة</th>
                   <th className="px-6 py-4">الخدمة</th>
                   <th className="px-6 py-4">ID المزود</th>
                   <th className="px-6 py-4">الحد الأدنى</th>
                   <th className="px-6 py-4">الحد الأقصى</th>
                   <th className="px-6 py-4">الحالة</th>
                   <th className="px-6 py-4 text-center">الإجراءات</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {services.map((service) => (
                   <tr key={service.id} className="hover:bg-slate-800/50 transition-colors">
                     <td className="px-6 py-4 font-bold text-white uppercase flex items-center gap-2">
                       {service.category === 'instagram' && <i className="fab fa-instagram text-pink-500"></i>}
                       {service.category === 'tiktok' && <i className="fab fa-tiktok text-white"></i>}
                       {service.category === 'facebook' && <i className="fab fa-facebook text-blue-500"></i>}
                       {service.category}
                     </td>
                     <td className="px-6 py-4 text-slate-300 font-bold">
                       {service.service_type === 'followers' && 'متابعين'}
                       {service.service_type === 'likes' && 'لايكات'}
                       {service.service_type === 'views' && 'مشاهدات'}
                       <span className="text-xs text-slate-500 block">({service.service_type})</span>
                     </td>
                     <td className="px-6 py-4">
                       <input 
                         type="text" 
                         defaultValue={service.provider_service_id}
                         onBlur={(e) => {
                           if (e.target.value !== service.provider_service_id) {
                             handleUpdate(service.id, { provider_service_id: e.target.value });
                           }
                         }}
                         className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-center font-mono"
                       />
                     </td>
                     <td className="px-6 py-4 text-slate-400 font-mono">{service.min_quantity}</td>
                     <td className="px-6 py-4 text-slate-400 font-mono">{service.max_quantity}</td>
                     <td className="px-6 py-4">
                       <button
                         onClick={() => handleUpdate(service.id, { is_active: !service.is_active })}
                         className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                           service.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                         }`}
                       >
                         {service.is_active ? 'نشط' : 'معطل'}
                       </button>
                     </td>
                     <td className="px-6 py-4 text-center">
                       <button
                         onClick={() => handleSync(service.id, service.provider_service_id)}
                         disabled={syncingId === service.id}
                         className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-xl font-bold transition-all disabled:opacity-50"
                       >
                         {syncingId === service.id ? (
                           <i className="fas fa-spinner animate-spin"></i>
                         ) : (
                           <i className="fas fa-sync-alt"></i>
                         )}
                         استيراد التفاصيل
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

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminCollabPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/collab');
      const data = await res.json();
      if (data.error) {
        toast.error('API Error: ' + data.error);
        console.error(data.error);
      } else if (data.requests) {
        setRequests(data.requests);
      }
    } catch (e: any) {
      toast.error('Failed to fetch requests: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'declined', note?: string) => {
    try {
      const res = await fetch('/api/admin/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, admin_note: note || '' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم تحديث الطلب بنجاح إلى ${status === 'accepted' ? 'مقبول' : 'مرفوض'}`);
        fetchRequests();
      } else {
        toast.error(data.error || 'فشل تحديث الطلب');
      }
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const handleAccept = (id: string) => {
    if (confirm('هل أنت متأكد من قبول هذا الطلب؟')) {
      handleStatusUpdate(id, 'accepted');
    }
  };

  const openDeclineModal = (id: string) => {
    setSelectedRequestId(id);
    setAdminNote('');
    setShowNoteModal(true);
  };

  const confirmDecline = () => {
    if (selectedRequestId && adminNote.trim() !== '') {
      handleStatusUpdate(selectedRequestId, 'declined', adminNote);
      setShowNoteModal(false);
    } else {
      toast.error('يرجى كتابة سبب الرفض');
    }
  };

  if (loading) {
    return <div className="p-8 text-white">جاري التحميل...</div>;
  }

  return (
    <div className="flex-1 p-6 md:p-10 pb-24 lg:pb-10 relative overflow-hidden min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/20">إدارة الشراكات</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">طلبات الشراكة 🤝</h1>
        </div>
      </div>

      <div className="bg-[#0B0F19]/80 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 overflow-x-auto">
        <table className="w-full text-right text-sm text-slate-300 min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 text-slate-500">
              <th className="py-4 px-4 font-bold">اسم المستخدم (انستقرام)</th>
              <th className="py-4 px-4 font-bold">حساب المنصة</th>
              <th className="py-4 px-4 font-bold">الحالة</th>
              <th className="py-4 px-4 font-bold">التاريخ</th>
              <th className="py-4 px-4 font-bold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <a href={`https://instagram.com/${req.username}`} target="_blank" className="text-blue-400 font-bold hover:underline" rel="noreferrer">
                    @{req.username}
                  </a>
                </td>
                <td className="py-4 px-4">
                  {req.profiles?.full_name} <br/>
                  <span className="text-xs text-slate-500">{req.profiles?.email}</span>
                </td>
                <td className="py-4 px-4">
                  {req.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">قيد المراجعة</span>}
                  {req.status === 'accepted' && <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold">مقبول</span>}
                  {req.status === 'declined' && <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold">مرفوض</span>}
                </td>
                <td className="py-4 px-4 text-xs text-slate-500">
                  {new Date(req.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="py-4 px-4 text-left">
                  {req.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAccept(req.id)} className="bg-green-500/10 text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-xl font-bold transition-all text-xs border border-green-500/20">
                        قبول
                      </button>
                      <button onClick={() => openDeclineModal(req.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold transition-all text-xs border border-red-500/20">
                        رفض
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">تم اتخاذ إجراء</span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">لا توجد طلبات شراكة حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121827] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-fade-in">
             <h3 className="text-xl font-bold text-white mb-4">سبب الرفض</h3>
             <p className="text-slate-400 text-sm mb-6">يرجى كتابة سبب رفض الطلب، سيظهر هذا السبب للمستخدم في لوحة التحكم الخاصة به.</p>
             <textarea 
               value={adminNote}
               onChange={(e) => setAdminNote(e.target.value)}
               className="w-full h-32 bg-[#0B0F19] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-red-500/50 mb-6"
               placeholder="مثال: الحساب وهمي، أو لا يمتلك عدد كافي من المتابعين..."
             ></textarea>
             <div className="flex gap-4">
               <button onClick={confirmDecline} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                 تأكيد الرفض
               </button>
               <button onClick={() => setShowNoteModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5">
                 إلغاء
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

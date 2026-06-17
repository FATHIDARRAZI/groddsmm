'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminCollabPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // Bounty note modal state
  const [showBountyModal, setShowBountyModal] = useState(false);
  const [selectedBountyId, setSelectedBountyId] = useState<string | null>(null);
  const [bountyUserId, setBountyUserId] = useState<string | null>(null);
  const [bountyNote, setBountyNote] = useState('');
  const [bountyAction, setBountyAction] = useState<'approved' | 'rejected' | null>(null);
  const [bountyReward, setBountyReward] = useState<number>(0);

  const fetchRequests = async () => {
    try {
      const [resCollab, resBounties] = await Promise.all([
        fetch('/api/admin/collab'),
        fetch('/api/admin/bounties')
      ]);
      const dataCollab = await resCollab.json();
      const dataBounties = await resBounties.json();
      
      if (dataCollab.requests) setRequests(dataCollab.requests);
      if (dataBounties.success && dataBounties.data) setBounties(dataBounties.data);
      
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

  const handleBountyUpdate = async () => {
    if (bountyAction === 'rejected' && bountyNote.trim() === '') {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }
    try {
      const res = await fetch('/api/admin/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          submissionId: selectedBountyId, 
          status: bountyAction, 
          note: bountyNote,
          userId: bountyUserId,
          rewardPoints: bountyAction === 'approved' ? bountyReward : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم ${bountyAction === 'approved' ? 'قبول' : 'رفض'} المكافأة بنجاح`);
        fetchRequests();
        setShowBountyModal(false);
      } else {
        toast.error(data.error || 'فشل التحديث');
      }
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const openBountyModal = (id: string, userId: string, action: 'approved' | 'rejected', defaultReward: number = 0) => {
    setSelectedBountyId(id);
    setBountyUserId(userId);
    setBountyAction(action);
    setBountyReward(defaultReward);
    setBountyNote('');
    setShowBountyModal(true);
  };

  if (loading) {
    return <div className="p-8 text-white">جاري التحميل...</div>;
  }

  return (
    <div className="flex-1 p-6 md:p-10 pb-24 lg:pb-10 relative overflow-hidden min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-blue-500/20">إدارة الشراكات</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">طلبات الشراكة 🤝</h1>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-300 min-w-[800px]">
            <thead className="bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">اسم المستخدم (انستقرام)</th>
                <th className="py-4 px-6 font-bold">حساب المنصة</th>
                <th className="py-4 px-6 font-bold">الحالة</th>
                <th className="py-4 px-6 font-bold">التاريخ</th>
                <th className="py-4 px-6 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-6">
                  <a href={`https://instagram.com/${req.username}`} target="_blank" className="text-blue-400 font-bold hover:underline" rel="noreferrer">
                    @{req.username}
                  </a>
                </td>
                <td className="py-4 px-6">
                  {req.profiles?.full_name} <br/>
                  <span className="text-xs text-slate-500">{req.profiles?.email}</span>
                </td>
                <td className="py-4 px-6">
                  {req.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs font-bold">قيد المراجعة</span>}
                  {req.status === 'accepted' && <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-bold">مقبول</span>}
                  {req.status === 'declined' && <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-xs font-bold">مرفوض</span>}
                </td>
                <td className="py-4 px-6 text-xs text-slate-500">
                  {new Date(req.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="py-4 px-6 text-left">
                  {req.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleAccept(req.id)} className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded font-bold transition-all text-xs border border-green-500/20">
                        قبول
                      </button>
                      <button onClick={() => openDeclineModal(req.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded font-bold transition-all text-xs border border-red-500/20">
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
      </div>

      {/* BOUNTY SUBMISSIONS TABLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-12 relative z-10 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">مهام الشركاء (Bounties) 🎁</h2>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-300 min-w-[800px]">
            <thead className="bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 font-bold">المستخدم</th>
                <th className="py-4 px-6 font-bold">المهمة</th>
                <th className="py-4 px-6 font-bold">الرابط</th>
                <th className="py-4 px-6 font-bold">الحالة</th>
                <th className="py-4 px-6 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
            {bounties.map(b => (
              <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-6">
                  {b.user_name} <br/>
                  <span className="text-xs text-slate-500">{b.user_email}</span>
                </td>
                <td className="py-4 px-6 font-bold text-blue-400">
                  {b.bounty_id === 'tiktok_review' && 'مراجعة تيك توك'}
                  {b.bounty_id === 'ig_reel' && 'ريلز انستقرام'}
                  {b.bounty_id === 'yt_video' && 'فيديو يوتيوب'}
                </td>
                <td className="py-4 px-6">
                  <a href={b.proof_url} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1" rel="noreferrer">
                    <i className="fas fa-external-link-alt text-[10px]"></i> عرض الإثبات
                  </a>
                </td>
                <td className="py-4 px-6">
                  {b.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded text-xs font-bold">قيد المراجعة</span>}
                  {b.status === 'approved' && <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-bold">مقبول</span>}
                  {b.status === 'rejected' && <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-xs font-bold">مرفوض</span>}
                </td>
                <td className="py-4 px-6 text-left">
                  {b.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openBountyModal(b.id, b.user_id, 'approved', b.bounty_id === 'tiktok_review' ? 10000 : b.bounty_id === 'ig_reel' ? 5000 : 50000)} className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded font-bold transition-all text-xs border border-green-500/20">
                        قبول ومنح
                      </button>
                      <button onClick={() => openBountyModal(b.id, b.user_id, 'rejected')} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded font-bold transition-all text-xs border border-red-500/20">
                        رفض
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">منتهي</span>
                  )}
                </td>
              </tr>
            ))}
            {bounties.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">لا توجد مهام مسلمة حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl relative animate-fade-in">
             <h3 className="text-xl font-bold text-white mb-2">سبب الرفض</h3>
             <p className="text-slate-400 text-sm mb-4">يرجى كتابة سبب رفض الطلب، سيظهر هذا السبب للمستخدم في لوحة التحكم الخاصة به.</p>
             <textarea 
               value={adminNote}
               onChange={(e) => setAdminNote(e.target.value)}
               className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mb-6"
               placeholder="مثال: الحساب وهمي، أو لا يمتلك عدد كافي من المتابعين..."
             ></textarea>
             <div className="flex gap-4">
               <button onClick={confirmDecline} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition-all">
                 تأكيد الرفض
               </button>
               <button onClick={() => setShowNoteModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-all border border-slate-700">
                 إلغاء
               </button>
             </div>
          </div>
        </div>
      )}

      {showBountyModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl relative animate-fade-in">
             <h3 className={`text-xl font-bold text-white mb-2 ${bountyAction === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
               {bountyAction === 'approved' ? 'تأكيد القبول والمكافأة' : 'سبب الرفض'}
             </h3>
             <p className="text-slate-400 text-sm mb-4">
               {bountyAction === 'approved' ? 'يرجى مراجعة النقاط قبل منحها للمستخدم:' : 'سيظهر سبب الرفض للمستخدم في حسابه:'}
             </p>

             {bountyAction === 'approved' && (
               <div className="mb-4">
                 <label className="block text-xs text-slate-400 mb-2">مقدار المكافأة (نقطة)</label>
                 <input 
                   type="number" 
                   value={bountyReward} 
                   onChange={e => setBountyReward(Number(e.target.value))} 
                   className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-green-500"
                 />
               </div>
             )}

             <textarea 
               value={bountyNote}
               onChange={(e) => setBountyNote(e.target.value)}
               className={`w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none mb-6 ${bountyAction === 'approved' ? 'focus:border-green-500' : 'focus:border-red-500'}`}
               placeholder={bountyAction === 'approved' ? "ملاحظة إضافية (اختياري)..." : "السبب (مثال: المشاهدات لم تصل لـ 10 آلاف بعد)..."}
             ></textarea>

             <div className="flex gap-4">
               <button onClick={handleBountyUpdate} className={`flex-1 font-bold py-2 rounded-lg transition-all text-white ${bountyAction === 'approved' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
                 تأكيد
               </button>
               <button onClick={() => setShowBountyModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-all border border-slate-700">
                 إلغاء
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

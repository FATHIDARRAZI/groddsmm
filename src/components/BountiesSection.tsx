'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BOUNTIES = [
  { id: 'tiktok_review', title: 'مراجعة على تيك توك', desc: 'انشر مقطع تيك توك يراجع خدماتنا ويحقق 10k مشاهدة', reward: 10000, icon: 'fa-tiktok', color: 'text-white', bg: 'bg-black/40' },
  { id: 'ig_reel', title: 'ريلز انستقرام', desc: 'اصنع ريلز يذكر منصتنا وضع الرابط في البايو', reward: 5000, icon: 'fa-instagram', color: 'text-[#E1306C]', bg: 'bg-gradient-to-tr from-pink-500/10 to-rose-500/10' },
  { id: 'yt_video', title: 'فيديو يوتيوب مخصص', desc: 'اصنع فيديو يوتيوب يشرح طريقة استخدام المنصة بالكامل', reward: 50000, icon: 'fa-youtube', color: 'text-red-500', bg: 'bg-red-500/10' },
];

export default function BountiesSection() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/collab/bounty');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch bounties', e);
    } finally {
      setLoading(false);
    }
  };

  const submitBounty = async (bountyId: string) => {
    const url = proofUrls[bountyId];
    if (!url || !url.trim()) {
      toast.error('الرجاء إدخال رابط الإثبات');
      return;
    }

    setSubmittingId(bountyId);
    try {
      const res = await fetch('/api/collab/bounty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId, proofUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setProofUrls(prev => ({ ...prev, [bountyId]: '' }));
        fetchSubmissions();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (e) {
      toast.error('تعذر تقديم المكافأة');
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (bountyId: string) => {
    const submission = submissions.find(s => s.bounty_id === bountyId);
    if (!submission) return null;

    if (submission.status === 'pending') {
      return <span className="bg-orange-500/10 text-orange-400 text-[10px] px-3 py-1 rounded-full font-bold border border-orange-500/20">قيد المراجعة</span>;
    }
    if (submission.status === 'approved') {
      return <span className="bg-green-500/10 text-green-400 text-[10px] px-3 py-1 rounded-full font-bold border border-green-500/20">مقبول ومكتمل</span>;
    }
    if (submission.status === 'rejected') {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="bg-red-500/10 text-red-400 text-[10px] px-3 py-1 rounded-full font-bold border border-red-500/20">تم الرفض</span>
          {submission.admin_note && <span className="text-[10px] text-slate-500">{submission.admin_note}</span>}
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="animate-pulse w-full h-32 bg-[#1C1C1E] rounded-3xl mt-8"></div>;

  return (
    <div className="mt-12 bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 flex items-center gap-3">
            <i className="fas fa-gift text-yellow-500"></i> مهام ومكافآت (Bounties)
          </h2>
          <p className="text-slate-400 text-sm">أكمل هذه المهام التسويقية واربح آلاف النقاط في رصيدك مباشرة بعد مراجعة الإدارة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {BOUNTIES.map(bounty => {
          const submission = submissions.find(s => s.bounty_id === bounty.id);
          const isPendingOrApproved = submission?.status === 'pending' || submission?.status === 'approved';

          return (
            <div key={bounty.id} className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${bounty.bg} rounded-2xl flex items-center justify-center text-xl`}>
                    <i className={`fab ${bounty.icon} ${bounty.color}`}></i>
                  </div>
                  {getStatusBadge(bounty.id) || (
                    <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-3 py-1.5 rounded-full border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                      {bounty.reward.toLocaleString()} نقطة
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{bounty.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{bounty.desc}</p>
              </div>

              <div>
                {isPendingOrApproved ? (
                  <div className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-center">
                    <p className="text-[11px] text-slate-500 font-bold">
                      {submission.status === 'pending' ? 'سنقوم بمراجعة طلبك وإضافة النقاط قريباً' : 'تم إضافة النقاط إلى محفظتك!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="رابط المنشور للتحقق..."
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      value={proofUrls[bounty.id] || ''}
                      onChange={(e) => setProofUrls(prev => ({ ...prev, [bounty.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => submitBounty(bounty.id)}
                      disabled={submittingId === bounty.id}
                      className="w-full py-3 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {submittingId === bounty.id ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

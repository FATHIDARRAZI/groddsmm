'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TicketClient({ id }: { id: string }) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/support/${id}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.messages);
      } else {
        router.push('/dashboard/support');
      }
    } catch (e) {
      toast.error('فشل جلب تفاصيل التذكرة');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply })
      });
      if (res.ok) {
        setReply('');
        fetchTicket();
      }
    } catch {
      toast.error('فشل إرسال الرد');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">جاري التحميل...</div>;
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <Link href="/dashboard/support" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-400 transition-colors">
          <i className="fas fa-arrow-right"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{ticket.subject}</h1>
          <p className="text-slate-400 text-sm font-mono">تذكرة رقم: #{ticket.id.split('-')[0]}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${
              msg.is_admin_reply 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-sm' 
                : 'bg-[#1C1C1E] border border-white/10 text-white rounded-tl-sm'
            }`}>
              <div className="flex justify-between items-center mb-2 gap-4">
                <span className={`text-xs font-bold ${msg.is_admin_reply ? 'text-blue-400' : 'text-slate-400'}`}>
                  {msg.is_admin_reply ? 'الدعم الفني' : 'أنت'}
                </span>
                <span className="text-[10px] text-slate-500">{new Date(msg.created_at).toLocaleString('en-GB')}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' ? (
        <form onSubmit={handleReply} className="bg-[#121214] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
          <textarea 
            required
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[60px] md:min-h-0 resize-none"
            placeholder="اكتب ردك هنا..."
          />
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shrink-0">
            {submitting ? 'جاري...' : 'إرسال الرد'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-slate-400 font-bold">هذه التذكرة مغلقة ولا يمكن الرد عليها.</p>
        </div>
      )}
    </div>
  );
}

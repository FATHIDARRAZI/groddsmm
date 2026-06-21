'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/support');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (e) {
      toast.error('فشل جلب التذاكر');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/support?ticket_id=${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        setMessages(data.messages);
      }
    } catch (e) {
      toast.error('فشل جلب التفاصيل');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', ticket_id: selectedTicket.id, message: reply })
      });
      if (res.ok) {
        toast.success('تم الرد بنجاح');
        setReply('');
        fetchTicketDetails(selectedTicket.id);
        fetchTickets();
      }
    } catch {
      toast.error('فشل إرسال الرد');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', ticket_id: selectedTicket.id, status })
      });
      if (res.ok) {
        toast.success('تم تحديث الحالة');
        fetchTicketDetails(selectedTicket.id);
        fetchTickets();
      }
    } catch {
      toast.error('فشل التحديث');
    }
  };

  if (selectedTicket) {
    return (
      <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-8">
            <button onClick={() => setSelectedTicket(null)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 transition-colors">
              <i className="fas fa-arrow-right"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{selectedTicket.subject}</h1>
              <p className="text-slate-400 text-sm font-mono">تذكرة رقم: #{selectedTicket.id.split('-')[0]} • المستخدم: {selectedTicket.profiles?.full_name || 'مجهول'}</p>
            </div>
            <div className="mr-auto flex gap-2">
              {selectedTicket.status !== 'closed' ? (
                <button onClick={() => handleUpdateStatus('closed')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-sm font-bold transition-all">
                  إغلاق التذكرة
                </button>
              ) : (
                <button onClick={() => handleUpdateStatus('open')} className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 rounded-lg text-sm font-bold transition-all">
                  إعادة فتح
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-2xl ${
                  msg.is_admin_reply 
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-sm' 
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-sm'
                }`}>
                  <div className="flex justify-between items-center mb-2 gap-4">
                    <span className={`text-xs font-bold ${msg.is_admin_reply ? 'text-blue-400' : 'text-slate-400'}`}>
                      {msg.is_admin_reply ? 'أنت (الإدارة)' : msg.profiles?.full_name || 'المستخدم'}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(msg.created_at).toLocaleString('ar-SA')}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'closed' && (
            <form onSubmit={handleReply} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
              <textarea 
                required
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 min-h-[60px] md:min-h-0 resize-none"
                placeholder="اكتب ردك للمستخدم هنا..."
              />
              <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shrink-0">
                {submitting ? 'جاري...' : 'إرسال الرد'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">الدعم الفني والتذاكر</h1>
          <p className="text-slate-400 text-sm">إدارة استفسارات ومشاكل المستخدمين</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500">جاري التحميل...</div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center text-slate-500">لا توجد تذاكر</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => fetchTicketDetails(ticket.id)}
                  className="p-5 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-white">{ticket.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      ticket.status === 'answered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {ticket.status === 'open' ? 'بانتظار الرد' : ticket.status === 'answered' ? 'تم الرد' : 'مغلقة'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div>
                      <span className="font-mono ml-3">#{ticket.id.split('-')[0]}</span>
                      <span>بواسطة: {ticket.profiles?.full_name || 'مجهول'}</span>
                    </div>
                    <span>آخر تحديث: {new Date(ticket.updated_at).toLocaleString('ar-SA')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

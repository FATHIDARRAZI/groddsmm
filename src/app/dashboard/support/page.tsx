'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      });
      if (res.ok) {
        toast.success('تم فتح التذكرة بنجاح');
        setShowForm(false);
        setSubject('');
        setMessage('');
        fetchTickets();
      }
    } catch {
      toast.error('فشل فتح التذكرة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">الدعم الفني</h1>
          <p className="text-slate-400 text-sm">تواصل معنا لحل مشاكلك أو الاستفسار عن أي شيء</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg"
        >
          {showForm ? 'إلغاء' : 'تذكرة جديدة'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">الموضوع</label>
            <input 
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="مثال: مشكلة في الطلب رقم 1234"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-bold mb-2">التفاصيل</label>
            <textarea 
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
              placeholder="اكتب رسالتك بالتفصيل هنا..."
            />
          </div>
          <button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
            {submitting ? 'جاري الإرسال...' : 'إرسال التذكرة'}
          </button>
        </form>
      )}

      <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">جاري التحميل...</div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center text-slate-500">لا توجد تذاكر حالية</div>
        ) : (
          <div className="divide-y divide-white/5">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/support/${ticket.id}`} className="block p-5 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white">{ticket.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    ticket.status === 'answered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {ticket.status === 'open' ? 'مفتوحة' : ticket.status === 'answered' ? 'تم الرد' : 'مغلقة'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-mono">#{ticket.id.split('-')[0]}</span>
                  <span>آخر تحديث: {new Date(ticket.updated_at).toLocaleString('ar-SA')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

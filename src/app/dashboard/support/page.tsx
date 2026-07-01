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
      } else {
        toast.error('فشل فتح التذكرة');
      }
    } catch {
      toast.error('فشل فتح التذكرة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            الدعم الفني
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
            نحن هنا لمساعدتك. تواصل معنا لحل أي مشكلة تواجهك أو للاستفسار عن خدماتنا وسنقوم بالرد عليك في أقرب وقت.
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`relative z-10 group flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl overflow-hidden ${
            showForm 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-white/10 hover:shadow-slate-500/20'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-[1.02] hover:shadow-blue-500/25 border border-white/10'
          }`}
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>إلغاء وتراجع</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>فتح تذكرة جديدة</span>
            </>
          )}
        </button>
      </div>

      {/* New Ticket Form */}
      <div className={`transition-all duration-500 ease-out origin-top overflow-hidden ${showForm ? 'max-h-[800px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
        <form onSubmit={handleCreate} className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative glow inside form */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              تفاصيل التذكرة
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2 ml-1">الموضوع</label>
                <div className="relative group">
                  <input 
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="مثال: مشكلة في الطلب رقم 1234 أو استفسار عن خدمة..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2 ml-1">الرسالة أو التفاصيل</label>
                <textarea 
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 h-40 resize-none transition-all placeholder:text-slate-600"
                  placeholder="اكتب رسالتك بالتفصيل هنا لتتمكن الإدارة من مساعدتك بشكل أفضل..."
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={submitting || !subject.trim() || !message.trim()} 
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <span>إرسال التذكرة الآن</span>
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تذاكري السابقة
        </h3>
        
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-[#121214]/50 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">لا توجد تذاكر</h3>
            <p className="text-slate-500 max-w-sm">لم تقم بفتح أي تذاكر دعم فني حتى الآن. إذا كانت لديك أي مشكلة، لا تتردد في فتح تذكرة جديدة.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                href={`/dashboard/support/${ticket.id}`} 
                className="group relative bg-[#121214]/60 backdrop-blur-sm border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-1 rounded-lg">
                        #{ticket.id.split('-')[0]}
                      </span>
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors line-clamp-1">
                        {ticket.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(ticket.updated_at).toLocaleDateString('ar-SA')} - {new Date(ticket.updated_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      ticket.status === 'open' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : ticket.status === 'answered' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.status === 'open' ? 'bg-blue-400 animate-pulse' :
                        ticket.status === 'answered' ? 'bg-green-400' :
                        'bg-slate-500'
                      }`}></span>
                      {ticket.status === 'open' ? 'مفتوحة' : ticket.status === 'answered' ? 'تم الرد' : 'مغلقة'}
                    </span>
                    
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                      <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

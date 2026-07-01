'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">جاري تحميل تفاصيل التذكرة...</p>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      {/* Header Area */}
      <div className="relative bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link 
              href="/dashboard/support" 
              className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white line-clamp-1">{ticket.subject}</h1>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md">#{ticket.id.split('-')[0]}</span>
                <span>•</span>
                <span>تم الإنشاء: {new Date(ticket.created_at).toLocaleDateString('ar-SA')}</span>
              </p>
            </div>
          </div>
          
          <div className={`px-5 py-2.5 rounded-2xl text-sm font-bold border flex items-center gap-2.5 shadow-lg ${
            ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10' :
            ticket.status === 'answered' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10' :
            'bg-slate-800 text-slate-400 border-slate-700 shadow-slate-900/50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              ticket.status === 'open' ? 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]' :
              ticket.status === 'answered' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' :
              'bg-slate-500'
            }`}></span>
            {ticket.status === 'open' ? 'تذكرة مفتوحة' : ticket.status === 'answered' ? 'تم الرد' : 'تذكرة مغلقة'}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="bg-[#0B0F19]/50 border border-white/5 rounded-3xl p-4 md:p-8 min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
            >
              <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.is_admin_reply ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg shadow-lg ${
                  msg.is_admin_reply 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300'
                }`}>
                  {msg.is_admin_reply ? '👨‍💻' : '👤'}
                </div>
                
                {/* Message Bubble */}
                <div className={`p-5 rounded-3xl shadow-xl relative group ${
                  msg.is_admin_reply 
                    ? 'bg-[#121214] border border-blue-500/20 text-white rounded-tr-sm hover:border-blue-500/40' 
                    : 'bg-blue-600 border border-blue-500 text-white rounded-tl-sm hover:bg-blue-500'
                } transition-colors`}>
                  <div className="flex justify-between items-center mb-3 gap-6">
                    <span className={`text-sm font-bold ${msg.is_admin_reply ? 'text-blue-400' : 'text-blue-100'}`}>
                      {msg.is_admin_reply ? 'الدعم الفني (الإدارة)' : 'أنت'}
                    </span>
                    <span className={`text-xs ${msg.is_admin_reply ? 'text-slate-500' : 'text-blue-200'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed opacity-90">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Area */}
      {ticket.status !== 'closed' ? (
        <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl sticky bottom-6">
          <form onSubmit={handleReply} className="flex flex-col md:flex-row gap-4 relative">
            <textarea 
              required
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 bg-[#0B0F19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 min-h-[100px] md:min-h-0 md:h-[60px] resize-none transition-all placeholder:text-slate-600 shadow-inner"
              placeholder="اكتب ردك هنا..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply(e as any);
                }
              }}
            />
            <button 
              type="submit" 
              disabled={submitting || !reply.trim()} 
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-500/25 shrink-0 flex items-center justify-center gap-2 group md:w-auto w-full h-[60px]"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>إرسال</span>
                  <svg className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
          <div className="text-center mt-3 hidden md:block">
            <span className="text-xs text-slate-500">يمكنك الضغط على Enter للإرسال، أو Shift + Enter لسطر جديد</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-slate-300 font-bold text-lg">هذه التذكرة مغلقة</p>
          <p className="text-slate-500">لا يمكن إضافة ردود جديدة لهذه التذكرة. إذا كانت لديك مشكلة أخرى، يرجى فتح تذكرة جديدة.</p>
        </div>
      )}
    </div>
  );
}

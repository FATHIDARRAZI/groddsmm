'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTicket]);

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
      <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo bg-[#0B0F19]">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Area */}
          <div className="relative bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => {
                    setSelectedTicket(null);
                    setMessages([]);
                  }} 
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1 line-clamp-1">{selectedTicket.subject}</h1>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md">#{selectedTicket.id.split('-')[0]}</span>
                    <span>•</span>
                    <span>المستخدم: {selectedTicket.profiles?.full_name || 'مجهول'}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                {selectedTicket.status !== 'closed' ? (
                  <button 
                    onClick={() => handleUpdateStatus('closed')} 
                    className="flex-1 md:flex-none px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    إغلاق التذكرة
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus('open')} 
                    className="flex-1 md:flex-none px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    إعادة فتح
                  </button>
                )}
                
                <div className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center gap-2 shadow-lg ${
                  selectedTicket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-yellow-500/10' :
                  selectedTicket.status === 'answered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10' :
                  'bg-slate-800 text-slate-400 border-slate-700 shadow-slate-900/50'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedTicket.status === 'open' ? 'bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]' :
                    selectedTicket.status === 'answered' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' :
                    'bg-slate-500'
                  }`}></span>
                  {selectedTicket.status === 'open' ? 'بانتظار الرد' : selectedTicket.status === 'answered' ? 'تم الرد' : 'مغلقة'}
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="bg-[#121214]/50 border border-white/5 rounded-3xl p-4 md:p-8 min-h-[400px] flex flex-col">
            <div className="flex-1 space-y-6">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.is_admin_reply ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg shadow-lg ${
                      msg.is_admin_reply 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20' 
                        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300'
                    }`}>
                      {msg.is_admin_reply ? '🛡️' : '👤'}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`p-5 rounded-3xl shadow-xl relative group ${
                      msg.is_admin_reply 
                        ? 'bg-indigo-600 border border-indigo-500 text-white rounded-tl-sm hover:bg-indigo-500' 
                        : 'bg-[#1C1C1E] border border-white/10 text-slate-200 rounded-tr-sm hover:border-white/20'
                    } transition-colors`}>
                      <div className="flex justify-between items-center mb-3 gap-6">
                        <span className={`text-sm font-bold ${msg.is_admin_reply ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {msg.is_admin_reply ? 'أنت (الإدارة)' : msg.profiles?.full_name || 'المستخدم'}
                        </span>
                        <span className={`text-xs ${msg.is_admin_reply ? 'text-indigo-200' : 'text-slate-500'}`}>
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
          {selectedTicket.status !== 'closed' ? (
            <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl sticky bottom-6 z-10">
              <form onSubmit={handleReply} className="flex flex-col md:flex-row gap-4 relative">
                <textarea 
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="flex-1 bg-[#0B0F19] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 min-h-[100px] md:min-h-0 md:h-[60px] resize-none transition-all placeholder:text-slate-600 shadow-inner"
                  placeholder="اكتب ردك للمستخدم هنا..."
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
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-indigo-500/25 shrink-0 flex items-center justify-center gap-2 group md:w-auto w-full h-[60px]"
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>إرسال الرد</span>
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
              <p className="text-slate-500">لإرسال ردود جديدة، يجب إعادة فتح التذكرة أولاً من الزر بالأعلى.</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo bg-[#0B0F19]">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              الدعم الفني للإدارة
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
              إدارة تذاكر المستخدمين، الرد على الاستفسارات ومتابعة المشاكل وحلها.
            </p>
          </div>
          
          <div className="relative z-10 bg-[#121214] border border-white/10 rounded-2xl p-4 flex gap-6 shadow-xl">
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{tickets.length}</span>
              <span className="text-xs text-slate-500">إجمالي التذاكر</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-yellow-500">{tickets.filter(t => t.status === 'open').length}</span>
              <span className="text-xs text-slate-500">بانتظار الرد</span>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              قائمة التذاكر
            </h2>
          </div>
          
          {loading ? (
            <div className="p-10 grid gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">لا توجد تذاكر حالياً</h3>
              <p className="text-slate-500 max-w-sm">لم يقم أي مستخدم بفتح تذاكر دعم فني بعد.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => fetchTicketDetails(ticket.id)}
                  className="group p-5 md:p-6 hover:bg-white/[0.03] transition-colors cursor-pointer relative overflow-hidden flex flex-col md:flex-row gap-4 justify-between"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {ticket.subject}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="font-mono bg-black/40 px-2 py-1 rounded-lg text-xs">#{ticket.id.split('-')[0]}</span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {ticket.profiles?.full_name || 'مستخدم مجهول'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(ticket.updated_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      ticket.status === 'open' 
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                        : ticket.status === 'answered' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ticket.status === 'open' ? 'bg-yellow-400 animate-pulse' :
                        ticket.status === 'answered' ? 'bg-blue-400' :
                        'bg-slate-500'
                      }`}></span>
                      {ticket.status === 'open' ? 'بانتظار الرد' : ticket.status === 'answered' ? 'تم الرد' : 'مغلقة'}
                    </span>
                    
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg group-hover:shadow-indigo-500/25 group-hover:scale-105 group-active:scale-95">
                      <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
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

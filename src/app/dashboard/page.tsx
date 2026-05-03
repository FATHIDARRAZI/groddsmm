'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { createSupabaseClient } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DashboardHome() {
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<'likes' | 'views'>('likes');
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointsToSpend, setPointsToSpend] = useState(100);
  const [userPoints, setUserPoints] = useState(0);

  // AI & Chat States
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً بك! أنا مساعد Grodd الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    setIsMounted(true);
    fetchUserPoints();
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const fetchUserPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single();
      if (profile) setUserPoints(profile.points_balance);
    }
  };

  const activeSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'agent', 
          payload: { 
            userPoints, 
            currentOrderData: { link: postLink, type: service, quantity: pointsToSpend } 
          },
          messages: [...messages, { role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      if (data.updatedOrderData) {
        if (data.updatedOrderData.link) setPostLink(data.updatedOrderData.link);
        if (data.updatedOrderData.type) setService(data.updatedOrderData.type);
        if (data.updatedOrderData.quantity) setPointsToSpend(data.updatedOrderData.quantity);
      }

      if (data.isReadyToOrder) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'لقد قمت بتجهيز تفاصيل الطلب لك في النموذج. اضغط "إطلاق الطلب" لإتمامه! 🚀' }]);
      }

      if (data.isTrackingRequested && data.extractedOrderId) {
        fetchOrderStatus(data.extractedOrderId);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ أثناء معالجة طلبك.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchOrderStatus = async (orderId: string) => {
    try {
      const res = await fetch('/api/ai/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.status) {
        const statusMsg = `حالة الطلب #${orderId}:\n• الحالة: ${data.status}\n• المتبقي: ${data.remains}\n• البداية: ${data.start_count}`;
        setMessages(prev => [...prev, { role: 'assistant', content: statusMsg }]);
      }
    } catch (e) {}
  };

  const handleLaunch = async () => {
    if (!postLink) return setErrorMsg('الرجاء إدخال الرابط أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          link: postLink, serviceType: service, recaptchaToken, 
          quantity: service === 'likes' ? pointsToSpend : pointsToSpend * 100,
          totalCost: pointsToSpend
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostLink(''); setRecaptchaToken('');
        setMessages(prev => [...prev, { role: 'assistant', content: 'تم إطلاق طلبك بنجاح! 🎉' }]);
        fetchUserPoints();
        alert(data.message);
      } else {
        setErrorMsg(data.error);
      }
    } catch (e) { setErrorMsg('فشل إرسال الطلب'); }
    finally { setIsProcessing(false); }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 animate-fade-in relative z-10 pb-20">
        
        {/* Centered Order Form */}
        <div className="w-full space-y-4 text-center">
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              إطلاق طلب <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">جديد</span>
           </h1>
        </div>

        <div className="glass-panel rounded-[3rem] p-10 md:p-14 border-white/5 bg-[#09090b]/80 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="space-y-10 relative z-10">
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black text-slate-500 uppercase px-2">رابط المحتوى</label>
              <input
                type="text"
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                placeholder="ضع الرابط هنا..."
                className="w-full bg-black/60 border border-white/5 rounded-3xl py-6 pr-8 pl-8 text-right dir-rtl text-white font-outfit text-base focus:outline-none focus:border-pink-500/40 transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <button onClick={() => setService('likes')} className={`py-4 rounded-2xl font-black transition-all ${service === 'likes' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>إعجابات</button>
              <button onClick={() => setService('views')} className={`py-4 rounded-2xl font-black transition-all ${service === 'views' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>مشاهدات</button>
            </div>

            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-white">{pointsToSpend}</span></span>
                <span className="text-xs font-black text-pink-500 uppercase">الكمية: <span className="text-white">{service === 'likes' ? pointsToSpend : pointsToSpend * 100}</span></span>
              </div>
              <input type="range" min="100" max="500000" step="100" value={pointsToSpend} onChange={(e) => setPointsToSpend(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-full accent-pink-500" />
            </div>

            <div className="flex flex-col items-center gap-4">
               <div className="p-4 rounded-[2.5rem] bg-black/60 border border-white/5 scale-90">
                 <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" />
               </div>
               {errorMsg && <p className="text-pink-500 text-xs font-black animate-pulse">{errorMsg}</p>}
            </div>

            <button onClick={handleLaunch} disabled={isProcessing} className="w-full py-7 rounded-[2.5rem] font-black text-white text-xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30">
              {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 'إطلاق الطلب الآن'}
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING AI CHAT WIDGET - RENDERED IN PORTAL TO AVOID Z-INDEX CLIPPING */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[999999] flex flex-col items-start pointer-events-none dir-ltr">
          {/* Chat Window Container */}
          {isChatOpen && (
            <div className="w-[calc(100vw-2rem)] sm:w-[360px] md:w-[400px] h-[500px] max-h-[80vh] bg-[#0D0D0F]/98 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-fade-in mb-4 pointer-events-auto origin-bottom-left transition-all duration-300 ease-out">
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <i className="fas fa-magic text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xs md:text-sm">Grodd AI Agent</h3>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Now</span>
                      </div>
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsChatOpen(false)} 
                   className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                 >
                   <i className="fas fa-times text-xs"></i>
                 </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide bg-[#09090b]/50 dir-rtl">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                    <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-[11px] md:text-sm leading-relaxed ${
                      msg.role === 'assistant' 
                        ? 'bg-white/5 text-slate-200 border border-white/5' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/20'
                    }`}>
                      {msg.content.split('\n').map((line, i) => <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>)}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white/5 p-4 rounded-2xl w-fit flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleChat} className="p-4 bg-black/40 border-t border-white/5 flex gap-2 dir-rtl">
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isTyping}
                  className="w-10 h-10 md:w-12 md:h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:brightness-110 active:scale-90 transition-all disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                </button>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="كيف أساعدك اليوم؟" 
                  className="flex-1 bg-[#121214] border border-white/10 rounded-xl py-3 px-4 text-xs md:text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder-slate-700" 
                />
              </form>
            </div>
          )}

          {/* Floating Bubble Icon */}
          <div className="flex items-center gap-3 pointer-events-auto group">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(147,51,234,0.4)] transition-all transform hover:scale-110 active:scale-95 border-2 border-white/10 ${
                isChatOpen 
                  ? 'bg-[#1C1C1E] text-white rotate-90 shadow-none' 
                  : 'bg-gradient-to-tr from-purple-600 to-purple-400 text-white'
              }`}
            >
              <i className={`fas ${isChatOpen ? 'fa-times' : 'fa-comment-dots'} text-xl md:text-2xl`}></i>
              {!isChatOpen && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0B0F19] animate-pulse shadow-lg"></span>
              )}
            </button>
            
            {!isChatOpen && (
              <div className="bg-white text-black font-black text-[10px] md:text-xs px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap border border-slate-200 transform translate-x-2 group-hover:translate-x-0">
                AI Assistant - مساعد ذكي
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RemoveAdsChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RemoveAdsChatModal({ isOpen, onClose }: RemoveAdsChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً بك! أنا المساعد الذكي لوكالة Grodd Media. كيف يمكنني مساعدتك اليوم بخصوص ميزة "إزالة الإعلانات"؟ يمكنك سؤالي عن المميزات، السعر، أو كيفية الدفع والتفعيل! 🚀',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickQuestions = [
    'ما هي مميزات إزالة الإعلانات؟',
    'كم سعر الخدمة؟',
    'كيف أقوم بالدفع والتفعيل؟',
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/remove-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage],
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'عذراً، لم أستطع معالجة طلبك حالياً.' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالخادم.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[999999] flex flex-col items-start pointer-events-none dir-ltr font-cairo">
      <div className="w-[calc(100vw-2rem)] sm:w-[360px] md:w-[400px] h-[500px] max-h-[80vh] bg-[#0D0D0F]/98 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-fade-in pointer-events-auto origin-bottom-left transition-all duration-300 ease-out relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        
        {/* Header */}
        <div className="p-4 md:p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-[#FF8577] flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-white text-sm"></i>
            </div>
            <div className="text-left">
              <h3 className="text-white font-black text-xs md:text-sm">مساعد إزالة الإعلانات</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">مساعد ذكي نشط</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 scrollbar-hide bg-[#09090b]/50 text-right dir-rtl">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-start flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' ? (
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <i className="fas fa-robot text-xs"></i>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                  <i className="fas fa-user text-xs"></i>
                </div>
              )}
              
              <div 
                className={`max-w-[80%] p-3 md:p-4 rounded-2xl text-[11px] md:text-xs leading-relaxed font-medium ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-tr from-pink-500 to-[#FF8577] text-white rounded-tr-none shadow-md shadow-pink-500/10' 
                    : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <i className="fas fa-robot text-xs"></i>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form & Quick Actions */}
        <div className="p-4 bg-black/40 border-t border-white/5 space-y-3 w-full">
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                className="text-[9px] text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/10 rounded-full px-2.5 py-1 font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2 dir-rtl"
          >
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-[#FF8577] text-white rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
            <input 
              type="text" 
              placeholder="اسأل المساعد الذكي..."
              className="flex-1 bg-[#18181A] border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50 text-right"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
          </form>

          {/* Direct CTA */}
          <div className="text-center pt-1.5 border-t border-white/5 flex flex-col items-center justify-center gap-1">
            <a 
              href="https://www.instagram.com/grodd_media/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-pink-400 hover:text-pink-300 font-black"
            >
              <i className="fab fa-instagram text-xs"></i> مراسلتنا وتفعيل الخدمة الآن
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

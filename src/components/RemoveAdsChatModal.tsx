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
      content: 'مرحباً بك! أنا المساعد الذكي لوكالة Grodd Media. كيف يمكنني مساعدتك اليوم بخصوص ميزة "إزالة الإعلانات"؟ يمكنك سؤالي عن المميزات، السعر، أو كيفية التفعيل! 🚀',
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
          messages: [...messages.slice(1), userMessage], // exclude initial greeting for API context
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-fade-in font-cairo">
      <div className="bg-[#121214] border border-pink-500/20 rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(236,72,153,0.15)] flex flex-col overflow-hidden max-h-[85vh] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        
        {/* Header */}
        <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-[#FF8577] flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-white font-black text-sm">مساعد إزالة الإعلانات</h3>
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                مساعد ذكي متصل بالذكاء الاصطناعي
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-right dir-rtl">
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
                className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${
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

        {/* Quick actions & input footer */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 space-y-4">
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 justify-end">
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isTyping}
                className="text-[10px] text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/10 rounded-full px-3 py-1.5 font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 bg-[#18181A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500/50 text-right"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-gradient-to-r from-pink-500 to-[#FF8577] text-white px-5 rounded-xl text-xs font-black shadow-lg shadow-pink-500/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            >
              إرسال
            </button>
          </form>

          {/* Direct CTA */}
          <div className="text-center pt-2 border-t border-white/5 flex flex-col items-center justify-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold">تفضل الشراء المباشر؟</span>
            <a 
              href="https://www.instagram.com/grodd_media/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 font-black"
            >
              <i className="fab fa-instagram text-sm"></i> مراسلتنا وتفعيل الخدمة الآن
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function RemoveAdsPage() {
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const premiumFeatures = [
    {
      title: 'تجربة خالية تماماً من الإعلانات (100% Ad-Free)',
      description: 'تصفح سريع وسلس لجميع صفحات المنصة بدون أي بنرات إعلانية أو نوافذ منبثقة مزعجة.',
      icon: 'fa-shield-halved',
      color: 'from-pink-500/20 to-[#FF8577]/20 border-pink-500/30 text-pink-400',
    },
    {
      title: 'تخطي وإلغاء فترة الانتظار (No Cooldown)',
      description: 'ودع فترة الانتظار البالغة دقيقتين بين كل طلب مجاني والآخر. أطلق حملاتك متتالية وفوراً!',
      icon: 'fa-bolt',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      title: 'بدون شاشات رعاية (No Sponsor Screens)',
      description: 'تخطي شاشة الانتظار الإلزامية البالغة 30 ثانية قبل إطلاق حملتك. تفعيل الطلب يتم في أجزاء من الثانية.',
      icon: 'fa-forward',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'دعم فني VIP فوري وأولوية قصوى',
      description: 'أولوية معالجة قصوى لحملاتك ودعم فني مخصص لحل أي استفسار أو مشكلة تواجهك بسرعة مضاعفة.',
      icon: 'fa-crown',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-fade-in relative z-10 font-cairo">
      
      {/* Cinematic Header */}
      <div className="relative w-full rounded-[3rem] overflow-hidden bg-[#0A0D14] border border-white/5 shadow-2xl mb-12 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500/20 to-[#FF8577]/20 border border-pink-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
          <i className="fas fa-eye-slash text-2xl text-pink-400"></i>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white mb-4 leading-tight">
          ترقية الحساب وإزالة الإعلانات
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed">
          استمتع بتجربة فائقة السرعة بدون أي إعلانات أو فترات انتظار مع ميزات VIP الحصرية.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Features Column (Right side in RTL) */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          <div className="bg-[#121214]/80 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <i className="fas fa-list-check text-pink-500"></i>
              مميزات الترقية الفائقة
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {premiumFeatures.map((feat, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} border flex items-center justify-center shrink-0`}>
                    <i className={`fas ${feat.icon} text-lg`}></i>
                  </div>
                  <div className="space-y-1 text-right">
                    <h4 className="text-white font-bold text-sm">{feat.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Action Card */}
          <div className="bg-gradient-to-tr from-[#121214] to-[#1C1C1E] border border-white/10 rounded-[2.5rem] p-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-full text-pink-400 text-xs font-bold w-fit mx-auto">
              <i className="fas fa-coins"></i> القيمة والتفعيل
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-sm font-bold">تفعيل دائم لمرة واحدة</p>
              <h3 className="text-4xl font-black text-white">50 درهم فقط</h3>
            </div>
            
            <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
              الدفع يتم بشكل آمن وسهل. تواصل معنا على حسابنا الرسمي والوحيد على الإنستغرام وأرسل التحويل وسيقوم فريقنا بتفعيل الميزة لحسابك في دقائق!
            </p>
            
            <a 
              href="https://www.instagram.com/grodd_media/" 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-[#FF8577] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:opacity-95 active:scale-98 transition-all relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <i className="fab fa-instagram text-xl"></i> تفعيل عبر إنستغرام الآن
            </a>
          </div>
        </div>

        {/* AI Column (Left side in RTL) */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="bg-[#121214]/80 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden h-[600px] relative shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
            
            {/* AI Header */}
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-[#FF8577] flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <i className="fas fa-robot text-white text-lg"></i>
              </div>
              <div className="text-right">
                <h3 className="text-white font-black text-sm">مستشار الترقية الذكي</h3>
                <p className="text-[10px] text-green-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  نشط بالذكاء الاصطناعي
                </p>
              </div>
            </div>

            {/* AI Chat Messages */}
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
                    className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-pink-500 to-[#FF8577] text-white rounded-tr-none' 
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

            {/* AI Footer input */}
            <div className="p-6 bg-white/[0.01] border-t border-white/5 space-y-4">
              <div className="flex flex-wrap gap-1.5 justify-end">
                {quickQuestions.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isTyping}
                    className="text-[9px] text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/10 rounded-full px-2.5 py-1.5 font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  placeholder="اسأل المساعد الذكي عن الخدمة..."
                  className="flex-1 bg-[#18181A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500/50 text-right"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="bg-gradient-to-r from-pink-500 to-[#FF8577] text-white px-5 rounded-xl text-xs font-black hover:opacity-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  إرسال
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

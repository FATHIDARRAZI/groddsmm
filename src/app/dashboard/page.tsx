'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { createSupabaseClient } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SOCIAL_CATEGORIES = [
  { id: 'instagram', icon: 'fa-instagram', color: 'text-[#E1306C]', name: 'انستقرام' },
  { id: 'tiktok', icon: 'fa-tiktok', color: 'text-white', name: 'تيك توك' },
  { id: 'facebook', icon: 'fa-facebook', color: 'text-[#1877F2]', name: 'فيسبوك' },
  { id: 'youtube', icon: 'fa-youtube', color: 'text-[#FF0000]', name: 'يوتيوب' },
];

export default function DashboardHome() {
  const [category, setCategory] = useState<string>('instagram');
  const [postLink, setPostLink] = useState('');
  const [service, setService] = useState<'likes' | 'views' | 'followers'>('followers');
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [userPoints, setUserPoints] = useState(0);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [privateAlertMsg, setPrivateAlertMsg] = useState<string | null>(null);

  const getLimits = useCallback(() => {
    if (category === 'instagram' && service === 'followers') return { min: 100, max: 100000 };
    if (category === 'tiktok' && service === 'likes') return { min: 10, max: 100000 };
    if (category === 'tiktok' && service === 'followers') return { min: 10, max: 10000000 };
    if (category === 'tiktok' && service === 'views') return { min: 100, max: 100000000 };
    if (category === 'facebook' && service === 'followers') return { min: 10, max: 2000000 };
    return { min: 100, max: 10000 };
  }, [category, service]);

  useEffect(() => {
    const limits = getLimits();
    if (quantity < limits.min) setQuantity(limits.min);
    if (quantity > limits.max) setQuantity(limits.max);
  }, [category, service, getLimits]);

  // Utility to format big numbers
  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

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
            currentOrderData: { link: postLink, type: service, quantity } 
          },
          messages: [...messages, { role: 'user', content: userMsg }]
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

      if (data.updatedOrderData) {
        if (data.updatedOrderData.link) setPostLink(data.updatedOrderData.link);
        if (data.updatedOrderData.type) setService(data.updatedOrderData.type);
        if (data.updatedOrderData.quantity) setQuantity(data.updatedOrderData.quantity);
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

  const submitOrder = async () => {
    if (category === 'instagram' && service === 'followers' && profileData?.is_private) {
      setPrivateAlertMsg(profileData.private_error_message || 'هذا الحساب خاص (Private). يرجى تحويل الحساب إلى عام (Public) وإعادة المحاولة لاحقاً.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setShowProfileConfirm(false);
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          link: postLink, serviceType: service, category, recaptchaToken, 
          quantity: quantity,
          totalCost: service === 'followers' ? quantity * 2 : service === 'views' ? Math.ceil(quantity / 50) : quantity
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

  const handleLaunch = async () => {
    if (!postLink || postLink === '@') return setErrorMsg(service === 'followers' ? 'الرجاء إدخال اسم المستخدم أولاً' : 'الرجاء إدخال الرابط أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');
    
    if (service === 'followers' && category === 'instagram') {
      setIsFetchingProfile(true);
      setErrorMsg('');
      try {
        const res = await fetch('/api/ig-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: postLink })
        });
        const data = await res.json();
        
        if (data.success) {
          setProfileData(data.data);
          setShowProfileConfirm(true);
        } else {
          setErrorMsg(data.error || 'فشل جلب بيانات الحساب');
        }
      } catch (err) {
        setErrorMsg('حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsFetchingProfile(false);
      }
    } else {
      submitOrder();
    }
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
            {/* Category Selector */}
            <div className="flex flex-col gap-4 items-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">اختر المنصة</label>
              <div className="flex justify-center gap-3 md:gap-6">
                {SOCIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === 'facebook') setService('followers');
                    }}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
                      category === cat.id 
                        ? 'bg-gradient-to-tr from-white/10 to-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/20 scale-110' 
                        : 'bg-black/40 border border-white/5 opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                    title={cat.name}
                  >
                    <i className={`fab ${cat.icon} ${cat.color} text-2xl md:text-3xl drop-shadow-md group-hover:drop-shadow-xl transition-all`}></i>
                    {/* Optional text label below icon if needed later, kept minimal for now */}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black text-slate-500 uppercase px-2">
                {service === 'followers' ? 'اسم المستخدم (يوزرنيم)' : 'رابط المحتوى'}
              </label>
              <div className="relative">
                {service === 'followers' && (
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg font-mono">@</span>
                )}
                <input
                  type="text"
                  value={postLink}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (service === 'followers') {
                      // Remove @ if they typed it, we'll auto prefix it below for the value state
                      val = val.replace(/^@/, '');
                      if (val.length > 0) val = '@' + val;
                    }
                    setPostLink(val);
                  }}
                  placeholder={service === 'followers' ? 'username' : 'ضع الرابط هنا...'}
                  className={`w-full bg-black/60 border border-white/5 rounded-3xl py-6 pr-8 ${service === 'followers' ? 'pl-12' : 'pl-8'} text-right text-white font-outfit text-base focus:outline-none focus:border-pink-500/40 transition-all shadow-inner`}
                  dir={service === 'followers' ? 'ltr' : 'rtl'}
                />
              </div>
            </div>

            {category === 'youtube' ? (
              <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 text-center animate-fade-in shadow-xl mt-8">
                 <div className="w-20 h-20 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-6">
                   <i className="fab fa-youtube text-red-500 text-4xl"></i>
                 </div>
                 <h2 className="text-3xl font-black text-white mb-4 tracking-tight">قريباً جداً!</h2>
                 <p className="text-slate-400 font-bold text-lg">سيتم إضافة خدمات يوتيوب المميزة قريباً، شكراً لانتظارك.</p>
              </div>
            ) : (
              <>
                <div className={`grid ${category === 'facebook' ? 'grid-cols-1' : 'grid-cols-3'} gap-4 md:gap-8 mt-4`}>
                  <button onClick={() => { setService('followers'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'followers' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>متابعين</button>
                  {category !== 'facebook' && (
                    <>
                      <button onClick={() => { setService('likes'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'likes' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>إعجابات</button>
                      <button onClick={() => { setService('views'); setPostLink(''); }} className={`py-4 rounded-2xl font-black transition-all ${service === 'views' ? 'bg-pink-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>مشاهدات</button>
                    </>
                  )}
                </div>

                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-white">{service === 'followers' ? quantity * 2 : service === 'views' ? Math.ceil(quantity / 50) : quantity}</span></span>
                    <span className="text-xs font-black text-pink-500 uppercase">الكمية: <span className="text-white">{formatNumber(quantity)}</span></span>
                  </div>
                  <input type="range" min={getLimits().min} max={getLimits().max} step={getLimits().max > 1000000 ? 100 : 10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-full accent-pink-500" />
                </div>

                {category === 'facebook' && service === 'followers' && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-info text-blue-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-blue-500 font-bold text-sm mb-1">ملاحظة بشأن سرعة التنفيذ</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          قد يتأخر وصول متابعين فيسبوك حتى <span className="text-white font-bold px-1 bg-white/10 rounded">24 ساعة</span>، يرجى التواصل معنا لتسريع الطلب إذا لزم الأمر.
                        </p>
                     </div>
                  </div>
                )}

                {category === 'instagram' && service === 'followers' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-info text-yellow-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-yellow-500 font-bold text-sm mb-1">ملاحظة هامة لحماية حسابك</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          يتم إرسال المتابعين بشكل تدريجي وآمن لضمان توافقها مع خوارزميات المنصة. قد يستغرق اكتمال الطلب <span className="text-white font-bold px-1 bg-white/10 rounded">24 ساعة أو أقل</span>.
                        </p>
                     </div>
                  </div>
                )}
              </>
            )}

            {category !== 'youtube' && (
              <>
                <div className="flex flex-col items-center gap-4 mt-6">
                   <div className="p-4 rounded-[2.5rem] bg-black/60 border border-white/5 scale-90">
                     <ReCAPTCHA sitekey={activeSiteKey} onChange={(t) => setRecaptchaToken(t || '')} theme="dark" />
                   </div>
                   {errorMsg && <p className="text-pink-500 text-xs font-black animate-pulse">{errorMsg}</p>}
                </div>

                <button onClick={handleLaunch} disabled={isProcessing || isFetchingProfile} className="w-full py-7 rounded-[2.5rem] font-black text-white text-xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 mt-4">
                  {isProcessing || isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : <span>إطلاق الطلب الآن</span>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Confirmation Modal */}
      {showProfileConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowProfileConfirm(false)}></div>
           <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 max-w-md w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             <button onClick={() => setShowProfileConfirm(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 transition-all">
                <i className="fas fa-times text-sm"></i>
             </button>
             
             <h2 className="text-2xl font-black text-white mb-2">هل هذا هو حسابك حقاً؟</h2>
             <p className="text-slate-400 text-sm text-center mb-6">يرجى التأكيد لنتمكن من إتمام طلبك بشكل صحيح.</p>
             
             <div className="bg-[#0B0F19] rounded-2xl w-full p-4 flex items-center gap-4 mb-8 border border-white/5 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shrink-0">
                   <img 
                     src={profileData?.profile_pic || `https://ui-avatars.com/api/?name=${postLink.replace('@', '')}&background=random`} 
                     alt="Avatar" 
                     referrerPolicy="no-referrer"
                     className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                     onError={(e) => {
                       e.currentTarget.src = `https://ui-avatars.com/api/?name=${postLink.replace('@', '')}&background=random`;
                     }}
                   />
                </div>
                <div className="flex-1 dir-rtl text-right overflow-hidden">
                   <h3 className="text-white font-bold text-lg truncate">{profileData?.full_name || postLink.replace('@', '')}</h3>
                   <p className="text-slate-400 text-sm mb-1 truncate dir-ltr text-right">@{profileData?.username || postLink.replace('@', '')}</p>
                   <div className="flex gap-3 text-xs font-bold justify-start mt-1">
                      <span className="text-white">{formatNumber(profileData?.followers)} <span className="text-slate-500 font-normal">متابع</span></span>
                      <span className="text-white">{formatNumber(profileData?.following)} <span className="text-slate-500 font-normal">يتابع</span></span>
                      <span className="text-white">{formatNumber(profileData?.posts)} <span className="text-slate-500 font-normal">منشور</span></span>
                   </div>
                </div>
             </div>

             <div className="flex w-full gap-3 dir-rtl">
                <button onClick={submitOrder} className="flex-[2] bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                  نعم، هذا حسابي <i className="fas fa-check text-sm mt-0.5"></i>
                </button>
                <button onClick={() => setShowProfileConfirm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all">
                  تغيير الحساب
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Custom Private Account Alert Modal */}
      {privateAlertMsg && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPrivateAlertMsg(null)}></div>
           <div className="bg-[#1C1C1E] border border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center text-center">
             
             <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <i className="fas fa-lock text-red-500 text-2xl"></i>
             </div>
             
             <h3 className="text-xl font-black text-white mb-3">حساب خاص!</h3>
             <p className="text-slate-400 text-sm leading-relaxed mb-8">{privateAlertMsg}</p>
             
             <button 
               onClick={() => {
                 setPrivateAlertMsg(null);
                 window.location.reload();
               }} 
               className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
             >
               فهمت، سأقوم بتغييره
             </button>
           </div>
        </div>
      )}

      {/* FLOATING AI CHAT WIDGET */}
      {isMounted && (
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
        </div>
      )}
    </>
  );
}

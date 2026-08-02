'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { createSupabaseClient } from '@/lib/supabase';
import SafeAdSlot from '@/components/SafeAdSlot';

export default function PostsPage() {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [postLink, setPostLink] = useState('');
  
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [service, setService] = useState<'likes' | 'views'>('likes');
  const [quantity, setQuantity] = useState(100);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWaitTime, setAdWaitTime] = useState(0);
  const [removeAds, setRemoveAds] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('points_balance, remove_ads').eq('id', user.id).single();
      if (profile) {
        setUserPoints(profile.points_balance);
        setRemoveAds(profile.remove_ads);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const handleFetchProfile = async () => {
    if (!targetUsername) return;
    setIsFetchingProfile(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/ig-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername })
      });
      const data = await res.json();
      
      if (data.success) {
        setProfileData(data.data);
        setShowTargetModal(false);
      } else {
        setErrorMsg(data.error || 'فشل جلب الحساب');
      }
    } catch (e) {
      setErrorMsg('حدث خطأ أثناء الاتصال.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleLinkSubmit = async () => {
    if (!postLink || !postLink.includes('instagram.com/')) {
      setErrorMsg('الرابط غير صحيح');
      return;
    }
    
    setIsFetchingProfile(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/ig-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: postLink })
      });
      const data = await res.json();
      
      if (data.success) {
        setSelectedPost({ 
          url: postLink, 
          thumbnail: data.data.thumbnail, 
          likes: data.data.likes,
          isVideo: data.data.isVideo
        });
        if (!data.data.isVideo) setService('likes');
        setShowLinkModal(false);
      } else {
        setErrorMsg(data.error || 'فشل جلب المنشور');
      }
    } catch (e) {
      setErrorMsg('حدث خطأ أثناء الاتصال.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const postAdAction = async () => {
    setShowAdModal(false);
    executeOrder();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAdModal && adWaitTime > 0) {
      timer = setInterval(() => setAdWaitTime(p => p - 1), 1000);
    } else if (showAdModal && adWaitTime === 0) {
      postAdAction();
    }
    return () => clearInterval(timer);
  }, [showAdModal, adWaitTime]);

  const handleLaunch = () => {
    if (!selectedPost) return setErrorMsg('الرجاء اختيار المنشور أولاً');
    if (!recaptchaToken) return setErrorMsg('يرجى تأكيد أنك لست روبوت');

    if (removeAds) {
      postAdAction();
    } else {
      setAdWaitTime(10);
      setShowAdModal(true);
    }
  };

  const executeOrder = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/smm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          link: selectedPost.url, 
          serviceType: service, 
          category: 'instagram', 
          recaptchaToken, 
          quantity: quantity,
          totalCost: service === 'views' ? Math.ceil(quantity / 50) : quantity 
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecaptchaToken('');
        fetchUserPoints();
        alert(data.message);
        window.dispatchEvent(new Event('pointsUpdated'));
      } else {
        setErrorMsg(data.error);
        setRecaptchaToken('');
        setTurnstileKey(prev => prev + 1);
      }
    } catch (e) { 
      setErrorMsg('فشل إرسال الطلب');
      setRecaptchaToken('');
      setTurnstileKey(prev => prev + 1);
    }
    finally { 
      setIsProcessing(false); 
      setShowAdModal(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 animate-fade-in relative z-10 pb-10">
        <div className="w-full text-center">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              دعم <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">منشورات انستقرام</span>
           </h1>
        </div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-10 border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-3xl shadow-2xl">
           
           {!profileData && !selectedPost ? (
             <div className="flex flex-col items-center justify-center py-6 gap-4">
                <div className="w-24 h-24 rounded-full bg-pink-500/10 flex flex-col justify-center items-center text-pink-500 mb-2">
                   <i className="fas fa-heart text-4xl mt-1"></i>
                </div>
                <button 
                  onClick={() => { setErrorMsg(''); setShowTargetModal(true); }}
                  className="w-full max-w-xs py-4 rounded-full font-bold text-slate-900 dark:text-white border-2 border-slate-200 dark:border-[#2A2A2D] hover:bg-slate-100 dark:hover:bg-[#1C1C1E] transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-user-circle text-pink-500"></i>
                  اختر الحساب أولاً
                </button>
                <span className="text-slate-400 font-bold text-sm">أو</span>
                <button 
                  onClick={() => { setErrorMsg(''); setShowLinkModal(true); }}
                  className="w-full max-w-xs py-4 rounded-full font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-link"></i>
                  ضع رابط المنشور مباشرة
                </button>
             </div>
           ) : profileData && !selectedPost ? (
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white">اختر المنشور</h2>
                   <button onClick={() => setProfileData(null)} className="text-sm font-bold text-slate-400 hover:text-pink-500">تغيير الحساب</button>
                </div>
                
                {profileData.recent_posts && profileData.recent_posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                     {profileData.recent_posts.map((post: any) => (
                       <div 
                         key={post.id} 
                         onClick={() => {
                           setSelectedPost(post);
                           if (!post.isVideo) setService('likes');
                         }}
                         className="aspect-square bg-slate-100 dark:bg-[#1C1C1E] rounded-xl overflow-hidden cursor-pointer hover:ring-2 ring-pink-500 transition-all relative group"
                       >
                         {post.thumbnail ? (
                           <img src={post.thumbnail} className="w-full h-full object-cover" alt="Post" />
                         ) : (
                           <div className="w-full h-full flex justify-center items-center text-slate-400"><i className="fas fa-image"></i></div>
                         )}
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                            <span className="text-white text-xs font-bold"><i className="fas fa-heart text-pink-500"></i> {formatNumber(post.likes)}</span>
                            {post.isVideo && <span className="text-white text-xs font-bold"><i className="fas fa-play text-white"></i> {formatNumber(post.views)}</span>}
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 font-bold">لا يوجد منشورات أو الحساب خاص</div>
                )}
             </div>
           ) : (
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white">تفاصيل الطلب</h2>
                   <button onClick={() => setSelectedPost(null)} className="text-sm font-bold text-slate-400 hover:text-pink-500">تغيير المنشور</button>
                </div>

                {selectedPost.thumbnail && (
                  <div className="w-full flex justify-center">
                    <img src={selectedPost.thumbnail} className="w-32 h-32 rounded-2xl object-cover shadow-lg border border-black/5 dark:border-white/5" alt="Selected Post" />
                  </div>
                )}
                
                {!selectedPost.thumbnail && (
                  <div className="w-full text-center">
                    <p className="text-xs text-slate-500 break-all bg-black/5 dark:bg-white/5 p-3 rounded-lg font-mono">{selectedPost.url}</p>
                  </div>
                )}

                <div className="flex flex-row bg-slate-100 dark:bg-black/40 p-1.5 rounded-2xl w-full border border-black/5 dark:border-white/5 gap-1 shadow-inner">
                  <button onClick={() => setService('likes')} className={`flex-1 py-3.5 text-sm md:text-base rounded-xl font-black transition-all duration-300 ${service === 'likes' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>إعجابات (Likes)</button>
                  {selectedPost.isVideo && (
                    <button onClick={() => setService('views')} className={`flex-1 py-3.5 text-sm md:text-base rounded-xl font-black transition-all duration-300 ${service === 'views' ? 'bg-pink-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>مشاهدات (Views)</button>
                  )}
                </div>

                <div className="bg-slate-100 dark:bg-black/40 p-8 rounded-[2rem] border border-black/5 dark:border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-slate-900 dark:text-white">{service === 'views' ? Math.ceil(quantity / 50) : quantity}</span></span>
                    <span className="text-sm font-black text-pink-500 uppercase">الكمية: <span className="text-slate-900 dark:text-white">{formatNumber(quantity)}</span></span>
                  </div>
                  <input 
                    type="range" 
                    min={service === 'views' ? 100 : 50} 
                    max={service === 'views' ? 10000000 : 100000} 
                    step={service === 'views' ? 100 : 10} 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full accent-pink-500" 
                  />
                </div>

                <div className="flex flex-col items-center gap-4 mt-2">
                   <div className="p-4 rounded-[2rem] bg-slate-50 dark:bg-black/60 border border-black/5 dark:border-white/5 flex justify-center min-h-[85px] items-center">
                     <Turnstile
                        key={turnstileKey}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                        onSuccess={(token: string) => setRecaptchaToken(token)}
                        options={{ theme: 'dark' }}
                     />
                   </div>
                   {errorMsg && <p className="text-pink-500 text-sm font-black animate-pulse">{errorMsg}</p>}
                </div>

                <button onClick={handleLaunch} disabled={isProcessing} className="w-full py-6 rounded-[2rem] font-black text-white text-xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <span>اطلب الآن</span>}
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Target Username Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowTargetModal(false)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-6">
                <i className="fas fa-search text-3xl"></i>
             </div>
             <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">أدخل اسم المستخدم</h2>
             <div className="w-full relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl font-mono">@</span>
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-left text-slate-900 dark:text-white font-outfit text-lg focus:outline-none focus:border-pink-500/50 transition-colors"
                  dir="ltr"
                  autoFocus
                />
             </div>
             {errorMsg && <p className="text-pink-500 text-sm font-bold mb-4 w-full text-center">{errorMsg}</p>}
             <div className="flex w-full gap-3 dir-rtl">
                <button 
                  onClick={handleFetchProfile} 
                  disabled={isFetchingProfile || !targetUsername}
                  className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex justify-center items-center disabled:opacity-50"
                >
                  {isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : 'موافق (OK)'}
                </button>
                <button 
                  onClick={() => setShowTargetModal(false)} 
                  className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all"
                >
                  إلغاء
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Direct Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowLinkModal(false)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-6">
                <i className="fas fa-link text-3xl"></i>
             </div>
             <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">أدخل رابط المنشور</h2>
             <div className="w-full relative mb-6">
                <input
                  type="url"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl py-4 px-4 text-left text-slate-900 dark:text-white font-outfit text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                  dir="ltr"
                  autoFocus
                />
             </div>
             {errorMsg && <p className="text-pink-500 text-sm font-bold mb-4 w-full text-center">{errorMsg}</p>}
             <div className="flex w-full gap-3 dir-rtl">
                <button 
                  onClick={handleLinkSubmit} 
                  disabled={!postLink || isFetchingProfile}
                  className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all flex justify-center items-center disabled:opacity-50"
                >
                  {isFetchingProfile ? <i className="fas fa-spinner fa-spin"></i> : 'موافق (OK)'}
                </button>
                <button 
                  onClick={() => setShowLinkModal(false)} 
                  className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold py-4 rounded-xl transition-all"
                >
                  إلغاء
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Ad Wait Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl animate-fade-in"></div>
          <div className="relative z-10 w-full max-w-[420px] flex flex-col animate-slide-up bg-[#0A0A0A] border border-red-500/20 rounded-[2rem] p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-pink-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
                style={{ width: `${Math.min(100, (adWaitTime / 10) * 100)}%` }}
              ></div>
            </div>
            <div className="w-full flex justify-between items-center mb-6 pt-2">
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-xs font-black text-red-400 tracking-wider">
                  {adWaitTime > 0 ? `يرجى الانتظار ${adWaitTime}ث` : 'جاري التنفيذ...'}
                </span>
              </div>
              <div className="bg-white/5 px-4 py-1.5 rounded-full">
                <span className="text-xs font-bold text-slate-400">إعلان سبونسر</span>
              </div>
            </div>
            <div className="w-full flex justify-center mb-6">
              <div className="w-[300px] h-[250px] bg-[#050505] rounded-2xl overflow-hidden border border-white/5 relative flex justify-center items-center">
                <SafeAdSlot src="/ad-300.html" width="300" height="250" className="mx-auto" loading="lazy" />
              </div>
            </div>
            <div className="w-full text-center px-2">
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4 font-medium">
                شكراً لدعمك المنصة! مشاهدة الإعلانات تساعدنا على إبقاء الخدمات مجانية ومنخفضة التكلفة للجميع.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

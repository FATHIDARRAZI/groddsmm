'use client';

import React, { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { createSupabaseClient } from '@/lib/supabase';
import SafeAdSlot from '@/components/SafeAdSlot';

interface Story {
  id: string;
  type: 'image' | 'video';
  media_url: string;
  download_url?: string;
  thumbnail_url?: string;
  taken_at: number;
}

interface ProfileData {
  username: string;
  full_name?: string;
  profile_pic?: string;
  followers?: number;
  is_private: boolean;
  stories: Story[];
}

export default function StoryPage() {
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  
  // Ad State
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWaitTime, setAdWaitTime] = useState(0);
  const [removeAds, setRemoveAds] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [serviceConfig, setServiceConfig] = useState<any>(null);

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchUserPoints();
    fetchServiceConfig();
  }, []);

  const fetchServiceConfig = async () => {
    const { data } = await supabase.from('services')
      .select('provider_cost_per_1000, markup_multiplier, min_quantity, max_quantity')
      .eq('category', 'instagram')
      .eq('service_type', 'story_views')
      .single();
    if (data) setServiceConfig(data);
  };

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

  const calculateCost = (qty: number) => {
    if (!serviceConfig) return qty * 1; // fallback
    const cost = serviceConfig.provider_cost_per_1000 || 0.10;
    const markup = serviceConfig.markup_multiplier || 3.0;
    return Math.ceil((qty / 1000) * cost * 1000 * markup);
  };

  const getMaxAffordableQty = () => {
    if (!serviceConfig || userPoints <= 0) return serviceConfig?.min_quantity || 10;
    const cost = serviceConfig.provider_cost_per_1000 || 0.10;
    const markup = serviceConfig.markup_multiplier || 3.0;
    const costPerItem = cost * markup;
    const affordable = Math.floor(userPoints / costPerItem);
    const roundedAffordable = Math.floor(affordable / 10) * 10;
    
    const absoluteMax = serviceConfig.max_quantity || 100000;
    const minQty = serviceConfig.min_quantity || 10;
    
    if (roundedAffordable < minQty) return minQty;
    return Math.min(roundedAffordable, absoluteMax);
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  const handleFetchStory = async () => {
    if (!targetUsername) return;
    
    setIsFetchingProfile(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/ig-story', {
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
      setErrorMsg('حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const downloadMedia = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed', error);
      // Fallback
      window.open(url, '_blank');
    }
  };

  const openOrderModal = (story: Story) => {
    setSelectedStory(story);
    setShowOrderModal(true);
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
    if (!selectedStory) return;
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
          link: `https://instagram.com/stories/${profileData?.username}/${selectedStory?.id}/`, 
          serviceType: 'story_views', 
          category: 'instagram', 
          recaptchaToken, 
          quantity: quantity,
          totalCost: quantity * 1 // Story views are cheaper
        })
      });
      const data = await res.json();
      if (data.success) {
        setRecaptchaToken('');
        fetchUserPoints();
        alert(data.message || 'تم إرسال المشاهدات بنجاح!');
        window.dispatchEvent(new Event('pointsUpdated'));
        setShowOrderModal(false);
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

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in relative z-10 pb-10">
        
        <div className="w-full text-center">
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              مشاهدات <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">القصص (Stories)</span>
           </h1>
           <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">عرض القصص بوضوح، تحميلها، أو زيادة مشاهداتها فوراً</p>
        </div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-10 border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-3xl shadow-2xl">
           
           {!profileData ? (
             <div className="flex flex-col items-center justify-center py-10 gap-6">
                <div className="w-24 h-24 rounded-full bg-orange-500/10 flex flex-col justify-center items-center text-orange-500 mb-4">
                   <i className="fas fa-camera-retro text-4xl mb-1"></i>
                </div>
                <button 
                  onClick={() => setShowTargetModal(true)}
                  className="w-full max-w-xs py-4 rounded-full font-bold text-slate-900 dark:text-white border-2 border-slate-200 dark:border-[#2A2A2D] hover:bg-slate-100 dark:hover:bg-[#1C1C1E] transition-all flex items-center justify-center gap-3"
                >
                  <i className="fas fa-search text-orange-500"></i>
                  ابحث عن حساب
                </button>
             </div>
           ) : (
             <div className="flex flex-col gap-8">
                {/* Profile Header */}
                <div className="bg-slate-50 dark:bg-[#121214] rounded-2xl w-full p-4 flex items-center gap-4 border border-black/5 dark:border-white/5 shadow-inner relative">
                  <button 
                    onClick={() => { setProfileData(null); setTargetUsername(''); }}
                    className="absolute top-4 left-4 text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    تغيير الحساب
                  </button>
                  <div className={`w-16 h-16 rounded-full p-0.5 shrink-0 ${profileData.stories.length > 0 ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                     <img 
                       src={profileData.profile_pic || `https://ui-avatars.com/api/?name=${profileData.username}&background=random`} 
                       alt="Avatar" 
                       referrerPolicy="no-referrer"
                       className="w-full h-full rounded-full object-cover border-2 border-[#0B0F19]"
                     />
                  </div>
                  <div className="flex-1 dir-rtl text-right overflow-hidden">
                     <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">{profileData.full_name || profileData.username}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 truncate dir-ltr text-right">@{profileData.username}</p>
                     {!profileData.is_private && (
                       <div className="flex gap-3 text-xs font-bold justify-start mt-1">
                          <span className="text-slate-900 dark:text-white">{formatNumber(profileData.followers || 0)} <span className="text-slate-500 font-normal">متابع</span></span>
                          <span className="text-orange-500">{profileData.stories.length} <span className="text-slate-500 font-normal">قصص نشطة</span></span>
                       </div>
                     )}
                  </div>
                </div>

                {/* Private Warning */}
                {profileData.is_private && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                     <div className="mt-0.5 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <i className="fas fa-lock text-red-500 text-xs"></i>
                     </div>
                     <div className="text-right flex-1">
                        <h4 className="text-red-500 font-bold text-sm mb-1">حساب خاص (Private)</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                          هذا الحساب خاص. لا يمكننا جلب أو عرض القصص للحسابات الخاصة. يرجى تحويل الحساب إلى عام.
                        </p>
                     </div>
                  </div>
                )}

                {/* Stories Grid */}
                {!profileData.is_private && profileData.stories.length === 0 && (
                   <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                     لا توجد قصص نشطة لهذا الحساب حالياً.
                   </div>
                )}

                {!profileData.is_private && profileData.stories.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {profileData.stories.map((story) => (
                      <div key={story.id} className="bg-white dark:bg-[#121214] rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 shadow-lg group relative">
                        {/* Media Container */}
                        <div className="relative aspect-[9/16] w-full bg-black">
                          {story.type === 'video' ? (
                            <video 
                              src={story.media_url} 
                              poster={story.thumbnail_url}
                              className="w-full h-full object-cover" 
                              controls 
                              playsInline 
                              preload="metadata"
                            />
                          ) : (
                            <img 
                              src={story.media_url} 
                              alt="Story" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold">
                            {timeAgo(story.taken_at)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="p-4 flex gap-2">
                           <button 
                             onClick={() => openOrderModal(story)}
                             className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                           >
                             <i className="fas fa-eye"></i> زيادة مشاهدات
                           </button>
                           <button 
                             onClick={() => downloadMedia(story.download_url || story.media_url, `story_${profileData.username}_${story.id}`)}
                             className="w-12 flex-shrink-0 bg-slate-100 dark:bg-[#1C1C1E] hover:bg-slate-200 dark:hover:bg-[#2A2A2D] text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all"
                             title="تحميل"
                           >
                             <i className="fas fa-download"></i>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Target Username Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowTargetModal(false)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-8 max-w-sm w-full relative z-10 animate-slide-up shadow-2xl flex flex-col items-center">
             
             <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 mb-6">
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
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-left text-slate-900 dark:text-white font-outfit text-lg focus:outline-none focus:border-orange-500/50 transition-colors"
                  dir="ltr"
                  autoFocus
                />
             </div>

             {errorMsg && <p className="text-red-500 text-sm font-bold mb-4 w-full text-center">{errorMsg}</p>}

             <div className="flex w-full gap-3 dir-rtl">
                <button 
                  onClick={handleFetchStory} 
                  disabled={isFetchingProfile || !targetUsername}
                  className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center disabled:opacity-50"
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

      {/* Order Views Modal */}
      {showOrderModal && selectedStory && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-md animate-fade-in" onClick={() => setShowOrderModal(false)}></div>
           <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 max-w-md w-full relative z-10 animate-slide-up shadow-2xl flex flex-col gap-6">
             
             <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">زيادة مشاهدات القصة</h2>
                <button onClick={() => setShowOrderModal(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <i className="fas fa-times text-slate-500"></i>
                </button>
             </div>
             
             <div className="flex gap-4 items-center bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
               <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                  {selectedStory.type === 'video' ? (
                     <img src={selectedStory.thumbnail_url} className="w-full h-full object-cover" alt="thumb" />
                  ) : (
                     <img src={selectedStory.media_url} className="w-full h-full object-cover" alt="thumb" />
                  )}
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">قصة لـ @{profileData?.username}</p>
                 <p className="text-xs text-slate-500">{timeAgo(selectedStory.taken_at)}</p>
               </div>
             </div>

               <div className="bg-slate-100 dark:bg-black/40 p-6 rounded-[2rem] border border-black/5 dark:border-white/5 space-y-4">
                 <div className="flex justify-between items-center">
                 <span className="text-sm font-black text-slate-500 uppercase">تكلفة النقاط: <span className="text-slate-900 dark:text-white">{calculateCost(quantity)}</span></span>
                 <span className="text-sm font-black text-orange-500 uppercase">الكمية: <span className="text-slate-900 dark:text-white">{formatNumber(quantity)}</span></span>
                 </div>
                 <input 
                 type="range" 
                 min={serviceConfig?.min_quantity || 10} 
                 max={getMaxAffordableQty()} 
                 step={10} 
                 value={quantity} 
                 onChange={(e) => setQuantity(Number(e.target.value))} 
                 className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full accent-pink-500" 
                 />
             </div>

             <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/60 border border-black/5 dark:border-white/5 flex justify-center min-h-[85px] items-center w-full">
                  <Turnstile
                     key={turnstileKey}
                     siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                     onSuccess={(token: string) => setRecaptchaToken(token)}
                     options={{ theme: 'dark' }}
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-sm font-black animate-pulse text-center">{errorMsg}</p>}
             </div>

             <button onClick={handleLaunch} disabled={isProcessing} className="w-full py-5 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
               {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : <span>اطلب مشاهدات الآن</span>}
             </button>

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
                className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(234,88,12,0.8)]" 
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

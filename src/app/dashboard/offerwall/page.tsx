'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SMART_LINKS = [
  "https://evacuateenclose.com/zeyns3fb?key=cb01eb11742914d2a3e8c0cd74d17e70", // Original
  "https://evacuateenclose.com/xdk3wa90q?key=465fe0e196ddf7d5ee82dbb3fbd12f81", // ID: 29468968
  "https://evacuateenclose.com/jx11sa42uw?key=a26591c48b8c9752011582baf92f6afe"  // ID: 29468973
];

type TaskStatus = 'idle' | 'waiting' | 'ready' | 'claimed';

interface ServerTask {
  id: string;
  name: string;
  reward: number;
  icon: string;
  color: string;
  badge: string;
}

const SERVERS: ServerTask[] = [
  { id: 'server_1', name: 'خادم ألفا (Alpha)', reward: 10, icon: 'fa-server', color: 'from-blue-500 to-cyan-500', badge: 'سريع' },
  { id: 'server_2', name: 'خادم بيتا (Beta)', reward: 10, icon: 'fa-network-wired', color: 'from-purple-500 to-indigo-500', badge: 'مستقر' },
  { id: 'server_3', name: 'خادم غاما (Gamma)', reward: 10, icon: 'fa-database', color: 'from-pink-500 to-rose-500', badge: 'نشط' },
  { id: 'server_4', name: 'خادم دلتا (Delta)', reward: 10, icon: 'fa-microchip', color: 'from-amber-500 to-orange-500', badge: 'جديد' },
  { id: 'server_5', name: 'خادم إبسيلون (Epsilon)', reward: 10, icon: 'fa-hdd', color: 'from-emerald-500 to-teal-500', badge: 'آمن' },
  { id: 'server_6', name: 'خادم زيتا (Zeta)', reward: 10, icon: 'fa-satellite-dish', color: 'from-fuchsia-500 to-pink-500', badge: 'سريع' },
  { id: 'server_7', name: 'خادم إيتا (Eta)', reward: 10, icon: 'fa-wifi', color: 'from-sky-500 to-blue-500', badge: 'نشط' },
  { id: 'server_8', name: 'خادم ثيتا (Theta)', reward: 10, icon: 'fa-cloud', color: 'from-red-500 to-rose-500', badge: 'مميز' },
];

export default function OfferwallPage() {
  const router = useRouter();
  
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({});
  const [taskTimers, setTaskTimers] = useState<Record<string, number>>({});
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden && document.hasFocus());
    };
    
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    
    handleVisibility();

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
    };
  }, []);

  // Fetch initial completed statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch('/api/offerwall/claim');
        if (res.ok) {
          const data = await res.json();
          if (data.completed) {
            const initialStatuses: Record<string, TaskStatus> = {};
            data.completed.forEach((id: string) => {
              initialStatuses[id] = 'claimed';
            });
            setTaskStatuses(initialStatuses);
          }
        }
      } catch (err) {
        console.error("Failed to fetch offerwall statuses", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  // Timer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTaskTimers(prevTimers => {
        let newTimers = { ...prevTimers };
        let updated = false;

        Object.keys(newTimers).forEach(id => {
          if (taskStatuses[id] === 'waiting' && newTimers[id] > 0) {
            if (!isTabActive) {
              newTimers[id] -= 1;
              updated = true;
            }
          } else if (taskStatuses[id] === 'waiting' && newTimers[id] === 0) {
            setTaskStatuses(prev => ({ ...prev, [id]: 'ready' }));
          }
        });

        return updated ? newTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [taskStatuses, isTabActive]);

  // Update document title with timer
  useEffect(() => {
    const waitingServerId = Object.keys(taskStatuses).find(id => taskStatuses[id] === 'waiting');
    if (waitingServerId) {
      const timeLeft = taskTimers[waitingServerId];
      if (timeLeft !== undefined) {
        document.title = `⏱️ (${timeLeft}ث) جاري التحقق | Grodd SMM`;
        return;
      }
    }
    document.title = 'لوحة التحكم | Grodd SMM';
    
    return () => {
      document.title = 'لوحة التحكم | Grodd SMM';
    };
  }, [taskTimers, taskStatuses]);

  const handleStartTask = (id: string, index: number) => {
    if (taskStatuses[id] === 'claimed') return;
    
    const smartLink = SMART_LINKS[index % SMART_LINKS.length];
    window.open(smartLink, '_blank');
    
    setTaskStatuses(prev => ({ ...prev, [id]: 'waiting' }));
    setTaskTimers(prev => ({ ...prev, [id]: 20 })); // 20 seconds wait
    setIsTabActive(false); // Immediately set tab active to false since we opened new tab!
  };

  const handleClaimTask = async (id: string, reward: number) => {
    if (isClaiming) return;
    setIsClaiming(true);

    try {
      const res = await fetch('/api/offerwall/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: id })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTaskStatuses(prev => ({ ...prev, [id]: 'claimed' }));
        window.dispatchEvent(new Event('pointsUpdated')); 
      } else {
        alert(data.error || "Failed to verify task. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsClaiming(false);
    }
  };

  // Auto-claim when task becomes ready
  useEffect(() => {
    Object.keys(taskStatuses).forEach(id => {
      if (taskStatuses[id] === 'ready') {
        const server = SERVERS.find(s => s.id === id);
        if (server) {
          handleClaimTask(id, server.reward);
        }
      }
    });
  }, [taskStatuses]);

  const completedCount = SERVERS.filter(server => taskStatuses[server.id] === 'claimed').length;
  const allCompleted = completedCount === SERVERS.length;
  const progressPercent = (completedCount / SERVERS.length) * 100;
  const totalEarnedPoints = completedCount * 10;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 animate-fade-in relative z-10">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header Info */}
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
          اكسب النقاط من <span className="text-green-500">جدار المهام اليومي</span>
        </h1>
        <p className="text-slate-400 font-medium text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
          قم بزيارة الرعاة لدعم المنصة والحصول على رصيد فوري. احتفظ بنافذة الراعي مفتوحة لمدة 20 ثانية لتأكيد طلب استلام النقاط. تتجدد المهام تلقائياً يومياً الساعة 12:00 منتصف الليل بتوقيت جرينتش.
        </p>
      </div>

      {/* Progress & Stat Tracker Widget */}
      <div className="w-full bg-[#121827]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-xl mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        
        {/* Metric Details */}
        <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start w-full md:w-auto text-right">
          <div className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl flex flex-col gap-1 items-center md:items-end min-w-[130px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المهام المكتملة</span>
            <span className="text-white font-black text-2xl">{completedCount} / 8</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl flex flex-col gap-1 items-center md:items-end min-w-[130px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">النقاط المكتسبة</span>
            <span className="text-green-500 font-black text-2xl">+{totalEarnedPoints} نقطة</span>
          </div>
        </div>

        {/* Progress Tracker Slider */}
        <div className="flex-1 w-full max-w-md flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-slate-500 uppercase">معدل الإنجاز اليومي</span>
            <span className="text-green-500">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

      </div>

      {allCompleted && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-[2rem] p-6 text-center font-bold mb-8 shadow-[0_0_20px_rgba(34,197,94,0.1)] flex flex-col items-center justify-center gap-2">
          <i className="fas fa-check-circle text-4xl text-green-500 animate-bounce"></i>
          <h4 className="text-white font-black text-lg">عمل رائع! أكملت جميع المهام المتاحة</h4>
          <p className="text-slate-400 text-xs font-medium">سيتم فتح الخوادم ومهام التحدي مجدداً في تمام الساعة 12:00 منتصف الليل GMT</p>
        </div>
      )}

      {/* Grid of Servers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVERS.map((server, index) => {
          const status = taskStatuses[server.id] || 'idle';
          const timeLeft = taskTimers[server.id] || 0;
          const progressDash = ((20 - timeLeft) / 20) * 100;

          return (
            <div 
              key={server.id} 
              className={`bg-[#121214]/60 backdrop-blur-xl rounded-[2rem] border p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 group ${
                status === 'claimed' 
                  ? 'border-white/5 opacity-55 hover:opacity-80' 
                  : 'border-white/5 hover:border-white/10 hover:-translate-y-1 shadow-lg'
              }`}
            >
              
              {/* Blurred background glows matching server's theme */}
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-10 pointer-events-none bg-gradient-to-br ${server.color}`}></div>
              
              {/* Status Badge */}
              <span className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                status === 'claimed'
                  ? 'bg-green-500/10 border-green-500/20 text-green-500'
                  : 'bg-white/5 border-white/5 text-slate-400'
              }`}>
                {status === 'claimed' ? 'مكتمل' : server.badge}
              </span>

              {/* Server Icon Container */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-xl text-white shadow-lg bg-gradient-to-br ${server.color} relative`}>
                <i className={`fas ${server.icon}`}></i>
                
                {status === 'claimed' && (
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border border-[#121214] text-[9px] text-white">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>

              {/* Title & Rewards */}
              <h3 className="text-base font-black text-white mb-1">{server.name}</h3>
              <span className="text-green-400 font-bold text-xs bg-green-500/10 border border-green-500/10 px-3 py-1 rounded-full mb-6 inline-block">
                +{server.reward} نقطة
              </span>

              {/* State Action Buttons */}
              <div className="w-full mt-auto">
                {status === 'idle' && (
                  <button 
                    onClick={() => handleStartTask(server.id, index)}
                    className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${server.color} hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs shadow-md`}
                  >
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                    <span>ابدأ المهمة</span>
                  </button>
                )}

                {status === 'waiting' && (
                  <div className="w-full space-y-3">
                    {isTabActive ? (
                      <div className="w-full py-3 rounded-xl font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center justify-center gap-0.5 animate-pulse text-[11px]">
                        <span className="flex items-center gap-1.5"><i className="fas fa-pause text-[9px]"></i> مؤقت معلق</span>
                        <span className="text-[9px] text-slate-400">يرجى العودة لصفحة الراعي</span>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="w-full py-3 rounded-xl font-black text-white bg-slate-800 border border-slate-700 flex items-center justify-center gap-2 cursor-wait text-[11px] relative overflow-hidden">
                          {/* Inner ticking visual progress bar */}
                          <div 
                            className="absolute bottom-0 right-0 h-0.5 bg-yellow-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${progressDash}%` }}
                          ></div>
                          <i className="fas fa-spinner fa-spin text-yellow-500 text-[10px]"></i>
                          <span>جاري التحقق... {timeLeft}ث</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {status === 'ready' && (
                  <button 
                    onClick={() => handleClaimTask(server.id, server.reward)}
                    disabled={isClaiming}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 shadow-[0_5px_15px_rgba(34,197,94,0.3)] hover:scale-102 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-xs"
                  >
                    {isClaiming ? <i className="fas fa-spinner fa-spin text-[10px]"></i> : <i className="fas fa-gift text-[10px]"></i>}
                    <span>{isClaiming ? 'جاري الاستلام...' : 'احصد النقاط'}</span>
                  </button>
                )}

                {status === 'claimed' && (
                  <div className="w-full py-3 rounded-xl font-bold text-slate-500 bg-white/[0.02] border border-white/5 flex items-center justify-center gap-1.5 text-xs">
                    <i className="fas fa-check text-[10px]"></i>
                    <span>تم الاستلام بنجاح</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

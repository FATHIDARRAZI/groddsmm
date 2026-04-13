'use client';

import React, { useState } from 'react';

export default function EarnPage() {
  const [clicks, setClicks] = useState<Record<number, number>>({});

  const handleTaskClick = (idx: number, url: string) => {
    const currentVisits = clicks[idx] || 0;
    if (currentVisits >= 3) return;
    
    setClicks(prev => ({ ...prev, [idx]: currentVisits + 1 }));
    window.open(url, '_blank');
  };

  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">تخطي الروابط 🔗</h1>
          <p className="text-slate-400 text-sm">اربح نقاط مجانية يمكن استخدامها في إطلاق الحملات عن طريق تخطي الروابط عبر شركائنا.</p>
        </div>
        <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center border border-white/5">
           <i className="fas fa-coins text-yellow-500 text-xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'مهمة الرابط المختصر #1', url: 'https://shrinkme.click/GroddSMM', provider: 'ShrinkMe', points: 3,
            classes: { blur: 'bg-yellow-500/5 group-hover:bg-yellow-500/10', icon: 'text-yellow-500', badge: 'text-yellow-500 bg-yellow-500/10', btn: 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #2', url: 'https://shrinkme.click/GroddSTry', provider: 'ShrinkMe', points: 3,
            classes: { blur: 'bg-pink-500/5 group-hover:bg-pink-500/10', icon: 'text-pink-500', badge: 'text-pink-500 bg-pink-500/10', btn: 'bg-pink-500 text-white hover:bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #3', url: 'https://shrinkme.click/GroddGoro', provider: 'ShrinkMe', points: 3,
            classes: { blur: 'bg-blue-500/5 group-hover:bg-blue-500/10', icon: 'text-blue-500', badge: 'text-blue-500 bg-blue-500/10', btn: 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #4', url: 'https://shrinkme.click/GroddLabs', provider: 'ShrinkMe', points: 3,
            classes: { blur: 'bg-purple-500/5 group-hover:bg-purple-500/10', icon: 'text-purple-500', badge: 'text-purple-500 bg-purple-500/10', btn: 'bg-purple-500 text-white hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #5', url: 'https://direct-link.net/5028247/0BiJPkqmtMY2', provider: 'Linkvertise', points: 5,
            classes: { blur: 'bg-[#FF8577]/5 group-hover:bg-[#FF8577]/10', icon: 'text-[#FF8577]', badge: 'text-[#FF8577] bg-[#FF8577]/10', btn: 'bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-white hover:opacity-90 shadow-[0_0_20px_rgba(255,133,119,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #6', url: 'https://tpi.li/grodd', provider: 'TPI.li', points: 1,
            classes: { blur: 'bg-green-500/5 group-hover:bg-green-500/10', icon: 'text-green-500', badge: 'text-green-500 bg-green-500/10', btn: 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #7', url: 'https://tpi.li/grod', provider: 'TPI.li', points: 1,
            classes: { blur: 'bg-blue-500/5 group-hover:bg-blue-500/10', icon: 'text-blue-500', badge: 'text-blue-500 bg-blue-500/10', btn: 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #8', url: 'https://tpi.li/groddsmm', provider: 'TPI.li', points: 1,
            classes: { blur: 'bg-yellow-500/5 group-hover:bg-yellow-500/10', icon: 'text-yellow-500', badge: 'text-yellow-500 bg-yellow-500/10', btn: 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #9', url: 'https://tpi.li/groddlabs', provider: 'TPI.li', points: 1,
            classes: { blur: 'bg-purple-500/5 group-hover:bg-purple-500/10', icon: 'text-purple-500', badge: 'text-purple-500 bg-purple-500/10', btn: 'bg-purple-500 text-white hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #10', url: 'https://adfly.site/grodd', provider: 'Adfly', points: 2,
            classes: { blur: 'bg-blue-500/5 group-hover:bg-blue-500/10', icon: 'text-blue-500', badge: 'text-blue-500 bg-blue-500/10', btn: 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #11', url: 'https://adfly.site/groddlabs', provider: 'Adfly', points: 2,
            classes: { blur: 'bg-pink-500/5 group-hover:bg-pink-500/10', icon: 'text-pink-500', badge: 'text-pink-500 bg-pink-500/10', btn: 'bg-pink-500 text-white hover:bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #12', url: 'https://adfly.site/groddsmm', provider: 'Adfly', points: 2,
            classes: { blur: 'bg-green-500/5 group-hover:bg-green-500/10', icon: 'text-green-500', badge: 'text-green-500 bg-green-500/10', btn: 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' }
          },
          { title: 'مهمة الرابط المختصر #13', url: 'https://adfly.site/groddy', provider: 'Adfly', points: 2,
            classes: { blur: 'bg-[#FF8577]/5 group-hover:bg-[#FF8577]/10', icon: 'text-[#FF8577]', badge: 'text-[#FF8577] bg-[#FF8577]/10', btn: 'bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] text-white hover:opacity-90 shadow-[0_0_20px_rgba(255,133,119,0.2)]' }
          }
        ].map((task, idx) => (
          <div key={idx} className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none transition-colors ${task.classes.blur}`}></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                 <i className={`fas fa-link ${task.classes.icon}`}></i>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{task.title}</h3>
                <p className="text-xs text-slate-500">المزود: {task.provider}</p>
              </div>
            </div>
            <div className="bg-[#0B0F19] rounded-lg p-3 mb-6 flex justify-between items-center border border-white/5">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-slate-400">المكافأة:</span>
                 <span className="text-[10px] text-slate-500 font-bold">المتاح: {3 - (clicks[idx] || 0)}/3 مرات</span>
               </div>
               <span className={`font-bold px-3 py-1 rounded-md text-sm ${task.classes.badge}`}>+{task.points} نقطة</span>
            </div>
            
            {(clicks[idx] || 0) >= 3 ? (
              <button disabled className="block text-center w-full py-3 rounded-xl font-bold bg-[#121214] border border-white/5 text-slate-600 cursor-not-allowed">
                 مكتمل لليوم <i className="fas fa-check-circle ml-2 text-xs"></i>
              </button>
            ) : (
              <button onClick={() => handleTaskClick(idx, task.url)} className={`block text-center w-full py-3 rounded-xl font-bold transition-colors ${task.classes.btn}`}>
                 تخطي الآن <i className="fas fa-external-link-alt ml-2 text-xs"></i>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Banner Ad Area inside Earn Page */}
      <div className="w-full mt-8 bg-[#0B0F19] border border-white/5 rounded-xl flex items-center justify-center min-h-[90px] relative overflow-hidden">
        <p className="absolute text-[10px] text-slate-600 font-bold top-1">ADVERTISEMENT</p>
        <iframe src="/ad-728.html" width="728" height="90" frameBorder="0" scrolling="no" className="z-10 scale-[0.5] sm:scale-100 origin-center"></iframe>
      </div>

    </div>
  );
}

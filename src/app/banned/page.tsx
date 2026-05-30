import React from 'react';
import Link from 'next/link';

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-[#07090F] flex items-center justify-center p-6 relative overflow-hidden font-cairo">
      {/* Background Cinematic Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center space-y-10 animate-fade-in">
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-red-600/10 rounded-[2rem] border border-red-600/20 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-float">
             <i className="fas fa-user-slash text-6xl text-red-600 drop-shadow-[0_0_10px_#dc2626]"></i>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border-2 border-red-600 rounded-full flex items-center justify-center">
             <i className="fas fa-exclamation-triangle text-[10px] text-red-600"></i>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight">
            تم إيقاف حسابك <br/> 
            <span className="text-red-600">نظام الأمن والحماية</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-bold max-w-lg mx-auto leading-relaxed">
            عذراً، لقد تم حظرك من الوصول للمنصة بسبب انتهاك سياسة "الحسابات المتعددة". لا يُسمح بإنشاء أكثر من حساب لكل جهاز.
          </p>
        </div>

        <div className="bg-[#121827]/50 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl space-y-8">
           <div className="space-y-2">
              <h3 className="text-white font-black text-xl">كيف يمكنني حل هذه المشكلة؟</h3>
              <p className="text-slate-500 text-sm font-bold">
                 إذا كنت تعتقد أن هذا الإجراء تم عن طريق الخطأ، يمكنك التواصل مع فريق الدعم الفني عبر ديسكورد أو إنستجرام لمراجعة حالتك.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.instagram.com/grodd_media/" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-white/10 rounded-2xl text-white font-black transition-all flex items-center justify-center gap-3 group"
              >
                 <i className="fab fa-instagram text-xl group-hover:scale-125 transition-transform text-pink-500"></i>
                 الدعم عبر إنستجرام
              </a>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black transition-all shadow-[0_10px_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3"
              >
                 <i className="fas fa-sign-in-alt"></i>
                 تسجيل الخروج
              </Link>
           </div>
        </div>

        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
          Grodd Labs Security Engine v4.0.1
        </p>
      </div>
    </div>
  );
}

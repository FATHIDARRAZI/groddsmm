import React from 'react';

export default function ContactUs() {
  return (
    <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-12 w-full max-w-lg mx-auto min-h-[60vh]">
      <div className="w-full glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden dir-rtl text-right text-center">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center mb-6 border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
            <i className="fas fa-headset text-4xl text-pink-500"></i>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white mb-2">تواصل مع الدعم الفني</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            فريق وكالة Grodd Media متاح دائماً للإجابة على استفساراتكم حول تحسين الخوارزميات والحملات.
          </p>
          
          <div className="flex flex-col gap-4 w-full">
            <a href="https://t.me/grodd_media" target="_blank" rel="noreferrer" className="w-full bg-[#121827] hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between group transition-all">
              <i className="fas fa-chevron-left text-slate-600 group-hover:text-white transition-colors"></i>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white">تليجرام (أسرع استجابة)</span>
                <i className="fab fa-telegram text-2xl text-blue-400"></i>
              </div>
            </a>
            
            <a href="https://wa.me/212687097476" target="_blank" rel="noreferrer" className="w-full bg-[#121827] hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between group transition-all">
               <i className="fas fa-chevron-left text-slate-600 group-hover:text-white transition-colors"></i>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white">واتساب (+212 687-097476)</span>
                <i className="fab fa-whatsapp text-2xl text-green-500"></i>
              </div>
            </a>
            
            <a href="mailto:groddlabs@proton.me" className="w-full bg-[#121827] hover:bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between group transition-all">
               <i className="fas fa-chevron-left text-slate-600 group-hover:text-white transition-colors"></i>
              <div className="flex items-center gap-4">
                <span className="font-bold text-white">البريد الإلكتروني</span>
                <i className="fas fa-envelope text-2xl text-pink-500"></i>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

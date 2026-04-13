import React from 'react';

export default function CollabPage() {
  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">برنامج الشراكات 🤝</h1>
          <p className="text-slate-400 text-sm">إذا كنت صانع محتوى وترغب في التعاون معنا، فنحن نرحب بك!</p>
        </div>
        <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center border border-white/5">
           <i className="fas fa-handshake text-blue-500 text-xl"></i>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-[#121214] border border-blue-500/10 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <i className="fas fa-bullhorn text-4xl text-blue-400"></i>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">انضم لشبكة المؤثرين</h2>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
          هل تملك قاعدة جماهيرية على يوتيوب أو تيك توك؟ يمكنك الترويج لمنصتنا مقابل الحصول على حسابات VIP وصلاحيات لرفع وصول محتواك مجاناً وبلا حدود. تواصل مع مدير العلاقات لبدء الشراكة.
        </p>
        
        <a 
          href="https://t.me/grodd_labsBot" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          <i className="fab fa-telegram text-xl"></i> تواصل عبر التليجرام
        </a>
      </div>
      
      {/* Metrics of Collab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
         <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 text-center">
            <h3 className="text-3xl font-black text-white mb-1">+50</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">شريك حالي</p>
         </div>
         <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 text-center">
            <h3 className="text-3xl font-black text-white mb-1">VIP</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">صلاحيات مطلقة</p>
         </div>
         <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 text-center">
            <h3 className="text-3xl font-black text-white mb-1">24/7</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">دعم فني خاص</p>
         </div>
      </div>
    </div>
  );
}

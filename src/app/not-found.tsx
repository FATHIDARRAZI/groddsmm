import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] p-6 text-center relative overflow-hidden">
      {/* Background Orbs (Reused from global layout logic) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="glow-orb pink opacity-40"></div>
        <div className="glow-orb purple opacity-40"></div>
      </div>

      <div className="relative z-10 animate-fade-in flex flex-col items-center">
        {/* Animated 404 Text */}
        <div className="relative inline-block mb-4">
          <h1 className="text-[10rem] md:text-[16rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 select-none animate-float leading-none">
            404
          </h1>
          {/* Subtle glow behind the text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[100px] bg-pink-500/10 rounded-full -z-10 animate-pulse"></div>
        </div>

        {/* Content Card */}
        <div className="max-w-xl mx-auto backdrop-blur-3xl bg-[#121827]/60 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-[0_25px_80px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          {/* Animated decorative element */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/5 blur-[60px] pointer-events-none group-hover:bg-pink-500/10 transition-all duration-1000"></div>
          
          <div className="flex flex-col items-center gap-4 mb-8">
             <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-2">
                <i className="fas fa-search-location text-3xl text-pink-500 animate-pulse"></i>
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-white dir-rtl">الصفحة غير موجودة</h2>
             <span className="text-slate-500 font-mono tracking-widest text-sm uppercase">خطأ في التوجيه</span>
          </div>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-[350px] mx-auto">
            يبدو أنك وصلت إلى وجهة غير معروفة. <br />
            عذراً، الرابط الذي تحاول الوصول إليه غير متاح حالياً أو تم حذفه من النظام.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link 
              href="/"
              className="px-10 py-5 bg-gradient-to-r from-[#FF8577] to-[#ec4899] text-white rounded-2xl font-bold shadow-[0_10px_40px_rgba(236,72,153,0.3)] transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-3 relative z-10"
            >
              <i className="fas fa-home"></i> العودة للرئيسية
            </Link>
            <Link 
              href="/dashboard"
              className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-2xl font-bold transition-all hover:scale-[1.03] active:scale-[0.98] relative z-10"
            >
              لوحة التحكم
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-12 text-slate-500 text-sm flex items-center gap-2">
           <i className="fas fa-headset text-pink-500/50"></i>
           <span>هل تحتاج للمساعدة؟</span>
           <Link href="/contact" className="text-white hover:text-pink-500 underline underline-offset-4 transition-colors font-bold">اتصل بنا</Link>
        </div>
      </div>
    </div>
  );
}

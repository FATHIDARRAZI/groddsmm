'use client';

import React from 'react';
import Image from 'next/image';

export default function StorePage() {
  const packages = [
    { 
      points: 30000, 
      price: '$5', 
      name: 'الباقة المبتدئة', 
      highlight: false, 
      icon: 'fa-rocket', 
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-500/20',
      features: ['تسليم فوري بعد الدفع', 'آمن على الخوارزميات', 'دعم فني خلال 24 ساعة'],
      conversions: { likes: '30K إعجاب', views: '3M مشاهدة' }
    },
    { 
      points: 150000, 
      price: '$20', 
      name: 'باقة المحترفين', 
      highlight: true, 
      icon: 'fa-fire', 
      color: 'from-[#FF8577] to-pink-500',
      shadow: 'shadow-pink-500/30',
      features: ['تسليم فوري (أولوية قصوى)', 'حماية متقدمة للحسابات', 'تعويض النقص (Non-Drop)', 'دعم فني VIP فوري'],
      conversions: { likes: '150K إعجاب', views: '15M مشاهدة' }
    },
    { 
      points: 450000, 
      price: '$50', 
      name: 'باقة الوكالات', 
      highlight: false, 
      icon: 'fa-crown', 
      color: 'from-purple-500 to-indigo-500',
      shadow: 'shadow-purple-500/20',
      features: ['تقارير حملات مفصلة', 'آمن على الخوارزميات 100%', 'تعويض النقص الدائم', 'مدير حساب شخصي'],
      conversions: { likes: '450K إعجاب', views: '45M مشاهدة' }
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-fade-in relative z-10">
      
      {/* Cinematic Header */}
      <div className="relative w-full rounded-[3rem] overflow-hidden bg-[#0A0D14] border border-white/5 shadow-2xl mb-16 flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#FF8577]/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(236,72,153,0.2)]">
          <i className="fas fa-coins text-4xl text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"></i>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white mb-6 leading-tight">
          ارتقِ بحضورك الرقمي<br className="hidden md:block"/> إلى المستوى التالي
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          اشحن رصيدك الآن وابدأ في إطلاق حملاتك الترويجية الاحترافية. خدمات موثوقة، آمنة تماماً على خوارزميات المنصات، وبدون استخدام أي برمجيات خبيثة.
        </p>
      </div>

      {/* Pricing Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative">
        {packages.map((pkg, idx) => (
          <div 
            key={idx} 
            className={`relative rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 group ${
              pkg.highlight 
                ? 'bg-[#16161A] border-2 border-pink-500/50 shadow-[0_20px_50px_rgba(236,72,153,0.15)] md:-mt-8 md:mb-8' 
                : 'bg-[#121214]/80 border border-white/5 hover:border-white/20'
            }`}
          >
             {/* Highlight Glow Effect */}
             {pkg.highlight && (
               <>
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
                 <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-500 pointer-events-none"></div>
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-[#FF8577] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg tracking-widest uppercase">
                   الأكثر مبيعاً 🌟
                 </div>
               </>
             )}
             
             {/* Package Header */}
             <div className="flex items-center gap-4 mb-8 relative z-10">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${pkg.color} bg-opacity-10 border border-white/10 ${pkg.shadow}`}>
                 <i className={`fas ${pkg.icon} text-2xl text-white drop-shadow-md`}></i>
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                 <p className="text-slate-500 text-sm font-medium">دفعة لمرة واحدة</p>
               </div>
             </div>
             
             {/* Price & Points */}
             <div className="mb-8 relative z-10">
               <div className="flex items-baseline gap-2 mb-2">
                 <span className="text-5xl font-black text-white">{pkg.price}</span>
                 <span className="text-slate-400 font-bold">USD</span>
               </div>
               <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl mb-4">
                 <i className="fas fa-coins text-yellow-500"></i>
                 <span className="text-white font-black text-lg">{pkg.points.toLocaleString()} نقطة</span>
               </div>
               
               {/* Conversions Info */}
               <div className="flex items-center gap-3 text-xs font-bold">
                 <div className="flex items-center gap-1.5 text-pink-400 bg-pink-500/10 px-2 py-1.5 rounded-lg border border-pink-500/20 shadow-inner">
                   <i className="fas fa-heart"></i> {pkg.conversions.likes}
                 </div>
                 <span className="text-slate-600 font-black text-[10px]">أو</span>
                 <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20 shadow-inner">
                   <i className="fas fa-eye"></i> {pkg.conversions.views}
                 </div>
               </div>
             </div>
             
             {/* Features List */}
             <div className="flex-1 flex flex-col gap-4 mb-10 relative z-10">
               {pkg.features.map((feature, fIdx) => (
                 <div key={fIdx} className="flex items-start gap-3">
                   <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${pkg.highlight ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-slate-400'}`}>
                     <i className="fas fa-check text-[10px]"></i>
                   </div>
                   <span className="text-slate-300 text-sm font-medium leading-relaxed">{feature}</span>
                 </div>
               ))}
             </div>
             
             {/* CTA Button */}
             <a 
               href="https://www.instagram.com/grodd_media/" 
               target="_blank" 
               rel="noreferrer"
               className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all relative z-10 overflow-hidden group/btn ${
                 pkg.highlight 
                   ? 'bg-gradient-to-r from-pink-500 to-[#FF8577] text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]' 
                   : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
               }`}
             >
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                <i className="fab fa-instagram text-xl"></i> شراء الباقة
             </a>
          </div>
        ))}
      </div>

      {/* Trust & Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="bg-[#121827]/50 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0 border border-green-500/20">
            <i className="fas fa-shield-alt text-green-500 text-xl"></i>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">أمان الخوارزميات 100%</h4>
            <p className="text-slate-400 text-xs leading-relaxed">جميع الحملات تتم بشكل تدريجي وعضوي لتتوافق تماماً مع سياسات الذكاء الاصطناعي لمنصات التواصل الاجتماعي.</p>
          </div>
        </div>
        <div className="bg-[#121827]/50 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
            <i className="fas fa-lock text-blue-500 text-xl"></i>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">لا نطلب كلمات المرور</h4>
            <p className="text-slate-400 text-xs leading-relaxed">نحن نحترم خصوصيتك. خدماتنا لا تتطلب أي صلاحيات دخول أو كلمات مرور لحساباتك الشخصية أو التجارية.</p>
          </div>
        </div>
        <div className="bg-[#121827]/50 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/20">
            <i className="fas fa-headset text-purple-400 text-xl"></i>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">دعم فني مخصص</h4>
            <p className="text-slate-400 text-xs leading-relaxed">فريقنا متواجد للرد على استفساراتك ومتابعة حملاتك بشكل شخصي لضمان تحقيق أفضل النتائج الممكنة.</p>
          </div>
        </div>
      </div>

      {/* Manual Purchase Flow Instructions */}
      <div className="relative bg-gradient-to-tr from-[#121214] to-[#1C1C1E] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-pink-500/5 to-transparent pointer-events-none"></div>
        
        <div className="p-10 md:p-16 flex-1 flex flex-col justify-center relative z-10">
           <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 px-4 py-2 rounded-full text-pink-400 text-xs font-bold w-fit mb-6">
             <i className="fas fa-info-circle"></i> آلية الدفع والشحن
           </div>
           <h2 className="text-2xl md:text-4xl font-black text-white mb-6">كيفية إتمام عملية الشراء؟</h2>
           <div className="space-y-6">
             <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">1</div>
               <p className="text-slate-300 font-medium pt-1">اختر الباقة المناسبة لاحتياجاتك التسويقية من القائمة أعلاه.</p>
             </div>
             <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">2</div>
               <p className="text-slate-300 font-medium pt-1">تواصل معنا عبر رسائل الإنستجرام على الحساب الرسمي <strong className="text-pink-400">@grodd_media</strong>.</p>
             </div>
             <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-[#FF8577]/20 border border-[#FF8577]/30 flex items-center justify-center text-[#FF8577] font-bold shrink-0 shadow-[0_0_15px_rgba(255,133,119,0.3)]">3</div>
               <p className="text-white font-bold pt-1">قم بتحويل المبلغ وسنقوم بشحن النقاط في حسابك فوراً وبشكل يدوي وآمن!</p>
             </div>
           </div>
        </div>
        
        <div className="w-full md:w-[400px] bg-[#0A0D14] flex flex-col items-center justify-center p-10 md:p-16 border-t md:border-t-0 md:border-r border-white/5 relative z-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] p-0.5 flex items-center justify-center shadow-[0_0_30px_rgba(225,48,108,0.4)] mb-6 overflow-hidden">
            <div className="w-full h-full bg-[#0A0D14] rounded-full overflow-hidden flex items-center justify-center">
              <img src="/grodd_instagram_profile.jpg" alt="Grodd Media IG Profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">@grodd_media</h3>
          <p className="text-slate-500 text-sm font-bold mb-8">الحساب الرسمي والوحيد</p>
          <a 
            href="https://www.instagram.com/grodd_media/" 
            target="_blank" 
            rel="noreferrer"
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-center hover:bg-slate-200 transition-colors shadow-lg"
          >
            إرسال رسالة الآن
          </a>
        </div>
      </div>

    </div>
  );
}

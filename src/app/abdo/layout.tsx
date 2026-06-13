'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/abdo/dashboard', icon: 'fa-tachometer-alt', label: 'لوحة القيادة' },
    { href: '/abdo/users', icon: 'fa-users', label: 'إدارة المستخدمين' },
    { href: '/abdo/orders', icon: 'fa-shopping-basket', label: 'جميع الطلبات' },
    { href: '/abdo/coupons', icon: 'fa-ticket-alt', label: 'الكوبونات' },
  ];

  useEffect(() => {
    const supabase = createSupabaseClient();
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col md:flex-row text-slate-200 font-cairo overflow-x-hidden">
      <Toaster 
        position="bottom-left" 
        toastOptions={{ 
          style: { background: '#121827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
        }} 
      />
      {/* Admin Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-72 bg-[#0B0F19] border-r border-white/5 flex-col shrink-0 shadow-2xl relative z-50">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
             <i className="fas fa-user-shield text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">Admin Center</h1>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">
           {navLinks.map((link) => {
             const isActive = pathname === link.href;
             return (
               <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative group ${
                  isActive 
                    ? 'bg-red-600/10 text-white border border-red-600/20 shadow-lg' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
               >
                 <i className={`fas ${link.icon} w-5 text-center transition-transform group-hover:scale-110 ${isActive ? 'text-red-500' : ''}`}></i>
                 {link.label}
                 {isActive && <span className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></span>}
               </Link>
             );
           })}
        </nav>

        <div className="p-6 border-t border-white/5">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
           >
             <i className="fas fa-sign-out-alt w-5 text-center"></i>
             تسجيل الخروج
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-[100] flex items-center justify-around px-4 shadow-2xl overflow-hidden">
         {navLinks.map((link) => {
           const isActive = pathname === link.href;
           return (
             <Link 
               key={link.href} 
               href={link.href}
               className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-red-500' : 'text-slate-500'}`}
             >
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-red-600/10 text-red-500 scale-110' : ''}`}>
                 <i className={`fas ${link.icon} text-lg`}></i>
               </div>
               <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                 {link.label.split(' ')[0]}
               </span>
               {isActive && <span className="absolute bottom-[-4px] w-1 h-1 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></span>}
             </Link>
           );
         })}
         <button 
           onClick={handleLogout}
           className="flex flex-col items-center gap-1 text-slate-500"
         >
           <div className="w-10 h-10 rounded-xl flex items-center justify-center">
             <i className="fas fa-power-off text-lg"></i>
           </div>
           <span className="text-[9px] font-black uppercase opacity-0">خروج</span>
         </button>
      </nav>

      {/* Admin Main View */}
      <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 relative overflow-x-hidden overflow-y-auto custom-scrollbar">
         {/* Top Info Bar */}
         <div className="flex items-center justify-between mb-10">
            <div>
               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">System Status</p>
               <h2 className="text-white text-lg font-bold">وحدة التحكم</h2>
            </div>
            <div className="flex items-center gap-3">
               <Link href="/" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-slate-300 transition-all uppercase tracking-widest">
                  Site
               </Link>
               <button onClick={handleLogout} className="md:hidden w-10 h-10 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-power-off"></i>
               </button>
            </div>
         </div>

          <div className="relative z-10 w-full max-w-7xl">
             {children}
          </div>
       </main>
    </div>
  );
}

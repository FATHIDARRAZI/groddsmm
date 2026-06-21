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
    { href: '/abdo/collab', icon: 'fa-handshake', label: 'طلبات الشراكة' },
    { href: '/abdo/services', icon: 'fa-server', label: 'إدارة الخدمات' },
    { href: '/abdo/announcements', icon: 'fa-bullhorn', label: 'الإعلانات' },
    { href: '/abdo/support', icon: 'fa-headset', label: 'الدعم الفني' },
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
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-200 font-cairo overflow-x-hidden">
      <Toaster 
        position="bottom-left" 
        toastOptions={{ 
          style: { background: '#121827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
        }} 
      />
      {/* Admin Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-72 bg-slate-900 border-r border-slate-800 flex-col shrink-0 relative z-50">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
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
                className={`flex items-center gap-4 px-5 py-4 font-bold transition-all relative group ${
                  isActive 
                    ? 'bg-slate-800 text-white border-l-4 border-blue-500' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
                }`}
               >
                 <i className={`fas ${link.icon} w-5 text-center transition-transform group-hover:scale-110 ${isActive ? 'text-blue-500' : ''}`}></i>
                 {link.label}
               </Link>
             );
           })}
        </nav>

        <div className="p-6 border-t border-slate-800">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-4 px-5 py-4 rounded-lg font-bold text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
           >
             <i className="fas fa-sign-out-alt w-5 text-center"></i>
             تسجيل الخروج
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 z-[100] flex items-center justify-around px-2">
         {navLinks.map((link) => {
           const isActive = pathname === link.href;
           return (
             <Link 
               key={link.href} 
               href={link.href}
               className={`flex flex-col items-center gap-1 transition-all p-2 ${isActive ? 'text-blue-500' : 'text-slate-500'}`}
             >
               <i className={`fas ${link.icon} text-lg`}></i>
               <span className="text-[10px] font-bold">
                 {link.label.split(' ')[0]}
               </span>
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
      <main className="flex-1 p-6 md:p-8 relative overflow-x-hidden overflow-y-auto custom-scrollbar">
         {/* Top Info Bar */}
         <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div>
               <p className="text-xs font-bold text-slate-400 mb-1">System Overview</p>
               <h2 className="text-white text-2xl font-bold">وحدة التحكم</h2>
            </div>
            <div className="flex items-center gap-3">
               <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all">
                  Site
               </Link>
               <button onClick={handleLogout} className="md:hidden w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center">
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

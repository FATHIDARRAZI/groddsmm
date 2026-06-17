'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import DashboardAdModal from '@/components/DashboardAdModal';
import SafeAdSlot from '@/components/SafeAdSlot';
import { createSupabaseClient } from '@/lib/supabase';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  iconColor?: string;
  exact?: boolean;
  isSeparator?: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('مستخدم جديد');
  const [points, setPoints] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [removeAds, setRemoveAds] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  useEffect(() => {
    const supabase = createSupabaseClient();
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || 'مستخدم جديد');
        // Fetch balance and ad status from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('points_balance, is_admin, remove_ads')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setPoints(profile.points_balance);
          setIsAdmin(!!profile.is_admin);
          setRemoveAds(!!profile.remove_ads);
        }
      } else {
        router.push('/auth/login');
      }
    }

    fetchUser();

    // Listen for manual balance updates from other components and tab focus
    window.addEventListener('pointsUpdated', fetchUser);
    window.addEventListener('focus', fetchUser);
    return () => {
      window.removeEventListener('pointsUpdated', fetchUser);
      window.removeEventListener('focus', fetchUser);
    };
  }, [router]);

  const desktopNavLinks: NavLink[] = [
    { href: '/dashboard', exact: true, icon: 'fa-chart-pie', label: 'أداة التحكم', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/orders', icon: 'fa-history', label: 'سجل الطلبات', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/store', icon: 'fa-shopping-cart', label: 'شراء نقاط', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/offerwall', icon: 'fa-tasks', label: 'المهام (Offerwall)', iconColor: 'text-green-500' },
    { href: '/dashboard/daily', icon: 'fa-calendar-check', label: 'المكافآت اليومية', iconColor: 'text-purple-500' },
    { href: '/dashboard/coupons', icon: 'fa-ticket-alt', label: 'كوبونات النقاط', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/collab', icon: 'fa-handshake', label: 'الشراكات كمنشئ محتوى', iconColor: 'text-blue-500' },
  ];

  const mobileNavLinks: NavLink[] = [
    { href: '/dashboard', exact: true, icon: 'fa-chart-pie', label: 'الرئيسية' },
    { href: '/dashboard/orders', icon: 'fa-history', label: 'الطلبات' },
    { href: '/dashboard/offerwall', icon: 'fa-tasks', label: 'مهام' },
    { href: '/dashboard/daily', icon: 'fa-calendar-check', label: 'يومي' },
    { href: '/dashboard/store', icon: 'fa-shopping-cart', label: 'المتجر' },
  ];

  return (
    <div className="flex w-full max-w-[1400px] mx-auto min-h-[85vh] mt-6 md:mt-12 bg-[#0B0F19] rounded-3xl border border-white/5 shadow-2xl dir-rtl mb-12">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#121214] border-l border-white/5 shrink-0 relative z-20 rounded-r-3xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#1C1C1E] to-[#2A2A2D] rounded-full border border-white/10 mb-4 flex items-center justify-center shadow-inner overflow-hidden">
             <Image src="/user-avatar-male-5.svg" alt="User Avatar" width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">مرحباً، {isClient ? userName : '...'}</h2>
          <Link href="/dashboard/store" className="bg-[#1C1C1E] px-4 py-1.5 rounded-full text-pink-500 text-xs font-bold border border-pink-500/20 flex items-center gap-2 hover:bg-pink-500/10 transition-colors cursor-pointer">
            <i className="fas fa-coins"></i> الرصيد: {isClient ? points.toLocaleString() : '0'} نقطة
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {desktopNavLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-[#1C1C1E] text-white border border-white/5 shadow-md' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                } ${link.isSeparator ? 'mt-4 pt-6 border-t border-t-white/5' : ''}`}
              >
                <i className={`fas ${link.icon} ${link.iconColor} w-5 text-center`}></i>
                {link.label}
              </Link>
            );
          })}
          
          {isAdmin && (
            <Link 
              href="/abdo/dashboard" 
              className="flex items-center gap-4 px-4 py-3 rounded-xl font-black transition-all text-red-500 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 mb-2"
            >
              <i className="fas fa-user-shield w-5 text-center"></i>
              لوحة الإدارة (ADMIN)
            </Link>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent mt-2 border-t border-t-white/5 pt-4"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            تسجيل الخروج
          </button>
        </nav>

        {/* Sidebar Sticky Ad Block */}
        {!removeAds && (
          <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50">
            <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-0 h-[250px] relative">
              <p className="absolute text-[10px] text-slate-600 font-bold top-1 tracking-widest">ADVERTISEMENT</p>
              <div className="absolute top-1 right-3 z-20">
                <Link href="/dashboard/remove-ads" className="text-[8px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات</Link>
              </div>
              <SafeAdSlot 
                src="/ad-300.html" 
                width="300" 
                height="250" 
                className="scale-[0.85] origin-center z-10 bg-transparent"
              />
            </div>
          </div>
        )}

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden bg-gradient-to-tl from-[#0B0F19] to-[#141416]">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#121214] border-b border-white/5 p-4 flex items-center justify-between sticky top-0 shadow-lg" style={{zIndex: 40}}>
          <div className="flex items-center gap-4">
             <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer touch-manipulation relative z-50">
               <i className="fas fa-bars text-lg pointer-events-none"></i>
             </button>
             <div className="w-10 h-10 bg-[#1C1C1E] rounded-full border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
               <img src="/user-avatar-male-5.svg" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          <Link href="/dashboard/store" className="bg-[#1C1C1E] px-4 py-1.5 rounded-full text-[#FF8577] text-xs font-bold border border-[#FF8577]/20 flex items-center gap-2 hover:bg-[#FF8577]/10 transition-colors cursor-pointer">
            <i className="fas fa-coins"></i> {isClient ? points.toLocaleString() : '0'} نقطة
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 w-full custom-scrollbar pb-24 md:pb-10">
           {children}

             {isClient && !removeAds && (
               <div key={pathname} className="w-full mt-12 bg-[#0B0F19]/50 rounded-2xl overflow-hidden border border-white/5 flex flex-col items-center justify-center relative shadow-inner mx-auto p-8">
                  <div className="w-full flex justify-between items-center mb-4">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">إعلان سبونسر</p>
                    <Link href="/dashboard/remove-ads" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
                  </div>
                  {/* Desktop Ad */}
                  <div className="hidden md:flex w-full justify-center">
                    <SafeAdSlot key={`${pathname}-desktop`} src="/ad-728.html" width="728" height="90" className="bg-transparent rounded-lg" />
                  </div>
 
                  {/* Mobile Ad */}
                  <div className="flex md:hidden w-full justify-center">
                    <SafeAdSlot key={`${pathname}-mobile`} src="/ad-300.html" width="300" height="250" className="bg-transparent rounded-lg" />
                  </div>
               </div>
             )}
        </main>
      </div>

      {/* Mobile Bottom Navigation anchored globally inside the main node */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#121214]/95 backdrop-blur-xl border-t border-white/10 z-[9999] flex justify-around items-center px-1 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         {mobileNavLinks.map((link) => {
           const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
           return (
             <Link 
               key={link.href} 
               href={link.href} 
               className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${isActive ? 'text-[#FF8577]' : 'text-slate-500 hover:text-slate-300'}`}
             >
               <i className={`fas ${link.icon} text-xl ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,133,119,0.5)]' : ''}`}></i>
               <span className="text-[9px] font-bold tracking-wider">{link.label}</span>
             </Link>
           );
         })}
         <button 
           type="button"
           onClick={handleLogout}
           className="flex flex-col items-center gap-1.5 p-2 transition-colors text-red-500 hover:text-red-400 cursor-pointer touch-manipulation relative z-[99999]"
         >
           <i className="fas fa-sign-out-alt text-xl pointer-events-none"></i>
           <span className="text-[9px] font-bold tracking-wider pointer-events-none">خروج</span>
         </button>
      </nav>

      {/* Mobile Sidebar Overlay (Hamburger Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 md:hidden" style={{zIndex: 999999}}>
          <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute right-0 top-0 h-full w-72 bg-[#121214] border-l border-white/5 flex flex-col shadow-2xl animate-fade-in dir-rtl z-10">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F19]/50">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-white">مرحباً، {isClient ? userName : '...'}</h2>
                <Link href="/dashboard/store" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#1C1C1E] px-3 py-1 rounded-full text-[#FF8577] text-[10px] font-bold border border-[#FF8577]/20 flex items-center gap-2 w-fit">
                   <i className="fas fa-coins"></i> الرصيد: {isClient ? points.toLocaleString() : '0'} نقطة
                </Link>
              </div>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors cursor-pointer touch-manipulation">
                 <i className="fas fa-times text-slate-400 pointer-events-none"></i>
              </button>
            </div>
            
            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
              {desktopNavLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive 
                        ? 'bg-[#1C1C1E] text-white border border-white/5 shadow-md' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    } ${link.isSeparator ? 'mt-4 pt-6 border-t border-t-white/5' : ''}`}
                  >
                    <i className={`fas ${link.icon} ${link.iconColor} w-5 text-center`}></i>
                    {link.label}
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent mt-2 border-t border-t-white/5 pt-4 w-full text-right"
              >
                <i className="fas fa-sign-out-alt w-5 text-center pointer-events-none"></i>
                تسجيل الخروج
              </button>
            </nav>
            
            {/* Mobile Sidebar Ad */}
             {!removeAds && (
               <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50 flex flex-col items-center justify-center pb-safe overflow-hidden w-full">
                  <div className="w-full flex justify-between items-center mb-2 px-4">
                    <Link href="/dashboard/remove-ads" onClick={() => setIsMobileMenuOpen(false)} className="text-[9px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
                  </div>
                  <div className="w-full max-w-[250px] overflow-hidden flex justify-center items-center">
                    <SafeAdSlot src="/ad-300.html" width="300" height="250" className="scale-[0.8] origin-center rounded-xl" />
                  </div>
               </div>
             )}

          </aside>
        </div>
      )}

      <DashboardAdModal removeAds={removeAds} />
    </div>
  );
}

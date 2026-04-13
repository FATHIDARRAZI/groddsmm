'use client';

import React from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardAdModal from '@/components/DashboardAdModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const desktopNavLinks = [
    { href: '/dashboard', exact: true, icon: 'fa-chart-pie', label: 'أداة التحكم', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/store', icon: 'fa-shopping-cart', label: 'شراء نقاط', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/earn', icon: 'fa-link', label: 'تخطي الروابط', iconColor: 'text-yellow-500' },
    { href: '/dashboard/gifts', icon: 'fa-gift', label: 'صندوق الهدايا', iconColor: 'text-purple-500' },
    { href: '/dashboard/coupons', icon: 'fa-ticket-alt', label: 'كوبونات النقاط', iconColor: 'text-[#FF8577]' },
    { href: '/dashboard/collab', icon: 'fa-handshake', label: 'الشراكات كمنشئ محتوى', iconColor: 'text-blue-500' },
    { href: '/dashboard/history', icon: 'fa-history', label: 'سجل الطلبات', iconColor: 'text-green-500', isSeparator: true },
  ];

  const mobileNavLinks = [
    { href: '/dashboard', exact: true, icon: 'fa-chart-pie', label: 'الرئيسية' },
    { href: '/dashboard/store', icon: 'fa-shopping-cart', label: 'المتجر' },
    { href: '/dashboard/earn', icon: 'fa-link', label: 'الروابط' },
    { href: '/dashboard/gifts', icon: 'fa-gift', label: 'هدايا' },
    { href: '/dashboard/coupons', icon: 'fa-ticket-alt', label: 'كوبونات' },
    { href: '/dashboard/history', icon: 'fa-history', label: 'الطلبات' },
  ];

  return (
    <div className="flex w-full max-w-[1400px] mx-auto min-h-[85vh] mt-6 md:mt-12 bg-[#0B0F19] rounded-3xl border border-white/5 shadow-2xl overflow-hidden dir-rtl mb-12 relative z-10">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#121214] border-l border-white/5 shrink-0 relative z-20">
        <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#1C1C1E] to-[#2A2A2D] rounded-full border border-white/10 mb-4 flex items-center justify-center shadow-inner overflow-hidden">
             <i className="fas fa-user-astronaut text-3xl text-[#FF8577]"></i>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">مرحباً، مستخدم جديد</h2>
          <Link href="/dashboard/store" className="bg-[#1C1C1E] px-4 py-1.5 rounded-full text-[#FF8577] text-xs font-bold border border-[#FF8577]/20 flex items-center gap-2 hover:bg-[#FF8577]/10 transition-colors cursor-pointer">
            <i className="fas fa-coins"></i> الرصيد: 0 نقطة
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
        </nav>

        {/* Sidebar Sticky Ad Block */}
        <div className="p-4 border-t border-white/5 bg-[#0B0F19]/50">
          <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center p-0 h-[250px] relative">
            <p className="absolute text-[10px] text-slate-600 font-bold top-1">ADVERTISEMENT</p>
            <iframe src="/ad-300.html" width="300" height="250" frameBorder="0" scrolling="no" className="scale-[0.85] origin-center z-10"></iframe>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden bg-gradient-to-tl from-[#0B0F19] to-[#141416]">
        {/* Mobile Header Header */}
        <header className="md:hidden bg-[#121214] border-b border-white/5 p-4 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1C1C1E] rounded-full border border-white/10 flex items-center justify-center shadow-inner">
               <i className="fas fa-user-astronaut text-sm text-[#FF8577]"></i>
            </div>
          </div>
          <Link href="/dashboard/store" className="bg-[#1C1C1E] px-4 py-1.5 rounded-full text-[#FF8577] text-xs font-bold border border-[#FF8577]/20 flex items-center gap-2 hover:bg-[#FF8577]/10 transition-colors cursor-pointer">
            <i className="fas fa-coins"></i> 0 نقطة
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-10 relative z-10 w-full custom-scrollbar pb-24 md:pb-10">
           {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#121214]/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center px-1 py-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
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
        </nav>
      </div>
      <DashboardAdModal />
    </div>
  );
}

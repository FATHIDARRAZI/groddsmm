'use client';

import { useEffect, useState } from 'react';

export default function AdBlockDetector() {
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    // Bypass detection on localhost for testing
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return;
    }

    // 1. DOM Element Bait
    const fakeAd = document.createElement('div');
    fakeAd.className = 'ad-placement adsense ad-banner pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
    fakeAd.id = 'adsbygoogle';
    fakeAd.innerHTML = '&nbsp;';
    fakeAd.style.width = '1px';
    fakeAd.style.height = '1px';
    fakeAd.style.position = 'absolute';
    fakeAd.style.top = '-999px';
    fakeAd.style.left = '-999px';
    document.body.appendChild(fakeAd);

    const checkDomAdBlocker = () => {
      if (!document.body.contains(fakeAd)) {
        setIsAdBlocked(true);
        document.body.style.overflow = 'hidden';
        return;
      }
      
      const styles = window.getComputedStyle(fakeAd);
      if (
        fakeAd.offsetHeight === 0 || 
        fakeAd.clientHeight === 0 || 
        styles.display === 'none' ||
        styles.visibility === 'hidden'
      ) {
        setIsAdBlocked(true);
        document.body.style.overflow = 'hidden';
      }
      
      if (document.body.contains(fakeAd)) {
        document.body.removeChild(fakeAd);
      }
    };

    setTimeout(checkDomAdBlocker, 300);

    // 2. Network Request Bait (Highly reliable against uBlock Origin, AdGuard, Brave Shields)
    const checkNetworkAdBlocker = async () => {
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch (err) {
        // If the request fails entirely, it's almost certainly blocked by an adblocker
        setIsAdBlocked(true);
        document.body.style.overflow = 'hidden';
      }
    };
    checkNetworkAdBlocker();

    return () => {
      if (document.body.contains(fakeAd)) {
        document.body.removeChild(fakeAd);
      }
    };
  }, []);

  if (!isAdBlocked) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-3xl">
      <div className="bg-[#09090b] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_80px_rgba(239,68,68,0.15)] animate-fade-in relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
        
        <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <i className="fas fa-shield-virus text-6xl text-red-500 hover:scale-110 transition-transform duration-300"></i>
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-4 dir-rtl">تنبيه: مانع الإعلانات مفعل</h2>
        
        <p className="text-slate-400 text-lg leading-relaxed dir-rtl mb-8">
          نحن نقدم منصة إطلاق الحملات التسويقية <strong className="text-red-400">مجاناً للجميع</strong> بفضل الإعلانات المدمجة. يرجى إيقاف مانع الإعلانات (AdBlock) أو إضافة موقعنا للقائمة البيضاء للاستمرار.
        </p>
        
        <button 
          onClick={() => window.location.reload()} 
          className="w-full py-4 rounded-xl font-bold text-white text-lg bg-red-600 hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          لقد قمت بإيقافه - تحديث الصفحة <i className="fas fa-sync ml-2"></i>
        </button>
      </div>
    </div>
  );
}

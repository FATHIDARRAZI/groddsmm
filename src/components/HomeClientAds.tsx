'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SafeAdSlot from '@/components/SafeAdSlot';
import { checkRemoveAdsCached } from '@/lib/adUtils';

export default function HomeClientAds() {
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const [showIdleAd, setShowIdleAd] = useState(false);
  const [hasSeenIdleAd, setHasSeenIdleAd] = useState(false);
  const [removeAds, setRemoveAds] = useState(false);

  useEffect(() => {
    async function checkRemoveAds() {
      const isRemoved = await checkRemoveAdsCached();
      if (isRemoved) setRemoveAds(true);
    }
    checkRemoveAds();
  }, []);

  useEffect(() => {
    if (hasSeenIdleAd || showIdleAd || removeAds) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowIdleAd(true);
        setHasSeenIdleAd(true);
      }, 15000);
    };

    resetTimer();

    const events = ['mousedown', 'keydown', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer, true));

    return () => {
      clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, resetTimer, true));
    };
  }, [hasSeenIdleAd, showIdleAd, removeAds]);

  const [showRemoveAdsLink, setShowRemoveAdsLink] = useState(false);

  useEffect(() => {
    if (showIdleAd) {
      const t = setTimeout(() => setShowRemoveAdsLink(true), 4000);
      return () => clearTimeout(t);
    } else {
      setShowRemoveAdsLink(false);
    }
  }, [showIdleAd]);

  if (removeAds) return null;

  return (
    <>
      <div 
        className={`fixed left-0 right-0 z-50 flex flex-col items-center transition-all duration-300 ease-in-out ${
          isStickyVisible ? 'bottom-0' : '-bottom-[80px]'
        }`}
      >
        <div className="flex items-center">
          <button 
            onClick={() => setIsStickyVisible(!isStickyVisible)}
            className="w-12 h-6 bg-white rounded-t-lg flex items-center justify-center shadow-[0_-4px_10px_rgba(0,0,0,0.15)] hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 border-b-0"
          >
            <i className={`fas fa-chevron-${isStickyVisible ? 'down' : 'up'} text-gray-500 text-xs`}></i>
          </button>
          <Link href="/dashboard/remove-ads" className="bg-purple-600 text-white text-[8px] font-bold px-3 py-1 rounded-t-lg shadow-md hover:bg-purple-500 transition-colors flex items-center gap-1">
            <i className="fas fa-crown text-amber-300"></i> إزالة الإعلانات؟
          </Link>
        </div>
        <div className="w-full bg-[#121827]/90 backdrop-blur-md border-t border-white/10 p-3 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.3)] min-h-[80px]">
          <div className="hidden md:flex w-full items-center justify-center">
            <SafeAdSlot src="/ad-468.html" width="468" height="60" loading="lazy" />
          </div>
          <div className="flex md:hidden w-full items-center justify-center">
            <SafeAdSlot src="/ad-320.html" width="320" height="50" loading="lazy" />
          </div>
        </div>
      </div>

      {showIdleAd && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-xl transition-all block"></div>
          <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center animate-fade-in bg-[#121827] border border-white/10 rounded-2xl shadow-2xl p-6">
            <button 
              onClick={() => setShowIdleAd(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="w-full flex justify-between items-center mb-4 mt-2 h-8">
              <h3 className="text-xl font-bold text-white">إعلان مدعوم</h3>
              <div className={`transition-all duration-1000 ease-out flex items-center ${showRemoveAdsLink ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                <Link href="/dashboard/remove-ads" onClick={() => setShowIdleAd(false)} className="text-xs text-white font-bold hover:scale-105 transition-transform flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-white/20">
                  <i className="fas fa-crown text-amber-300"></i>
                  إزالة الإعلانات؟
                </Link>
              </div>
            </div>
            <p className="text-slate-400 text-sm text-center w-full mb-6">شكراً لانتظارك! نحن نعتمد على الإعلانات لإبقاء هذه الخدمة مجانية.</p>
            
            <div className="w-full h-[250px] bg-white/5 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
              <SafeAdSlot src="/ad-300.html" width="300" height="250" loading="lazy" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function HomeTopAd() {
  const [removeAds, setRemoveAds] = useState(false);
  useEffect(() => {
    async function checkRemoveAds() {
      const isRemoved = await checkRemoveAdsCached();
      if (isRemoved) setRemoveAds(true);
    }
    checkRemoveAds();
  }, []);

  if (removeAds) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#121827]/40 p-2 shadow-inner min-h-[106px] max-w-4xl mx-auto relative animate-fade-in">
      <div className="w-full flex justify-end px-2 mb-1">
        <Link href="/dashboard/remove-ads" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
      </div>
      <div className="hidden md:flex w-full justify-center">
        <SafeAdSlot src="/ad-728.html" width="728" height="90" loading="lazy" className="bg-transparent rounded-lg" />
      </div>
      <div className="flex md:hidden w-full justify-center min-h-[250px]">
        <SafeAdSlot src="/ad-300.html" width="300" height="250" loading="lazy" className="bg-transparent rounded-lg" />
      </div>
    </div>
  );
}

export function HomeNativeAd() {
  const [removeAds, setRemoveAds] = useState(false);
  useEffect(() => {
    async function checkRemoveAds() {
      const isRemoved = await checkRemoveAdsCached();
      if (isRemoved) setRemoveAds(true);
    }
    checkRemoveAds();
  }, []);

  if (removeAds) return null;

  return (
    <div className="w-full max-w-5xl mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-inner overflow-hidden relative animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-400 font-bold text-xs font-mono uppercase tracking-widest opacity-50">Sponsored Advertisement</h3>
        <Link href="/dashboard/remove-ads" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
      </div>
      <SafeAdSlot 
         src="/ad-native.html" 
         width="100%" 
         height="220" 
         loading="lazy"
         className="bg-transparent rounded-lg" 
      />
    </div>
  );
}

export function HomeMiddleAd() {
  const [removeAds, setRemoveAds] = useState(false);
  useEffect(() => {
    async function checkRemoveAds() {
      const isRemoved = await checkRemoveAdsCached();
      if (isRemoved) setRemoveAds(true);
    }
    checkRemoveAds();
  }, []);

  if (removeAds) return null;

  return (
    <div className="w-full max-w-4xl mt-8 flex flex-col items-center p-4 sm:p-8 bg-[#0B0F19]/50 rounded-2xl border border-white/5 shadow-inner overflow-hidden relative animate-fade-in">
      <div className="w-full flex justify-between items-center mb-4">
        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">إعلان سبونسر</p>
        <Link href="/dashboard/remove-ads" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold hover:underline">إزالة الإعلانات؟</Link>
      </div>
      <div className="hidden md:flex w-full justify-center">
        <SafeAdSlot src="/ad-728.html" width="728" height="90" loading="lazy" className="bg-transparent rounded-lg" />
      </div>
      <div className="flex md:hidden w-full justify-center min-h-[250px] overflow-hidden">
        <SafeAdSlot src="/ad-300.html" width="300" height="250" loading="lazy" className="bg-transparent rounded-lg" />
      </div>
    </div>
  );
}

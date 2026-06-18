'use client';

import React, { useState, useEffect } from 'react';

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout;

    const handleLoad = () => {
      clearTimeout(fallbackTimer);
      // Add a slight delay to ensure smooth rendering
      setTimeout(() => {
        setIsLoading(false);
        // Wait for the opacity transition to complete before removing from DOM
        setTimeout(() => setShouldRender(false), 500);
      }, 300);
    };

    // Maximum time to show splash screen (2.5 seconds)
    // This prevents the splash screen from getting stuck if ads/images take too long to load
    fallbackTimer = setTimeout(handleLoad, 2500);

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none transition-all duration-500 ${isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-lg px-4 py-2 rounded-full flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-300">جاري التحميل...</span>
      </div>
    </div>
  );
}

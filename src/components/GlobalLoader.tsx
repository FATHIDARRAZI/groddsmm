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
      className={`fixed inset-0 z-[99999] bg-[#05070A] flex flex-col items-center justify-center transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="relative animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        {/* Replace Image with a standard img tag to avoid needing the import */}
        <img 
          src="/GRODD_LOGO.png" 
          alt="Grodd Logo" 
          width="240" 
          height="60" 
          className="object-contain"
        />
      </div>
      <div className="mt-10 flex gap-3">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

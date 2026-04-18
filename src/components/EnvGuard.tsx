'use client';
import React, { useEffect, useState } from 'react';

export default function EnvGuard({ children }: { children: React.ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Diagnostic logging
    console.log('[EnvGuard] Checking configuration...');
    console.log('[EnvGuard] URL present:', !!url, url ? `(${url.substring(0, 10)}...)` : '');
    console.log('[EnvGuard] Anon Key present:', !!anonKey, anonKey ? `(Length: ${anonKey.length})` : '');

    if (!url || !anonKey || url === '' || anonKey === '') {
      console.warn('[EnvGuard] Configuration missing! Shielding application.');
      setIsConfigured(false);
    }
  }, []);

  return (
    <>
      {!isConfigured && (
        <div className="fixed bottom-4 left-4 z-[9999] animate-fade-in pointer-events-none">
          <div className="bg-[#05070A]/80 backdrop-blur-xl border border-red-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-xs pointer-events-auto">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <i className="fas fa-exclamation-triangle text-red-500 text-sm animate-pulse"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-0.5">Config Alert</p>
              <p className="text-[11px] text-slate-300 font-bold leading-tight">
                Supabase keys missing or invalid. Check your <code className="text-white">.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}


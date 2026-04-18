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

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#05070A] flex items-center justify-center p-6 font-cairo">
        <div className="max-w-xl w-full glass-panel p-8 sm:p-12 rounded-[2.5rem] border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.1)] relative overflow-hidden">
          
          {/* Diagnostic Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl animate-pulse"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">System Configuration Alert</h2>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mt-1">Status: Offline / Desync</p>
            </div>
          </div>

          <div className="space-y-6 text-slate-300">
            <p className="font-bold leading-relaxed">
               تنبيه: لم يتم العثور على مفاتيح الاتصال بخادم <span className="text-white font-black">Supabase</span>. هذا يعني أن الموقع لا يمكنه الوصول إلى قاعدة البيانات.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
               <h3 className="text-white font-black text-sm uppercase tracking-wider font-outfit">How to fix this:</h3>
               <ol className="text-xs space-y-3 list-decimal list-inside font-bold text-slate-400">
                  <li>Go to your <span className="text-white">Hosting Dashboard</span> (Vercel, GitHub, etc.)</li>
                  <li>Go to <span className="text-white">Settings</span> {"->"} <span className="text-white">Environment Variables</span></li>
                  <li>Apply the keys from your <span className="text-white">.env.local</span> file</li>
                  <li>Re-deploy your website</li>
               </ol>
            </div>

            <div className="pt-4">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center italic">
                  Note: This alert is only visible to you because the system is unconfigured.
               </p>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Success
    router.push('/dashboard');
  };

  return (
    <div className="w-full bg-[#121214]/60 backdrop-blur-2xl border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-fade-in z-30">
      
      {/* Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">Login Center</h1>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Access your command terminal</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 focus-within:text-[#FF8577] text-slate-400 transition-colors">
          <label className="text-sm sm:text-base font-bold px-2 tracking-wider">البريد الإلكتروني</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <i className="fas fa-envelope text-lg"></i>
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/5 rounded-2xl py-3.5 sm:py-4 pr-11 sm:pr-12 pl-4 text-white text-sm sm:text-base focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577]/50 transition-all dir-ltr text-left font-mono"
              placeholder="yourname@gamil.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 focus-within:text-[#FF8577] text-slate-400 transition-colors mt-2">
          <div className="flex justify-between items-center px-2">
            <label className="text-sm sm:text-base font-bold tracking-wider">كلمة المرور</label>
            <Link href="#" className="text-xs text-slate-500 hover:text-white transition-colors font-bold">نسيت كلمة المرور؟</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <i className="fas fa-lock text-lg"></i>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/5 rounded-2xl py-3.5 sm:py-4 pr-11 sm:pr-12 pl-4 text-white text-sm sm:text-base focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577]/50 transition-all dir-ltr text-left font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-white text-base sm:text-lg bg-gradient-to-r from-[#FF8577] to-[#FF6B6B] hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,133,119,0.3)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <i className="fas fa-circle-notch fa-spin"></i>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> دخول للوحة التحكم
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm sm:text-base font-bold text-slate-500">
        ليس لديك حساب؟{' '}
        <Link href="/auth/signup" className="text-[#FF8577] hover:underline underline-offset-4 font-black">
          إنشاء حساب جديد
        </Link>
      </div>
    </div>
  );
}

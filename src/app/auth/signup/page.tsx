'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || 'تعذر إنشاء الحساب');
        return;
      }

      // Success
      router.push('/dashboard');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="w-full bg-[#121214]/60 backdrop-blur-2xl border border-white/5 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
      
      {/* Decorative Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8577] to-transparent opacity-50"></div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">إنشاء حساب</h1>
        <p className="text-xs sm:text-sm text-slate-400">ابدأ رحلتك في إدارة حملاتك التسويقية</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-2 focus-within:text-[#FF8577] text-slate-400 transition-colors">
          <label className="text-sm sm:text-base font-bold px-2 tracking-wider">الاسم بالكامل</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <i className="fas fa-user text-lg"></i>
            </div>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/5 rounded-2xl py-3.5 sm:py-4 pr-11 sm:pr-12 pl-4 text-white text-sm sm:text-base focus:outline-none focus:border-[#FF8577]/50 focus:ring-1 focus:ring-[#FF8577]/50 transition-all"
              placeholder="محمد حمدي"
            />
          </div>
        </div>

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
              placeholder="admin@luminary.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 focus-within:text-[#FF8577] text-slate-400 transition-colors">
          <label className="text-sm sm:text-base font-bold px-2 tracking-wider">كلمة المرور</label>
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
          className="w-full mt-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-white text-base sm:text-lg bg-[#1C1C1E] border border-white/10 hover:border-[#FF8577]/50 hover:bg-[#FF8577]/10 hover:text-[#FF8577] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <i className="fas fa-circle-notch fa-spin"></i>
          ) : (
            <>
              <i className="fas fa-user-plus"></i> تسجيل الحساب
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm sm:text-base font-bold text-slate-500">
        لديك حساب بالفعل؟{' '}
        <Link href="/auth/login" className="text-[#FF8577] hover:underline underline-offset-4 font-black">
          تسجيل الدخول
        </Link>
      </div>

    </div>
  );
}

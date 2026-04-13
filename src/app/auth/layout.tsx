import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Ambient Visuals */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF8577]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Form Container */}
      <div className="w-full max-w-[400px] relative z-10 w-full mx-auto">
        {children}
      </div>

    </div>
  );
}

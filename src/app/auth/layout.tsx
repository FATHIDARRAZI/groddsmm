import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto pt-20 pb-12 sm:pt-0">
      {/* Ambient Visuals */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 to-transparent rounded-full pointer-events-none z-0 transform-gpu translate-z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 to-transparent rounded-full pointer-events-none z-0 transform-gpu translate-z-0"></div>
      
      {/* Form Container */}
      <div className="w-full max-w-[400px] relative z-20 w-full mx-auto">
        {children}
      </div>
    </div>
  );
}

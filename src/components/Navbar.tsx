'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-50 w-full border-b border-white/5 bg-[#121827]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <img src="/SMMGRODD.png" alt="Grodd SMM Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="flex items-center gap-2">
            <i className="fas fa-bolt text-yellow-500"></i> تفاعل حقيقي
          </span>
          <span className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-green-500"></i> آمن 100%
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
        </button>
      </div>

      {/* Mobile Dropdown Menu (Hidden on Desktop) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-3xl border-b border-white/10 p-6 flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:hidden animate-fade-in">
          
          <div className="flex flex-col gap-4 text-center">
            <a href="#" className="text-slate-300 font-bold hover:text-pink-500 transition-colors">الرئيسية</a>
            <a href="#" className="text-slate-300 font-bold hover:text-pink-500 transition-colors">الخدمات المجانية</a>
            <a href="#" className="text-slate-300 font-bold hover:text-pink-500 transition-colors">اتصل بنا</a>
          </div>

          <div className="flex justify-center gap-6 pt-4 border-t border-white/10">
             <a href="https://x.com/groddsmm" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-colors text-lg" rel="noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com/grodd_smm" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#E1306C] hover:text-white transition-colors text-lg" rel="noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://t.me/grodd_labsBot" target="_blank" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-[#0088cc] hover:text-white transition-colors text-lg" rel="noreferrer">
              <i className="fab fa-telegram"></i>
            </a>
          </div>

          {/* Small Mobile Ad Placeholder */}
          <div className="w-full flex justify-center mt-2 p-2 bg-[#121827] border border-white/5 rounded-xl shadow-inner">
             <iframe src="/ad-320.html" width="320" height="50" frameBorder="0" scrolling="no" className="mx-auto" />
          </div>
        </div>
      )}
    </nav>
  );
}

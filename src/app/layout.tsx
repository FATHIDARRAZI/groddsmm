import type { Metadata } from 'next';
import { Cairo, Outfit } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});
import Script from 'next/script';
import Image from 'next/image';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Navbar from '@/components/Navbar';
import AdBlockDetector from '@/components/AdBlockDetector';
import EnvGuard from '@/components/EnvGuard';
import GlobalLoader from '@/components/GlobalLoader';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.grodd-smm.online'),
  title: {
    default: 'Grodd Media | أرخص وأسرع لوحة SMM لزيادة المتابعين',
    template: '%s | Grodd Media'
  },
  description: 'أرخص سيرفر SMM وأفضل وكالة تسويق رقمي في الشرق الأوسط والمغرب. زيادة متابعين انستقرام حقيقيين، رشق تيك توك، لايكات ومشاهدات. نوفر خدمات B2B لتسريع النمو العضوي.',
  keywords: [
    'أرخص لوحة smm', 'لوحة smm', 'سيرفر بيع متابعين', 'زيادة متابعين انستقرام', 
    'رشق متابعين تيك توك', 'شراء متابعين', 'دعم حسابات تيك توك', 'ارخص سيرفر SMM',
    'smm panel arabic', 'grodd media', 'grodd smm', 'متابعين حقيقيين',
    'best smm panel morocco', 'وكالة تسويق رقمي', 'تسويق الكتروني'
  ],
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Grodd Labs' }],
  creator: 'Grodd Media',
  publisher: 'Grodd Media',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Grodd Media | أرخص وأسرع لوحة SMM',
    description: 'زيادة متابعين انستقرام وتيك توك بأرخص الأسعار. سيرفر بيع متابعين موثوق وسريع.',
    url: 'https://www.grodd-smm.online',
    siteName: 'Grodd Media SMM',
    images: [
      {
        url: 'https://www.grodd-smm.online/GRODD_LOGO.png',
        width: 1200,
        height: 630,
        alt: 'Grodd Media SMM Panel',
      },
    ],
    locale: 'ar_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grodd Media | أرخص لوحة SMM',
    description: 'أرخص وأسرع سيرفر بيع متابعين انستقرام وتيك توك.',
    images: ['https://www.grodd-smm.online/GRODD_LOGO.png'],
  },
  verification: {
    other: { 'adsterra': ['YOUR-VERIFICATION-CODE-HERE'] }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable} ${outfit.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
          document.addEventListener('dblclick', function(e) { e.preventDefault(); }, { passive: false });
        `}} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Grodd Media",
              "url": "https://www.grodd-smm.online",
              "logo": "https://www.grodd-smm.online/GRODD_LOGO.png",
              "description": "وكالة تسويق رقمي B2B وأفضل لوحة SMM متخصصة في تحسين خوارزميات التفاعل وتسريع الوصول العضوي للعلامات التجارية.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+212-687-097476",
                "contactType": "customer service",
                "email": "groddlabs@proton.me",
                "availableLanguage": ["Arabic", "English"]
              },
              "sameAs": [
                "https://x.com/groddsmm",
                "https://www.instagram.com/grodd_media/",
                "https://t.me/grodd_media"
              ]
            })
          }}
        />
      </head>


      <body className="text-slate-200 antialiased min-h-screen flex flex-col relative font-cairo">
        {/* Global Initial Loader */}
        <GlobalLoader />

        {/* Cinematic Background Layer */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="noise-bg"></div>
          <div className="glow-orb red" style={{ top: '-10%', right: '-5%', opacity: 0.4 }}></div>
          <div className="glow-orb blue" style={{ bottom: '-10%', left: '-5%', opacity: 0.3 }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A] via-transparent to-[#05070A] opacity-60"></div>
        </div>

        {/* Navigation */}
        <Navbar />

        <EnvGuard>
          {/* Global AdBlock Guard */}
          <AdBlockDetector />

          <div className="flex-grow flex flex-col pt-4">
            {children}
          </div>
        </EnvGuard>


        <footer className="relative z-10 border-t border-white/5 bg-[#121827]/50 mt-auto pt-16 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/5 pb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Image src="/GRODD_LOGO.png" alt="Grodd SMM Logo" width={200} height={48} className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                  وكالة متخصصة في التسويق الرقمي، بناء الجماهير، وتحليل الخوارزميات. نساعد العلامات التجارية والمؤثرين على تحقيق نمو مستدام وموثوق لحضورهم الرقمي. مطور بواسطة Grodd Labs.
                </p>
                <div className="flex flex-col gap-2 mb-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-pink-500 w-4 text-center"></i>
                    <a href="mailto:groddlabs@proton.me" className="hover:text-white transition-colors">groddlabs@proton.me</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fab fa-whatsapp text-pink-500 w-4 text-center"></i>
                    <a href="https://wa.me/212687097476" className="hover:text-white transition-colors" dir="ltr">+212 687-097476</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a href="https://x.com/groddsmm" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://www.instagram.com/grodd_media/" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://t.me/grodd_media" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <i className="fab fa-telegram"></i>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-pink-500 transition-colors">الرئيسية</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">الحملات التجريبية</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">الأسئلة الشائعة</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">استراتيجية العمل</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">الدعم الفني</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="/terms" className="hover:text-pink-500 transition-colors">شروط الاستخدام</a></li>
                  <li><a href="/privacy" className="hover:text-pink-500 transition-colors">سياسة الخصوصية</a></li>
                  <li><a href="/disclaimer" className="hover:text-pink-500 transition-colors">إخلاء المسؤولية</a></li>
                  <li><a href="/contact" className="hover:text-pink-500 transition-colors">اتصل بنا</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <div>&copy; 2026 Grodd SMM by Grodd Labs. جميع الحقوق محفوظة. <span className="mr-2 px-2 py-0.5 bg-white/5 rounded-md border border-white/10 text-xs font-mono">v1.0</span></div>
              <div className="flex items-center gap-2">
                <span>صنع بكل <i className="fas fa-heart text-pink-500 mx-1"></i> في</span>
                <span className="text-white font-bold">Grodd Labs</span>
              </div>
            </div>
          </div>
        </footer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

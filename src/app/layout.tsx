import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from '@/components/Navbar';
import AdBlockDetector from '@/components/AdBlockDetector';

export const metadata: Metadata = {
  title: 'Grodd Media | تسويق رقمي احترافي، ترويج، ووصول عضوي',
  description: 'وكالة تسويق رقمي B2B متخصصة في تحسين خوارزميات التفاعل، إدارة الحملات الترويجية، وتسريع الوصول العضوي للعلامات التجارية وصناع المحتوى.',
  verification: {
    // other: { 'adsterra': ['YOUR-VERIFICATION-CODE-HERE'] } // Uncomment when Adsterra gives you a meta tag verification code
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="text-slate-200 antialiased min-h-screen flex flex-col relative">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="glow-orb pink"></div>
          <div className="glow-orb purple"></div>
          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
            }}
          ></div>
        </div>

        {/* Navigation */}
        <Navbar />

        {/* Global AdBlock Guard */}
        <AdBlockDetector />

        {children}

        <footer className="relative z-10 border-t border-white/5 bg-[#121827]/50 mt-auto pt-16 pb-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/5 pb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <img src="/SMMGRODD.png" alt="Grodd SMM Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                  وكالة متخصصة في التسويق الرقمي، بناء الجماهير، وتحليل الخوارزميات. نساعد العلامات التجارية والمؤثرين على تحقيق نمو مستدام وموثوق لحضورهم الرقمي. مطور بواسطة Grodd Labs.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://x.com/groddsmm" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://instagram.com/grodd_smm" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://t.me/grodd_labsBot" className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all">
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
                  <li><a href="#" className="hover:text-pink-500 transition-colors">شروط الاستخدام</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">سياسة الخصوصية</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">إخلاء المسؤولية</a></li>
                  <li><a href="#" className="hover:text-pink-500 transition-colors">اتصل بنا</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <div>&copy; {new Date().getFullYear()} Grodd SMM by Grodd Labs. جميع الحقوق محفوظة.</div>
              <div className="flex items-center gap-2">
                <span>صنع بكل <i className="fas fa-heart text-pink-500 mx-1"></i> في</span>
                <span className="text-white font-bold">Grodd Labs</span>
              </div>
            </div>
          </div>
        </footer>
        {/* Adsterra Popunder Script */}
        <Script strategy="afterInteractive" src="https://evacuateenclose.com/ea/d2/ad/ead2ad4dc2d1475cebad280a82b63f9a.js" />
        
        {/* Adsterra Social Bar Script */}
        <Script strategy="afterInteractive" src="https://evacuateenclose.com/f7/d7/6a/f7d76a7b97e962d0d3f7fcc71b3dddea.js" />
        <SpeedInsights />
      </body>
    </html>
  );
}

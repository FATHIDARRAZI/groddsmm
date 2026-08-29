import Image from 'next/image';
import HomeClientForm from '@/components/HomeClientForm';
import AffiliateCard from '@/components/AffiliateCard';
import FreePromotionGrid from '@/components/FreePromotionGrid';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import FeaturesGrid from '@/components/FeaturesGrid';
import HomeClientAds, { HomeTopAd, HomeNativeAd, HomeMiddleAd } from '@/components/HomeClientAds';

export default function Home() {
  return (
    <main className="relative z-20 flex-grow flex flex-col items-center justify-center pt-8 pb-24 w-full bg-[#0B0B0F]" dir="rtl">
      <div className="w-full px-4 flex justify-center">
        <HomeTopAd />
      </div>

      <div className="w-full mt-8">
        <HomeClientForm />
      </div>

      <div className="w-full mt-8 px-4 flex justify-center">
        <HomeClientAds />
      </div>

      <div className="w-full">
        <AffiliateCard />
      </div>

      <div className="w-full px-4 mb-8 flex justify-center">
        <HomeNativeAd />
      </div>

      <div className="w-full">
        <FreePromotionGrid />
      </div>
      
      <div className="w-full px-4 mb-8 flex justify-center">
        <HomeMiddleAd />
      </div>

      <div className="w-full">
        <TestimonialsCarousel />
      </div>

      <div className="w-full">
        <FeaturesGrid />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Grodd Media - الترويج المجاني لوسائل التواصل الاجتماعي",
            "description": "احصل على متابعين، إعجابات، ومشاهدات مجانية. خدمة ترويج آمنة وموثوقة."
          })
        }}
      />
    </main>
  );
}

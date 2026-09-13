import React from 'react';

export default function ServicesTicker() {
  const platforms = [
    { name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: 'text-white' },
    { name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-400' },
    { name: 'YouTube', icon: 'fab fa-youtube', color: 'text-red-500' },
    { name: 'Facebook', icon: 'fab fa-facebook', color: 'text-blue-600' },
    { name: 'Telegram', icon: 'fab fa-telegram', color: 'text-blue-500' },
    { name: 'Spotify', icon: 'fab fa-spotify', color: 'text-green-500' },
    { name: 'Twitch', icon: 'fab fa-twitch', color: 'text-purple-500' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'text-blue-700' },
    { name: 'Snapchat', icon: 'fab fa-snapchat-ghost', color: 'text-yellow-400' },
  ];

  // Duplicate for seamless infinite scroll
  const scrollItems = [...platforms, ...platforms, ...platforms];

  return (
    <section className="w-full py-16 bg-[#151922] relative overflow-hidden" dir="rtl">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E11D48]/50 to-transparent"></div>
      
      <div className="text-center mb-10 relative z-10 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          نوفر أكثر من <span className="text-[#E11D48]">10,000+</span> خدمة سوشيال ميديا
        </h2>
      </div>

      <div className="w-full flex overflow-hidden relative group">
        {/* Fade edges */}
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#151922] to-transparent z-10"></div>
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-[#151922] to-transparent z-10"></div>
        
        <div className="flex w-max animate-infinite-scroll group-hover:[animation-play-state:paused]">
          {scrollItems.map((platform, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 rounded-full px-6 py-3 mx-3 shadow-lg whitespace-nowrap hover:border-[#E11D48]/50 transition-colors cursor-default"
            >
              <i className={`${platform.icon} ${platform.color} text-xl`}></i>
              <span className="text-white font-bold text-sm tracking-wide">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

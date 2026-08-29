import React from 'react';

const platforms = [
  {
    name: 'Instagram',
    icon: 'fab fa-instagram',
    bgClass: 'bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-500',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-pink-500' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-pink-400' },
      { name: 'مشاهدات الفيديو', icon: 'fas fa-play', iconColor: 'text-pink-600' },
      { name: 'مشاهدات المنشور', icon: 'fas fa-eye', iconColor: 'text-pink-500' },
    ],
  },
  {
    name: 'TT',
    icon: 'fab fa-tiktok',
    bgClass: 'bg-[#ff0050]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-red-400' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-red-400' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-red-400' },
    ],
  },
  {
    name: 'VK',
    icon: 'fab fa-vk',
    bgClass: 'bg-[#0077FF]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-blue-400' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-blue-400' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-blue-400' },
    ],
  },
  {
    name: 'Telegram',
    icon: 'fab fa-telegram-plane',
    bgClass: 'bg-[#2AABEE]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-blue-400' },
      { name: 'مشاهدات المنشور', icon: 'fas fa-eye', iconColor: 'text-blue-400' },
    ],
  },
  {
    name: 'YouTube',
    icon: 'fab fa-youtube',
    bgClass: 'bg-[#FF0000]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-red-500' },
      { name: 'إعجابات', icon: 'fas fa-thumbs-up', iconColor: 'text-red-500' },
    ],
  },
  {
    name: 'Twitter (X)',
    icon: 'fab fa-twitter',
    bgClass: 'bg-[#1DA1F2]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-sky-400' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-sky-400' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-sky-400' },
    ],
  },
  {
    name: 'Facebook',
    icon: 'fab fa-facebook-f',
    bgClass: 'bg-[#1877F2]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-blue-500' },
      { name: 'إعجابات', icon: 'fas fa-thumbs-up', iconColor: 'text-blue-500' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-blue-500' },
    ],
  },
  {
    name: 'Max',
    icon: 'fab fa-mix',
    bgClass: 'bg-[#5A45FF]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-indigo-400' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-indigo-400' },
    ],
  },
  {
    name: 'RuTube',
    icon: 'fas fa-play', 
    bgClass: 'bg-[#000000]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-zinc-300' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-zinc-300' },
      { name: 'مشاهدات', icon: 'fas fa-eye', iconColor: 'text-zinc-300' },
    ],
  },
  {
    name: 'Viber',
    icon: 'fab fa-viber',
    bgClass: 'bg-[#7360F2]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-purple-400' },
    ],
  },
  {
    name: 'Snapchat',
    icon: 'fab fa-snapchat-ghost',
    bgClass: 'bg-[#FFFC00]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-yellow-500' },
    ],
  },
  {
    name: 'Dribbble',
    icon: 'fab fa-dribbble',
    bgClass: 'bg-[#EA4C89]',
    services: [
      { name: 'متابعون', icon: 'fas fa-user', iconColor: 'text-pink-400' },
      { name: 'إعجابات', icon: 'fas fa-heart', iconColor: 'text-pink-400' },
    ],
  },
];

export default function FreePromotionGrid() {
  return (
    <section className="w-full max-w-[1200px] mx-auto mt-20 mb-16 px-4" dir="rtl">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
          الترويج المجاني - جرب الخدمة بدون تكلفة
        </h2>
        <p className="text-slate-600 dark:text-[#A3A3A3] max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
          متابعون وإعجابات ومشاهدات مجانية متاحة للجميع - بدون سحوبات أو شروط. اختر الخدمة، الصق رابطك واحصل على النتيجة. يمكنك العودة كل 5 دقائق، دون الحاجة للتسجيل أو الدفع.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, idx) => (
          <div
            key={idx}
            className={`flex flex-col bg-[#1c1c1e] rounded-2xl p-6 border border-white/5 transition-all hover:border-white/10 shadow-lg relative overflow-hidden group`}
          >
            {/* The gradient glow inside the card like in the screenshot */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 opacity-20 blur-3xl pointer-events-none rounded-full ${platform.bgClass.replace('bg-', 'bg-')}`}></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className={`w-12 h-12 flex justify-center items-center rounded-full ${platform.bgClass} shadow-md`}>
                <i className={`${platform.icon} text-white text-2xl ${platform.name === 'Snapchat' ? 'text-black' : ''}`}></i>
              </div>
              <span className="font-bold text-white text-lg">{platform.name}</span>
            </div>

            <div className="flex flex-wrap gap-2 relative z-10">
              {platform.services.map((service, sIdx) => (
                <button
                  key={sIdx}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#262629] border border-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-[#333] transition-colors"
                >
                  <i className={`${service.icon} ${service.iconColor}`}></i>
                  {service.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

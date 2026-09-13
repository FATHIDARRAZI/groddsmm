export default function AboutSolutions() {
  const features = [
    {
      id: 1,
      icon: 'fas fa-rocket',
      title: 'تنفيذ فوري',
      desc: 'تبدأ معظم طلباتنا فوراً بعد الدفع بفضل نظامنا الآلي المتقدم.',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      id: 2,
      icon: 'fas fa-shield-alt',
      title: 'دفع آمن',
      desc: 'نحن نقدم طرق دفع آمنة وموثوقة لضمان حماية بياناتك بالكامل.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 3,
      icon: 'fas fa-gem',
      title: 'جودة عالية',
      desc: 'نقدم خدمات حقيقية وعالية الجودة لضمان نمو حساباتك بشكل طبيعي.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 4,
      icon: 'fas fa-headset',
      title: 'دعم 24/7',
      desc: 'فريق الدعم الفني متواجد على مدار الساعة لمساعدتك في أي استفسار.',
      color: 'text-[#E11D48]',
      bg: 'bg-[#E11D48]/10'
    }
  ];

  return (
    <section className="w-full py-24 bg-[#0B0B0F]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Right Column: Title and Description */}
          <div className="order-1 lg:order-2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-sm font-bold mb-6">
              لماذا نحن؟
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6">
              تقدم <span className="text-[#E11D48]">Grodd Media</span> أفضل حلول التسويق
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              مع خبرة تزيد عن 10 سنوات في السوق، نوفر لك أقوى وأسرع الخدمات لتكبير حساباتك على وسائل التواصل الاجتماعي. نعتمد على أنظمة متطورة لضمان تنفيذ طلباتك بأعلى جودة وبأسعار تنافسية.
            </p>
            <button className="px-8 py-4 bg-white text-[#0B0B0F] hover:bg-slate-200 font-bold rounded-xl transition-all">
              اقرأ المزيد عنا
            </button>
          </div>

          {/* Left Column: Grid */}
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 hover:border-[#E11D48]/30 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${feature.bg} ${feature.color}`}>
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

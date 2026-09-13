export default function StatsBar() {
  const stats = [
    {
      id: 1,
      icon: 'fas fa-rocket',
      title: 'وقت البدء',
      value: '1 ثانية',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 2,
      icon: 'fas fa-shopping-cart',
      title: 'الطلبات المكتملة',
      value: '+29,564,810',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 3,
      icon: 'fas fa-tag',
      title: 'الأسعار تبدأ من',
      value: '$0.001',
      color: 'text-[#E11D48]',
      bg: 'bg-[#E11D48]/10'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 -mt-10 relative z-20" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-[#1C1C1E] border border-white/5 shadow-2xl rounded-2xl p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color}`}>
              <i className={stat.icon}></i>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-sm font-medium mb-1">{stat.title}</span>
              <span className="text-white text-2xl font-bold font-outfit tracking-tight">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

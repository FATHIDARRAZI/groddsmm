import React from 'react';

const features = [
  {
    title: 'آمن',
    icon: 'fas fa-shield-alt',
    iconBg: 'bg-green-500/20 text-green-500',
    description: 'كل ما نحتاجه هو رابط لحسابك أو منشورك. لا نطلب كلمة مرور حسابك أبداً.',
    gradient: 'from-green-500/10 to-transparent',
  },
  {
    title: 'سريع',
    icon: 'fas fa-bolt',
    iconBg: 'bg-yellow-500/20 text-yellow-500',
    description: 'تنطلق الطلبات تلقائياً على مدار الساعة طوال أيام الأسبوع، وتظهر النتائج الأولى عادةً في غضون ساعة.',
    gradient: 'from-yellow-500/10 to-transparent',
  },
  {
    title: 'خطط تناسب كل ميزانية',
    icon: 'fas fa-sliders-h',
    iconBg: 'bg-sky-500/20 text-sky-500',
    description: 'من الحسابات منخفضة التكلفة للكميات الكبيرة إلى المتابعين الحقيقيين مع الضمان - اختر الجودة التي تناسب المهمة.',
    gradient: 'from-sky-500/10 to-transparent',
  },
  {
    title: 'نظامنا البيئي الخاص',
    icon: 'fas fa-project-diagram',
    iconBg: 'bg-indigo-500/20 text-indigo-500',
    description: 'سوق المهام الإلكترونية الخاص بنا مع أشخاص حقيقيين، دعم مجاني وواجهة برمجة تطبيقات (API) للموزعين - كل ذلك في منصة واحدة.',
    gradient: 'from-indigo-500/10 to-transparent',
  },
  {
    title: 'برنامج التسويق بالعمولة',
    icon: 'fas fa-hand-holding-usd',
    iconBg: 'bg-red-500/20 text-red-500',
    description: 'قم بدعوة المستخدمين واكسب حتى 50% من مشترياتهم - مدى الحياة، من كل طلب يقومون به.',
    gradient: 'from-red-500/10 to-transparent',
    action: 'اعرف المزيد ←',
  },
  {
    title: 'منذ 2014',
    icon: 'fas fa-trophy',
    iconBg: 'bg-orange-500/20 text-orange-500',
    description: 'أكثر من عشر سنوات في السوق: ضمان الخدمة ودعم فني يرد بسرعة.',
    gradient: 'from-orange-500/10 to-transparent',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="w-full max-w-[1000px] mx-auto mt-16 mb-24 px-4" dir="rtl">
      <div className="text-center mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">
          خدمة ترويج وسائل التواصل الاجتماعي
        </h2>
        <p className="text-slate-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
          Grodd هي خدمة لترويج حسابات التواصل الاجتماعي. احصل على متابعين، إعجابات، مشاهدات، وتعليقات لإنستقرام، تيك توك، في كي، تيليجرام، يوتيوب، فيسبوك، وتويتر (X) - بسرعة وبسعر عادل. تبدأ الطلبات تلقائياً خلال دقائق بعد الدفع وتعمل على مدار الساعة.
        </p>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          لماذا تختار خدماتنا
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <div 
            key={idx}
            className="bg-[#1c212d] rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col h-full hover:border-white/10 transition-colors"
          >
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${feature.gradient} opacity-50 pointer-events-none`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.iconBg}`}>
                <i className={feature.icon}></i>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                {feature.description}
              </p>
              
              {feature.action && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <button className="px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors inline-flex items-center gap-2">
                    {feature.action}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

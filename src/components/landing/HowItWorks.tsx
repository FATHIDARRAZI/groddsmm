import Image from 'next/image';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: 'تسجيل الدخول / إنشاء حساب',
      desc: 'قم بإنشاء حساب جديد في ثوانٍ أو تسجيل الدخول إلى حسابك الحالي للوصول إلى لوحة التحكم.',
      icon: 'fas fa-user-plus'
    },
    {
      id: 2,
      title: 'شحن الرصيد',
      desc: 'أضف الأموال إلى حسابك باستخدام طرق الدفع الآمنة والمتعددة التي نوفرها.',
      icon: 'fas fa-wallet'
    },
    {
      id: 3,
      title: 'اختر الخدمة المطلوبة',
      desc: 'اختر الخدمة التي تناسبك من بين آلاف الخدمات المتاحة، وسيبدأ التنفيذ فوراً.',
      icon: 'fas fa-check-circle'
    }
  ];

  return (
    <section className="w-full py-24 bg-[#0B0B0F]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-sm font-bold mb-4">
            آلية العمل
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">كيف يعمل <span className="text-[#E11D48]">Grodd Media</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Right Column: Image */}
          <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-auto lg:h-[600px] flex justify-center items-center">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E11D48]/20 to-transparent rounded-[40px] blur-2xl"></div>
            
            <div className="relative w-full h-full max-w-md lg:max-w-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
              <Image 
                src="/images/landing/how_it_works_person.jpg" 
                alt="How Grodd Media Works" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent opacity-80"></div>
            </div>
          </div>

          {/* Left Column: Steps */}
          <div className="flex flex-col gap-6">
            {steps.map((step, index) => (
              <div key={step.id} className="bg-[#1C1C1E] p-6 rounded-3xl border border-white/5 flex gap-6 relative overflow-hidden group hover:border-[#E11D48]/30 transition-all">
                
                {/* Number Watermark */}
                <div className="absolute -left-4 -bottom-6 text-9xl font-black text-white/5 group-hover:text-[#E11D48]/5 transition-colors font-outfit select-none pointer-events-none">
                  0{step.id}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#E11D48] flex items-center justify-center shrink-0 shadow-lg shadow-[#E11D48]/20">
                  <i className={`${step.icon} text-white text-2xl`}></i>
                </div>
                
                <div className="flex flex-col justify-center z-10">
                  <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

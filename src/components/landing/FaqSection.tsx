'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs = [
    {
      question: 'هل يمكنني استخدام لوحة SMM الخاصة بكم على الهواتف المحمولة؟',
      answer: 'نعم بالتأكيد! منصتنا متجاوبة تماماً مع جميع الأجهزة بما في ذلك الهواتف المحمولة والأجهزة اللوحية، مما يتيح لك إدارة طلباتك بسهولة في أي وقت ومن أي مكان.'
    },
    {
      question: 'كيف يمكنني شحن رصيدي؟',
      answer: 'نوفر طرق دفع متعددة وآمنة مثل البطاقات البنكية، المحافظ الإلكترونية، والعملات الرقمية. يمكنك اختيار الطريقة الأنسب لك من صفحة شحن الرصيد.'
    },
    {
      question: 'متى سيبدأ طلبي بعد الدفع؟',
      answer: 'تبدأ معظم خدماتنا فوراً وتلقائياً بعد استلام الدفع بفضل نظامنا الآلي، وقد تستغرق بعض الخدمات بضع دقائق فقط للبدء.'
    },
    {
      question: 'هل خدماتكم آمنة لحساباتي؟',
      answer: 'نعم، 100%. نحن نستخدم أساليب تسويق آمنة ولا نطلب أبداً كلمات المرور الخاصة بك. حسابك في أمان تام.'
    }
  ];

  return (
    <section className="w-full py-24 bg-[#0B0B0F]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: FAQ Accordion (Takes 7 columns on LG) */}
          <div className="lg:col-span-7">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#E11D48]/10 text-[#E11D48] text-sm font-bold mb-4">
              الأسئلة الشائعة
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">هل لديك أي استفسار؟</h2>
            
            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border ${openIndex === index ? 'border-[#E11D48] bg-[#1C1C1E]' : 'border-white/5 bg-[#151922] hover:bg-[#1C1C1E]'} rounded-2xl overflow-hidden transition-colors cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                >
                  <div className="px-6 py-5 flex items-center justify-between">
                    <h3 className={`font-bold text-lg ${openIndex === index ? 'text-[#E11D48]' : 'text-white'}`}>
                      {faq.question}
                    </h3>
                    <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${openIndex === index ? 'text-[#E11D48] rotate-180' : 'text-slate-500'}`}></i>
                  </div>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'pb-5 max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Support Card (Takes 5 columns on LG) */}
          <div className="lg:col-span-5 flex items-center">
            <div className="w-full bg-[#1C1C1E] rounded-[32px] p-10 border border-white/5 relative overflow-hidden group">
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E11D48]/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                  <i className="fas fa-headset text-4xl text-[#E11D48]"></i>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">تحتاج مساعدة؟</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  إذا كان لديك سؤال غير موجود هنا، أو تحتاج إلى مساعدة إضافية في طلبك، فريق الدعم الفني لدينا جاهز لمساعدتك على مدار الساعة.
                </p>
                
                <Link href="/dashboard/tickets" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0B0B0F] hover:bg-slate-200 font-bold rounded-xl transition-all shadow-lg shadow-white/5">
                  <i className="fas fa-envelope"></i>
                  تواصل مع الدعم الفني
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

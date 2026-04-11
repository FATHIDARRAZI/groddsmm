import React from 'react';

export default function Disclaimer() {
  return (
    <main className="relative z-10 flex-grow flex flex-col items-center px-4 py-12 w-full max-w-4xl mx-auto">
      <div className="w-full glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden dir-rtl text-right">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-white/10 pb-6">إخلاء المسؤولية</h1>
          
          <div className="text-slate-300 space-y-6 leading-relaxed">
            <p>
              المعلومات والخدمات التقنية المقدمة في موقع <strong>Grodd Media</strong> مخصصة للأغراض الترويجية، تحليل الأداء التسويقي (B2B)، وفهم ديناميكيات خوارزميات الانتشار فقط.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">عدم الارتباط بجهات خارجية</h2>
            <p>
              توضح <strong>Grodd Media</strong> أنها وكالة مستقلة تماماً، وتقنياتها غير مدعومة، تابعة، أو متعاقدة رسمياً مع شركة Meta، Instagram، أو أي شبكة تواصل اجتماعي أخرى. الأسماء والعلامات والشعارات المذكورة في منصتنا تخص أصحابها، واستخدامنا لها يكون فقط بغرض الشرح وتحديد الوجهة الإعلانية للعميل.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">استخدام الخدمة على مسؤوليتك</h2>
            <p>
              تعتمد تقنياتنا على توجيه حركة المرور بشكل عضوي وخارجي. ورغم أننا نحرص ألا تتعارض خدماتنا مع السياسات الأمنية، يتحمل المستخدم كامل المسؤولية عند إدراج روابط محتواه في حملاتنا الإعلانية. نحن لا نتحمل المسؤولية عن أي تقييمات سلبية أو إجراءات تتخذ من الطرف الثالث المزود للاستضافة ضد حسابك كنتيجة لتفسيرهم العكسي لتدفق الزوار.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

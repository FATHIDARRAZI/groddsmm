import React from 'react';

export default function TermsOfUse() {
  return (
    <main className="relative z-10 flex-grow flex flex-col items-center px-4 py-12 w-full max-w-4xl mx-auto">
      <div className="w-full glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden dir-rtl text-right">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-white/10 pb-6">شروط الاستخدام</h1>
          
          <div className="text-slate-300 space-y-6 leading-relaxed">
            <p>
              أهلاً بك في <strong>Grodd Media</strong>. يرجى قراءة هذه الشروط بعناية قبل البدء باستخدام أدواتنا المتخصصة في إطلاق الحملات التسويقية. دخولك للموقع واستخدامك للخدمات يعني موافقتك القطعية على هذه الشروط.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. وصف الخدمة</h2>
            <p>
              Grodd Media هي وكالة ووسيط تقني يقدم حلول B2B لتحليل المحتوى، توجيه حركة الزوار (Traffic Routing)، وتحسين ظهور حسابات الأعمال في محركات استكشاف المحتوى (Algorithms Optimization). الخدمات مقدمة لأغراض التسويق الرقمي والدراسة والتقييم.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. الاستخدام العادل والمعتمد</h2>
            <p>
              أنت توافق على استخدام الخدمة للمحتوى القانوني العام الذي تملكه أو مصرح لك بالترويج له لغايات تسويقية. يمنع منعاً باتاً استخدام أنظمتنا لترويج محتوى يحض على الكراهية، العنف، أو ينتهك الحقوق الفكرية لأطراف ثالثة.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. التوافر وضمان النتائج</h2>
            <p>
              بينما نسعى جاهدين لتقديم أفضل تحليل وتوجيه خوارزمي على مدار الساعة، إلا أن سرعة وحجم التفاعل الفعلي الوارد لمحتواك قد يعتمد على نوع وحجم المحتوى والسياسات اللحظية لمنصات التواصل الاجتماعي المستهدفة. لا نقدم بيانات مطلقة أو ضمانات بأرقام قطعية حيث أن الغرض هو (تحسين وتوجيه) وليس التلاعب المباشر.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. إيقاف الخدمة</h2>
            <p>
              نحتفظ بالحق في تقييد أو تعليق وصول أي مستخدم إلى منصتنا إذا وجد أنه يسيء استخدام خوادمنا أو يرسل روابط تنتهك قوانين النشر أو سياسات هذه الشروط، دون إنذار مسبق.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

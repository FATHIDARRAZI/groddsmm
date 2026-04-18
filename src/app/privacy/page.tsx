import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="relative z-10 flex-grow flex flex-col items-center px-4 py-12 w-full max-w-4xl mx-auto">
      <div className="w-full glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden dir-rtl text-right">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold text-white mb-8 border-b border-white/10 pb-6">سياسة الخصوصية</h1>
          
          <div className="text-slate-300 space-y-6 leading-relaxed">
            <p>
              مرحباً بك في <strong>Grodd Media</strong>. نحن نحترم خصوصيتك ونلتزم بحماية أي معلومات قد تشاركها معنا. توضح هذه السياسة كيف نتعامل مع البيانات أثناء استخدامك لخدماتنا في تحسين الخوارزميات وإدارة الحملات.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. جلب البيانات واستخدامها</h2>
            <p>
              نحن لا نطلب أو نجمع أي بيانات شخصية حساسة مثل كلمات المرور، أو عناوين البريد الإلكتروني (إلا في حال التواصل مع الدعم الفني). خدمتنا تعتمد فقط على الروابط العامة (Public URLs) التي تقدمها لنا لتوجيه حركة الزوار وتحليل الأداء.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. ملفات تعريف الارتباط (Cookies) والإعلانات</h2>
            <p>
              تستخدم منصتنا ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتك. كما أننا نجعل هذه الأداة مجانية للجميع من خلال الاعتماد على الإعلانات (مثل Adsterra). قد تستخدم جهات خارجية ملفات تعريف الارتباط لعرض إعلانات بناءً على زياراتك السابقة لموقعنا أو مواقع أخرى على الإنترنت.
            </p>
            <p>
              يتم تقديم الإعلانات بواسطة شركاء خارجيين لضمان استمرارية الخدمة المجانية. يمكنك دائماً إدارة تفضيلات الخصوصية الخاصة بك من خلال إعدادات المتصفح.
            </p>


            <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. أمان وحماية الحسابات</h2>
            <p>
              خدماتنا مصممة لتعمل باستقلالية من خارج منصات التواصل الاجتماعي، ولا يتم بأي حال التدخل في سياسات الخصوصية الخاصة بحساباتك الشخصية. نحن نقدم حركة مرور وتوجيه خوارزمي متوافق مع معايير الويب الآمنة. 
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. التعديلات على السياسة</h2>
            <p>
              قد نقوم بتحديث هذه السياسة من وقت لآخر بحسب المتطلبات التقنية أو القانونية. باستمرارك في استخدام الموقع، فإنك توافق التغييرات المدرجة.
            </p>

            <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-xl text-center text-sm">
              آخر تحديث: {new Date().toLocaleDateString('ar-EG')} - إذا كانت لديك استفسارات، يرجى التواصل معنا عبر صفحة (اتصل بنا).
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import BountiesSection from '@/components/BountiesSection';

export default function CollabPage() {
  const [user, setUser] = useState<any>(null);
  const [refCount, setRefCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  
  // Collab request states
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchData = async () => {
      const supabase = createSupabaseClient();
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);

      // Check collab request status
      const { data: requestData, error: reqError } = await supabase
        .from('collab_requests')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
        
      if (reqError) {
        console.error('Error fetching collab request:', reqError);
      }
        
      if (requestData) {
        setRequestStatus(requestData.status);
        if (requestData.status === 'declined') {
          setAdminNote(requestData.admin_note);
        }
      } else {
        setRequestStatus(null);
      }

      // Fetch referral count (only needed if accepted, but fine to fetch)
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', authUser.id);
      
      if (!error && count !== null) {
        setRefCount(count);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const submitRequest = async () => {
    if (!usernameInput.trim()) {
      toast.error('الرجاء إدخال اسم المستخدم');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/collab/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('تم تقديم الطلب بنجاح');
        setRequestStatus('pending');
      } else {
        toast.error(data.error || 'فشل تقديم الطلب');
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء تقديم الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const referralLink = user ? `${baseUrl}/?ref=${user.id.substring(0, 8)}` : '...';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
         <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // --- RENDERING BASED ON STATUS ---

  // State 1: No request yet (Show Application Form)
  if (!requestStatus) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 animate-fade-in text-center">
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 text-3xl">
            <i className="fas fa-handshake"></i>
          </div>
          
          <h1 className="text-3xl font-black text-white mb-4">الانضمام لبرنامج الشراكات</h1>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            نحن نبحث عن صناع محتوى متميزين للانضمام إلى برنامج الشراكات الخاص بنا. للتقديم، يجب أن يستوفي حسابك الشروط التالية:
          </p>

          <div className="text-right space-y-4 mb-8 bg-[#1C1C1E] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-green-500"></i>
              <span className="text-slate-300 font-bold">1,000 متابع كحد أدنى</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-green-500"></i>
              <span className="text-slate-300 font-bold">4 منشورات على الأقل في الحساب</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-green-500"></i>
              <span className="text-slate-300 font-bold">أن يكون الحساب عام (Public)</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="text-right">
               <label className="text-sm font-bold text-slate-300 mb-2 block">اسم المستخدم (انستقرام)</label>
               <input 
                 type="text" 
                 value={usernameInput}
                 onChange={(e) => setUsernameInput(e.target.value)}
                 placeholder="مثال: username"
                 className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                 dir="ltr"
               />
             </div>
             <button 
               onClick={submitRequest}
               disabled={submitting}
               className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
             >
               {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'إرسال طلب الانضمام'}
             </button>
             <p className="text-xs text-slate-500 mt-4">يمكنك إرسال الطلب مرة واحدة فقط، سيتم مراجعته يدوياً من قبل الإدارة.</p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Pending
  if (requestStatus === 'pending') {
    return (
      <div className="w-full max-w-xl mx-auto py-20 animate-fade-in text-center">
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-10 shadow-2xl">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 text-4xl animate-pulse">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <h2 className="text-2xl font-black text-white mb-4">طلبك قيد المراجعة</h2>
          <p className="text-slate-400 leading-relaxed">
            لقد قمنا باستلام طلب الانضمام لبرنامج الشراكات الخاص بك بنجاح. فريقنا يقوم حالياً بمراجعة حسابك للتأكد من مطابقته للشروط.
          </p>
          <div className="mt-8 py-3 px-4 bg-white/5 rounded-xl border border-white/5 inline-block text-sm text-slate-300">
            يرجى العودة والتحقق من هذه الصفحة لاحقاً.
          </div>
        </div>
      </div>
    );
  }

  // State 3: Declined
  if (requestStatus === 'declined') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 animate-fade-in text-center">
        <div className="bg-[#121214] border border-red-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-4xl">
            <i className="fas fa-times-circle"></i>
          </div>
          <h2 className="text-2xl font-black text-white mb-4">تم رفض الطلب</h2>
          <p className="text-slate-400 mb-6">
            للأسف، لم يتم قبول طلب انضمامك لبرنامج الشراكات في الوقت الحالي.
          </p>
          
          {adminNote && (
            <div className="text-right bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
               <h4 className="text-red-400 font-bold text-sm mb-2">رسالة من الإدارة:</h4>
               <p className="text-white text-sm leading-relaxed">{adminNote}</p>
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
             <p className="text-sm text-slate-400 mb-4">إذا كنت تعتقد أن هناك خطأ أو ترغب في الاستفسار، يمكنك التواصل معنا.</p>
             <a 
               href="https://t.me/grodd_labsBot" 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
             >
               <i className="fab fa-telegram text-blue-400"></i> الدعم الفني
             </a>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Accepted (Original Collab Page Content)
  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">
              برنامج الشراكات
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">مركز منشئي المحتوى 🚀</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            حول جمهورك إلى دخل سلبي وقوة شرائية. أنشئ روابط، تتبع إحصائياتك، واحصل على صلاحيات VIP حصرية.
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-center p-6 bg-[#1C1C1E] rounded-3xl border border-white/5 shadow-xl min-w-[200px]">
           <span className="text-slate-500 text-[10px] font-bold uppercase mb-2">حالة الشراكة</span>
           <div className="text-green-400 font-black text-xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              نشط (شريك)
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-[#1A1F2C] to-[#121214] border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <i className="fas fa-link text-blue-500"></i> رابط الإحالة الخاص بك
            </h3>

            <div className="bg-black/40 border border-white/5 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-4 group">
              <div className="flex-1 px-4 py-3 font-mono text-sm text-slate-300 break-all select-all">
                {referralLink}
              </div>
              <button 
                onClick={copyToClipboard}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]'
                }`}
              >
                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                {copied ? 'تم النسخ!' : 'نسخ الرابط'}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">تتبع آمن</p>
                    <p className="text-slate-500 text-[10px]">نظام تتبع ملفات الكوكيز لمدة 30 يوم</p>
                  </div>
               </div>
               <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <i className="fas fa-magic"></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">تحويل تلقائي</p>
                    <p className="text-slate-500 text-[10px]">يتم توجيه المستخدم لصفحة التسجيل فوراً</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1C1C1E] p-8 rounded-[2rem] border border-white/5 group hover:border-blue-500/20 transition-all">
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">إجمالي المسجلين</p>
               <div className="flex items-end gap-3">
                  <h4 className="text-5xl font-black text-white">{refCount}</h4>
                  <span className="text-green-500 text-sm font-bold mb-2 flex items-center gap-1">
                    <i className="fas fa-caret-up"></i> +100%
                  </span>
               </div>
               <div className="w-full h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
               </div>
            </div>

            <div className="bg-[#1C1C1E] p-8 rounded-[2rem] border border-white/5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">المكافأة المستحقة</p>
                <div className="flex items-end gap-3">
                  <h4 className="text-5xl font-black text-white">VIP</h4>
                  <span className="text-blue-400 text-xs font-bold mb-2 font-mono">الفئة الذهبية</span>
               </div>
               <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">تمنح تلقائياً عند وصولك لـ 50 مسجل نشط</p>
            </div>

            <div className="bg-[#1C1C1E] p-8 rounded-[2rem] border border-white/5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">كوبونات وزعت</p>
                <div className="flex items-end gap-3">
                  <h4 className="text-5xl font-black text-white">0</h4>
                  <span className="text-slate-600 text-xs font-bold mb-2">قريباً</span>
               </div>
               <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">قريباً يمكنك منح متابعيك كوبونات خصم خاصة بك</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
              <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white/10 blur-[40px] rounded-full"></div>
              <h4 className="text-xl font-bold mb-4 relative z-10">تواصل مع الإدارة</h4>
              <p className="text-sm text-blue-100 mb-8 leading-relaxed relative z-10">
                للحصول على عروض مخصصة، حسابات مدفوعة مجانية، أو طلب تحويل الأرباح، يمكنك التحدث مباشرة مع فريق الشراكات.
              </p>
              <a 
                href="https://t.me/grodd_labsBot" 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-center block hover:bg-slate-50 transition-colors shadow-lg"
              >
                تواصل عبر التليجرام
              </a>
           </div>

           <div className="bg-[#1C1C1E] p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-lg font-bold text-white mb-6">قواعد البرنامج</h4>
              <ul className="space-y-4">
                 <li className="flex gap-3 text-sm text-slate-400">
                    <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                    <span>لا ينصح بإنشاء حسابات وهمية لنفسك.</span>
                 </li>
                 <li className="flex gap-3 text-sm text-slate-400">
                    <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                    <span>يجب أن يكون الرابط متاحاً للعامة في وصف المقاطع.</span>
                 </li>
                 <li className="flex gap-3 text-sm text-slate-400">
                    <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                    <span>تُفعل صلاحيات الـ VIP بعد التدقيق في جودة الزيارات.</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {/* BOUNTIES SECTION */}
      <BountiesSection />

    </div>
  );
}

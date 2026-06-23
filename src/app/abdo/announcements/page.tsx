'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (e) {
      toast.error('فشل جلب الإعلانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...newAnnouncement })
      });
      if (res.ok) {
        toast.success('تم إنشاء الإعلان بنجاح');
        setShowForm(false);
        setNewAnnouncement({ title: '', message: '', type: 'info' });
        fetchAnnouncements();
      }
    } catch {
      toast.error('فشل إنشاء الإعلان');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, is_active: !currentStatus })
      });
      if (res.ok) {
        toast.success('تم تغيير الحالة بنجاح');
        fetchAnnouncements();
      }
    } catch {
      toast.error('فشل تغيير الحالة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) {
        toast.success('تم الحذف بنجاح');
        fetchAnnouncements();
      }
    } catch {
      toast.error('فشل الحذف');
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 ml-0 md:ml-72 pb-32 md:pb-10 min-h-screen relative dir-rtl text-right font-cairo">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">الإعلانات العامة</h1>
            <p className="text-slate-400 text-sm">نشر إشعارات ورسائل تظهر لجميع المستخدمين في لوحة التحكم الخاصة بهم.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            {showForm ? 'إلغاء' : 'إضافة إعلان جديد'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">العنوان</label>
                <input 
                  required
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="مثال: إضافة خدمات جديدة"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">النوع</label>
                <select 
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="info">معلومة (أزرق)</option>
                  <option value="success">نجاح (أخضر)</option>
                  <option value="warning">تنبيه (أصفر)</option>
                  <option value="danger">هام جداً (أحمر)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-2">نص الإعلان</label>
              <textarea 
                required
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all w-full md:w-auto">
              نشر الإعلان
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-10 text-slate-500">جاري التحميل...</div>
          ) : announcements.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
              لا توجد إعلانات حالية
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center ${
                !ann.is_active ? 'bg-slate-900 border-slate-800 opacity-60' :
                ann.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
                ann.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                ann.type === 'danger' ? 'bg-red-500/10 border-red-500/20' :
                'bg-blue-500/10 border-blue-500/20'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                    {!ann.is_active && <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">معطل</span>}
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{ann.message}</p>
                  <p className="text-xs text-slate-500 mt-3">{new Date(ann.created_at).toLocaleString('en-GB')}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button 
                    onClick={() => handleToggle(ann.id, ann.is_active)}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    {ann.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button 
                    onClick={() => handleDelete(ann.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-sm font-bold transition-all"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

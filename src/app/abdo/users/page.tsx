'use client';

import React, { useState, useEffect } from 'react';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  
  const [logsModalUser, setLogsModalUser] = useState<any | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Create User Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_user', ...newUser })
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateForm(false);
        setNewUser({ fullName: '', email: '', password: '' });
        toast.success('تم إنشاء المستخدم بنجاح');
        await fetchUsers();
      } else {
        toast.error(data.error || 'فشل إنشاء المستخدم');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleAdjustBalance = async (targetUserId: string) => {
    const amount = amounts[targetUserId] || 0;
    if (amount === 0) return;

    setUpdating(targetUserId);

    // Optimistic Update: Update local state immediately
    const originalUsers = [...users];
    setUsers(users.map((u: any) => 
      u.id === targetUserId ? { ...u, points_balance: (u.points_balance || 0) + amount } : u
    ));

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adjust_balance', targetUserId, amount })
      });
      
      if (res.ok) {
        setAmounts(prev => ({ ...prev, [targetUserId]: 0 }));
        toast.success('تم تعديل الرصيد بنجاح');
        // Fresh fetch for full sync
        await fetchUsers();
      } else {
        setUsers(originalUsers);
        toast.error('حدث خطأ أثناء تعديل الرصيد');
      }
    } catch (e) {
      setUsers(originalUsers);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleBan = async (targetUserId: string, currentBanStatus: boolean) => {
    setUpdating(targetUserId);

    // Optimistic Update
    const originalUsers = [...users];
    setUsers(users.map((u: any) => 
      u.id === targetUserId ? { ...u, is_banned: !currentBanStatus } : u
    ));

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_ban_status', targetUserId, isBanned: !currentBanStatus })
      });
      if (res.ok) {
        toast.success(currentBanStatus ? 'تم فك حظر المستخدم بنجاح' : 'تم حظر المستخدم بنجاح');
        await fetchUsers();
      } else {
        setUsers(originalUsers);
        toast.error('تعذر تغيير حالة الحظر');
      }
    } catch (e) {
      setUsers(originalUsers);
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleRemoveAds = async (targetUserId: string, currentRemoveAds: boolean) => {
    setUpdating(targetUserId);

    // Optimistic Update
    const originalUsers = [...users];
    setUsers(users.map((u: any) => 
      u.id === targetUserId ? { ...u, remove_ads: !currentRemoveAds } : u
    ));

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_remove_ads', targetUserId, removeAds: !currentRemoveAds })
      });
      if (res.ok) {
        toast.success(currentRemoveAds ? 'تم تفعيل الإعلانات للمستخدم' : 'تم إزالة الإعلانات للمستخدم بنجاح');
        await fetchUsers();
      } else {
        setUsers(originalUsers);
        toast.error('تعذر تغيير حالة الإعلانات للمستخدم');
      }
    } catch (e) {
      setUsers(originalUsers);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (targetUserId: string, targetName: string) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف حساب "${targetName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`);
    if (!confirmed) return;

    setUpdating(targetUserId);

    // Optimistic Update: Remove from list
    const originalUsers = [...users];
    setUsers(users.filter((u: any) => u.id !== targetUserId));

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', targetUserId })
      });
      if (res.ok) {
        toast.success('تم حذف المستخدم بنجاح');
        await fetchUsers();
      } else {
        setUsers(originalUsers);
        toast.error('فشل حذف المستخدم');
      }
    } catch (e) {
      setUsers(originalUsers);
    } finally {
      setUpdating(null);
    }
  };

  const handleSetTier = async (targetUserId: string, tier: string) => {
    setUpdating(targetUserId);
    const originalUsers = [...users];
    setUsers(users.map((u: any) => u.id === targetUserId ? { ...u, tier } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_tier', targetUserId, tier })
      });
      if (res.ok) {
        toast.success('تم تغيير المستوى بنجاح');
      } else {
        setUsers(originalUsers);
        toast.error('فشل تغيير المستوى');
      }
    } catch {
      setUsers(originalUsers);
    } finally {
      setUpdating(null);
    }
  };

  const handleFetchLogs = async (user: any) => {
    setLogsModalUser(user);
    setActivityLogs([]);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_logs', targetUserId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setActivityLogs(data.logs);
      }
    } catch {
      toast.error('فشل جلب السجلات');
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const name = (u.fullName || u.full_name || u.username || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm);
  });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
            <p className="text-slate-400 text-sm">التحكم الكامل في حسابات المنصة والأرصدة</p>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
            >
               <i className={`fas ${showCreateForm ? 'fa-times' : 'fa-plus'}`}></i>
               {showCreateForm ? 'إلغاء' : 'إضافة مستخدم'}
            </button>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="البحث بالاسم أو المعرف..." 
                 className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-80 pr-10"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
            </div>
         </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <i className="fas fa-user-plus text-blue-500"></i>
              إنشاء حساب مستخدم جديد
           </h3>
           <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">الاسم الكامل</label>
                 <input 
                   required
                   type="text" 
                   placeholder="مثال: أحمد محمد"
                   className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                   value={newUser.fullName}
                   onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">البريد الإلكتروني</label>
                 <input 
                   required
                   type="email" 
                   placeholder="user@example.com"
                   className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                   value={newUser.email}
                   onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">كلمة المرور</label>
                 <div className="flex gap-3">
                   <input 
                     required
                     type="password" 
                     placeholder="••••••••"
                     className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                     value={newUser.password}
                     onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                   />
                   <button 
                     type="submit"
                     disabled={creating}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-bold transition-all disabled:opacity-50"
                   >
                     {creating ? <i className="fas fa-spinner fa-spin"></i> : 'إنشاء'}
                   </button>
                 </div>
              </div>
           </form>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">المستخدم</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">المعرف (UID)</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">الرصيد الحقيقي</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">المستوى</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">الحالة</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">إزالة الإعلانات</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">تعديل الرصيد / السجلات</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <>
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                                  <Image src="/user-avatar-male-5.svg" alt="" width={40} height={40} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className="text-white font-bold">{user.fullName || user.full_name || user.username || 'مجهول'}</p>
                                  <p className="text-xs text-slate-500">منذ {new Date(user.created_at).toLocaleDateString()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <code className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded select-all">{user.id}</code>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-white font-bold text-lg">{user.points_balance?.toLocaleString() || '0'}</span>
                              <span className="text-slate-500 text-[10px] uppercase font-bold">Points</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <select 
                             value={user.tier || 'default'} 
                             onChange={(e) => handleSetTier(user.id, e.target.value)}
                             disabled={!!updating}
                             className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                           >
                             <option value="default">عادي (Default)</option>
                             <option value="vip">VIP</option>
                             <option value="reseller">موزع (Reseller)</option>
                           </select>
                         </td>
                           <td className="px-6 py-4 text-center">
                             {user.is_admin ? (
                               <span className="px-3 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                 مسؤول
                               </span>
                             ) : (
                               <div className="flex items-center justify-center gap-2">
                                 <button 
                                   onClick={() => handleToggleBan(user.id, user.is_banned)}
                                   disabled={!!updating}
                                   className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                                     user.is_banned 
                                       ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' 
                                       : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                                   }`}
                                 >
                                   {user.is_banned ? 'محظور' : 'نشط'}
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteUser(user.id, user.full_name || user.fullName || user.username)}
                                   disabled={!!updating}
                                   className="w-7 h-7 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                   title="حذف الحساب نهائياً"
                                 >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                 </button>
                               </div>
                             )}
                           </td>
                           <td className="px-6 py-4 text-center">
                             {!user.is_admin ? (
                               <button 
                                 onClick={() => handleToggleRemoveAds(user.id, !!user.remove_ads)}
                                 disabled={!!updating}
                                 className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                                   user.remove_ads 
                                     ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white' 
                                     : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                 }`}
                               >
                                 {user.remove_ads ? 'بدون إعلانات' : 'مع إعلانات'}
                               </button>
                             ) : (
                               <span className="text-slate-600 text-xs">-</span>
                             )}
                           </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                               <input 
                                  type="number"
                                  placeholder="+/-"
                                  className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                  value={amounts[user.id] || ''}
                                  onChange={(e) => setAmounts(prev => ({ ...prev, [user.id]: parseInt(e.target.value) || 0 }))}
                               />
                               <button 
                                 onClick={() => handleAdjustBalance(user.id)}
                                 disabled={!!updating || !amounts[user.id]}
                                 className="w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center transition-all"
                               >
                                  <i className={`fas ${updating === user.id ? 'fa-spinner fa-spin' : 'fa-check'} text-xs`}></i>
                               </button>
                               <button 
                                 onClick={() => handleFetchLogs(user)}
                                 className="w-8 h-8 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 hover:text-white flex items-center justify-center transition-all ml-2"
                                 title="سجل النشاطات"
                               >
                                 <i className="fas fa-history text-xs"></i>
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {logsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                سجل نشاطات: {logsModalUser.full_name || logsModalUser.fullName || logsModalUser.username}
              </h3>
              <button onClick={() => setLogsModalUser(null)} className="text-slate-400 hover:text-white">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {activityLogs.length === 0 ? (
                <p className="text-center text-slate-500">لا توجد سجلات حالياً أو جاري التحميل...</p>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-400 font-bold text-sm">{log.action}</span>
                        <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <pre className="text-xs text-slate-400 bg-black/50 p-2 rounded overflow-x-auto" dir="ltr">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

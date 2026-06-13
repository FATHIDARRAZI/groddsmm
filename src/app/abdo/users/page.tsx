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

  const filteredUsers = users.filter((u: any) => {
    const name = (u.fullName || u.full_name || u.username || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || u.id.includes(searchTerm);
  });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-black text-white">إدارة المستخدمين</h1>
            <p className="text-slate-500 font-bold">التحكم الكامل في حسابات المنصة والارصدة</p>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
               <i className={`fas ${showCreateForm ? 'fa-times' : 'fa-plus'}`}></i>
               {showCreateForm ? 'إلغاء' : 'إضافة مستخدم'}
            </button>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="البحث بالاسم أو المعرف..." 
                 className="bg-[#121827] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 w-full md:w-80"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            </div>
         </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-[#121827] rounded-[2.5rem] border border-red-600/20 p-8 shadow-2xl">
           <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <i className="fas fa-user-plus text-red-600"></i>
              إنشاء حساب مستخدم جديد
           </h3>
           <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest">الاسم الكامل</label>
                 <input 
                   required
                   type="text" 
                   placeholder="مثال: أحمد محمد"
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50"
                   value={newUser.fullName}
                   onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest">البريد الإلكتروني</label>
                 <input 
                   required
                   type="email" 
                   placeholder="user@example.com"
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50"
                   value={newUser.email}
                   onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest">كلمة المرور</label>
                 <div className="flex gap-3">
                   <input 
                     required
                     type="password" 
                     placeholder="••••••••"
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50"
                     value={newUser.password}
                     onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                   />
                   <button 
                     type="submit"
                     disabled={creating}
                     className="bg-red-600 hover:bg-red-500 text-white px-8 rounded-xl font-black transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                   >
                     {creating ? <i className="fas fa-spinner fa-spin"></i> : 'إنشاء'}
                   </button>
                 </div>
              </div>
           </form>
        </div>
      )}

      <div className="bg-[#121827] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">المستخدم</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">المعرف (UID)</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">الرصيد الحقيقي</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">الحالة</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">إزالة الإعلانات</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">تعديل الرصيد</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
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
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                                  <Image src="/user-avatar-male-5.svg" alt="" width={40} height={40} className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className="text-white font-bold">{user.fullName || user.full_name || user.username || 'مجهول'}</p>
                                  <p className="text-[10px] text-slate-500">منذ {new Date(user.created_at).toLocaleDateString()}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <code className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded select-all">{user.id}</code>
                         </td>
                         <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-white font-black text-xl">{user.points_balance?.toLocaleString() || '0'}</span>
                              <span className="text-slate-600 text-[10px] uppercase font-bold">Points</span>
                            </div>
                         </td>
                           <td className="px-6 py-5 text-center">
                             {user.is_admin ? (
                               <span className="px-4 py-1 rounded-full text-[10px] font-black border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                 مسؤول (ADMIN)
                               </span>
                             ) : (
                               <div className="flex items-center justify-center gap-2">
                                 <button 
                                   onClick={() => handleToggleBan(user.id, user.is_banned)}
                                   disabled={!!updating}
                                   className={`px-4 py-1 rounded-full text-[10px] font-black border transition-all ${
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
                                   className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/5 group"
                                   title="حذف الحساب نهائياً"
                                 >
                                    <i className="fas fa-trash-alt text-[10px]"></i>
                                 </button>
                               </div>
                             )}
                           </td>
                           <td className="px-6 py-5 text-center">
                             {!user.is_admin ? (
                               <button 
                                 onClick={() => handleToggleRemoveAds(user.id, !!user.remove_ads)}
                                 disabled={!!updating}
                                 className={`px-4 py-1 rounded-full text-[10px] font-black border transition-all ${
                                   user.remove_ads 
                                     ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white' 
                                     : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500 hover:text-white'
                                 }`}
                               >
                                 {user.remove_ads ? 'بدون إعلانات' : 'مع إعلانات'}
                               </button>
                             ) : (
                               <span className="text-slate-600 text-xs">-</span>
                             )}
                           </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                               <input 
                                  type="number"
                                  placeholder="+/-"
                                  className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600/50"
                                  value={amounts[user.id] || ''}
                                  onChange={(e) => setAmounts(prev => ({ ...prev, [user.id]: parseInt(e.target.value) || 0 }))}
                               />
                               <button 
                                 onClick={() => handleAdjustBalance(user.id)}
                                 disabled={!!updating || !amounts[user.id]}
                                 className="w-10 h-10 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-500 disabled:opacity-50 flex items-center justify-center transition-all"
                               >
                                  <i className={`fas ${updating === user.id ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                               </button>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-1 text-center">أدخل قيمة سالبة للخصم</p>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

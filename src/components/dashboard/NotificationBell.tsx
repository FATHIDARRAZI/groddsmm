'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id })
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="w-10 h-10 bg-[#1C1C1E] rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative cursor-pointer"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#121214]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-80 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999] animate-fade-in dir-rtl">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0B0F19]/50">
            <h3 className="font-bold text-white text-sm">الإشعارات</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                لا توجد إشعارات حالياً
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={(e) => {
                      if (!notif.is_read) markAsRead(notif.id, e);
                    }}
                    className={`p-4 border-b border-white/5 relative ${!notif.is_read ? 'bg-blue-500/5 cursor-pointer' : 'hover:bg-white/5 cursor-default'} transition-colors`}
                  >
                    {!notif.is_read && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                    <div className="pr-4">
                      <h4 className="text-sm font-bold text-white mb-1">{notif.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{notif.message}</p>
                      <p className="text-[10px] text-slate-500">{new Date(notif.created_at).toLocaleString('en-GB')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

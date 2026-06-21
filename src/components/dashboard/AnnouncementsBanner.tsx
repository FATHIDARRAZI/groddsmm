'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dismissedAnnouncements');
    if (saved) {
      try {
        setDismissed(JSON.parse(saved));
      } catch (e) {}
    }
    fetchActiveAnnouncements();
  }, []);

  const fetchActiveAnnouncements = async () => {
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) {
      setAnnouncements(data);
    }
  };

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const visibleAnnouncements = announcements.filter(ann => !dismissed.includes(ann.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-6 w-full animate-fade-in z-40 relative">
      {visibleAnnouncements.map((ann) => {
        let colors = '';
        let icon = '';
        switch (ann.type) {
          case 'success':
            colors = 'bg-green-500/10 border-green-500/20 text-green-400';
            icon = 'fa-check-circle';
            break;
          case 'warning':
            colors = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
            icon = 'fa-exclamation-triangle';
            break;
          case 'danger':
            colors = 'bg-red-500/10 border-red-500/20 text-red-400';
            icon = 'fa-exclamation-circle';
            break;
          default:
            colors = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            icon = 'fa-info-circle';
            break;
        }

        return (
          <div key={ann.id} className={`flex items-start md:items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-lg ${colors}`}>
            <div className="flex items-start md:items-center gap-4">
              <i className={`fas ${icon} text-2xl drop-shadow-md`}></i>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg mb-1">{ann.title}</h4>
                <p className="text-sm opacity-90 whitespace-pre-wrap">{ann.message}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDismiss(ann.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors shrink-0"
              title="إخفاء"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}

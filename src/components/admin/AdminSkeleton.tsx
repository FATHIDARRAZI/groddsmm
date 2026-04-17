'use client';

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-[#121827] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden animate-pulse">
      <div className="w-24 h-2 bg-white/10 rounded mb-4"></div>
      <div className="w-32 h-10 bg-white/10 rounded mb-6"></div>
      <div className="space-y-2">
        <div className="w-full h-2 bg-white/10 rounded"></div>
        <div className="w-2/3 h-2 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-24 h-3 bg-white/10 rounded"></div>
            <div className="w-16 h-2 bg-white/10 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="w-32 h-3 bg-white/10 rounded mx-auto"></div>
      </td>
      <td className="px-6 py-5">
        <div className="w-16 h-4 bg-white/10 rounded mx-auto"></div>
      </td>
      <td className="px-6 py-5">
        <div className="w-20 h-5 bg-white/10 rounded-full mx-auto"></div>
      </td>
      <td className="px-6 py-5 text-center">
        <div className="flex justify-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
          <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );
}

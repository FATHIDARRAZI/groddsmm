'use client';

import React, { useEffect, useRef } from 'react';

interface SafeAdSlotProps {
  src: string;
  width: string;
  height: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SafeAdSlot prevents React from crashing with "NotFoundError" when ad-blockers
 * or external scripts remove an iframe from the DOM without React's knowledge.
 * It handles the lifecycle of the iframe manually through a ref.
 */

if (typeof window !== 'undefined' && !(window as any).__patchedRemoveChild) {
  (window as any).__patchedRemoveChild = true;
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    try {
      return originalRemoveChild.call(this, child) as T;
    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        console.warn('React attempted to remove a node that is already gone (likely blocked by AdBlock). Preventing crash.');
        return child;
      }
      throw e;
    }
  };
}
export default function SafeAdSlot({ src, width, height, className, style }: SafeAdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Manually create and append iframe to isolate from React's internal DOM tracking
    const iframe = document.createElement('iframe');
    
    // Append a cache-busting timestamp to maximize ad impressions and bypass browser cache
    const separator = src.includes('?') ? '&' : '?';
    iframe.src = `${src}${separator}v=${Date.now()}`;
    
    iframe.width = width;
    iframe.height = height;
    iframe.setAttribute('frameBorder', '0');
    iframe.setAttribute('scrolling', 'no');
    if (className) iframe.className = className;
    iframe.loading = "lazy";
    
    // Add some default styles for ad iframes
    iframe.style.backgroundColor = 'transparent';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    
    // Clear any existing children to prevent duplicate ads from re-renders or React Strict Mode
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    containerRef.current.appendChild(iframe);

    return () => {
      // Definitively prevent crashes by catching any DOM errors during unmount
      try {
        if (containerRef.current && iframe.parentNode === containerRef.current) {
          containerRef.current.removeChild(iframe);
        }
      } catch (e) {
        // Silently ignore removal errors as the node is already gone or detached
        console.warn('SafeAdSlot: Cleanup ignored error', e);
      }
    };
  }, [src, width, height, className]);

  // Use the provided width/height for the container to maintain layout stability
  return (
    <div 
      ref={containerRef} 
      className={`flex items-center justify-center ${className || ''}`} 
      style={{ 
        width: isNaN(Number(width)) ? width : `${width}px`, 
        height: isNaN(Number(height)) ? height : `${height}px`,
        ...style 
      }} 
    />
  );
}

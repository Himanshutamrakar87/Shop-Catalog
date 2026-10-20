import React from 'react';

/**
 * DevotionalBanner Component
 * 
 * Displays the sacred Sanskrit greeting "श्री शिवाय नमस्तुभ्यं"
 * in a small, elegant, centered banner above the navbar across all screens.
 */
export default function DevotionalBanner({ variant = 'light', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <div
      role="banner"
      aria-label="Devotional Greeting"
      className={`w-full py-1.5 px-3 select-none flex items-center justify-center transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/25 text-amber-300'
          : 'bg-gradient-to-r from-amber-50/80 via-amber-100/70 to-amber-50/80 border-b border-amber-200/60 text-amber-900'
      } ${className}`}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-devanagari font-semibold tracking-wide">
        <span className={isDark ? 'text-amber-400/60 text-[10px] sm:text-xs' : 'text-amber-600/60 text-[10px] sm:text-xs'} aria-hidden="true">
          ॥
        </span>
        <span className="tracking-wider drop-shadow-2xs">
          श्री शिवाय नमस्तुभ्यं
        </span>
        <span className={isDark ? 'text-amber-400/60 text-[10px] sm:text-xs' : 'text-amber-600/60 text-[10px] sm:text-xs'} aria-hidden="true">
          ॥
        </span>
      </div>
    </div>
  );
}

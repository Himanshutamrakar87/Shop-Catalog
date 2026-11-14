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
          ? 'bg-[#0F2D25] border-b border-[#D4A64A]/30 text-[#F3D58D]'
          : 'bg-gradient-to-r from-[#0F2D25] via-[#173F35] to-[#0F2D25] border-b border-[#D4A64A]/30 text-[#F3D58D]'
      } ${className}`}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-devanagari font-semibold tracking-wide">
        <span className="text-[#D4A64A]/75 text-[10px] sm:text-xs" aria-hidden="true">
          ॥
        </span>
        <span className="tracking-wider drop-shadow-2xs">
          श्री शिवाय नमस्तुभ्यं
        </span>
        <span className="text-[#D4A64A]/75 text-[10px] sm:text-xs" aria-hidden="true">
          ॥
        </span>
      </div>
    </div>
  );
}

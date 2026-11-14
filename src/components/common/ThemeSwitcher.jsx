import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeSwitcher Component
 * - 'compact': Single icon button that directly toggles between Light and Dark mode on click
 * - 'sidebar': Two-option Light | Dark selector panel
 */
export default function ThemeSwitcher({ variant = 'sidebar' }) {
  const { resolvedTheme, isDark, setThemePreference, toggleTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#F7F3EA] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43] dark:hover:bg-[#2A4E40] transition-colors cursor-pointer shrink-0 active:scale-95"
      >
        {isDark ? (
          <Moon className="w-4.5 h-4.5 text-[#D4A64A]" />
        ) : (
          <Sun className="w-4.5 h-4.5 text-[#D4A64A]" />
        )}
      </button>
    );
  }

  // 'sidebar' / inline dark emerald drawer variant (Light | Dark only)
  return (
    <div className="rounded-xl bg-[#12332B]/80 dark:bg-[#172B23] border border-[#D4A64A]/20 dark:border-[#34433A] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4A64A]">
          Appearance
        </span>
        <span className="text-[11px] font-medium text-[#B6C0B8]">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#0F2A23] dark:bg-[#141C19] border border-[#34433A]/70">
        <button
          type="button"
          onClick={() => setThemePreference('light')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            !isDark
              ? 'bg-[#D4A64A] text-[#173F35]'
              : 'text-[#DCE6E2] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43]/70 dark:hover:bg-[#203D32]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 shrink-0" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setThemePreference('dark')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            isDark
              ? 'bg-[#D4A64A] text-[#141C19]'
              : 'text-[#DCE6E2] hover:text-[#E9D5A5] dark:hover:text-[#E7C477] hover:bg-[#1E4F43]/70 dark:hover:bg-[#203D32]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 shrink-0" />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}

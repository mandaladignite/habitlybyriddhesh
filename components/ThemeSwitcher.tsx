'use client'

import { useTheme } from '@/lib/theme-context'
import { themes, ThemeType } from '@/lib/themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <span className="text-sm text-slate-600 font-medium whitespace-nowrap">Theme:</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
          const themeConfig = themes[themeKey]
          return (
            <button
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === themeKey
                  ? 'text-white shadow-md scale-105'
                  : 'bg-white border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
              style={theme === themeKey ? { backgroundColor: themeConfig.primary } : {}}
              title={themeConfig.name}
            >
              {themeConfig.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

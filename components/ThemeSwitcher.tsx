'use client'

import { useTheme } from '@/lib/theme-context'

const themes = [
  { id: 'discipline', name: 'Discipline', color: '#3B82F6' },
  { id: 'struggle', name: 'Struggle', color: '#EF4444' },
  { id: 'performance', name: 'Performance', color: '#10B981' },
  { id: 'warrior', name: 'Warrior', color: '#8B5CF6' },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <span className="text-sm text-slate-600 font-medium whitespace-nowrap">Theme:</span>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              theme === t.id
                ? 'text-white shadow-md scale-105'
                : 'bg-white border border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600'
            }`}
            style={theme === t.id ? { backgroundColor: t.color } : {}}
            title={t.name}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}

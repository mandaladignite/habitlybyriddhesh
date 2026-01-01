'use client'

import { DayCell } from './DayCell'
import { getDaysInMonth, getStartOfMonth } from '@/lib/utils'
import { format } from 'date-fns'
import { Edit } from 'lucide-react'

interface Habit {
  id: string
  name: string
  emoji: string
  targetTime?: string
  weeklyTarget?: number
  monthlyTarget?: number
  entries: { date: Date; completed: boolean }[]
}

interface HabitRowProps {
  habit: Habit
  selectedMonth: Date
  onToggleEntry: (habitId: string, date: Date) => void
  onDelete: (habitId: string) => void
  onEdit?: (habit: Habit) => void
}

export function HabitRow({ habit, selectedMonth, onToggleEntry, onDelete, onEdit }: HabitRowProps) {
  const startOfMonth = getStartOfMonth(selectedMonth)
  const daysInMonth = getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth())
  const today = new Date()
  const todayDay = today.getMonth() === selectedMonth.getMonth() && 
                    today.getFullYear() === selectedMonth.getFullYear()
                    ? today.getDate() - 1
                    : -1

  const completedCount = habit.entries.filter(e => e.completed).length
  const completionPercentage = Math.round((completedCount / daysInMonth) * 100)

  const getEntryForDate = (day: number) => {
    const date = new Date(startOfMonth)
    date.setDate(day + 1)
    const entry = habit.entries.find(
      e => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    return entry?.completed || false
  }

  return (
    <div className="flex items-center gap-2 py-3 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[200px] flex-shrink-0">
        <span className="text-lg sm:text-xl">{habit.emoji}</span>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{habit.name}</span>
          {habit.targetTime && (
            <span className="text-xs text-slate-500">{habit.targetTime}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-0.5 sm:gap-1 flex-1 overflow-x-auto">
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const date = new Date(startOfMonth)
          date.setDate(dayIndex + 1)
          return (
            <DayCell
              key={dayIndex}
              date={date}
              completed={getEntryForDate(dayIndex)}
              onClick={() => onToggleEntry(habit.id, date)}
              isTodayColumn={dayIndex === todayDay}
            />
          )
        })}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 min-w-[80px] sm:min-w-[120px] justify-end flex-shrink-0">
        <span className="text-xs sm:text-sm text-slate-600 font-semibold">{completionPercentage}%</span>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="text-slate-400 hover:text-blue-500 transition-colors text-xs sm:text-sm px-1"
              title="Edit habit"
            >
              <Edit size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(habit.id)}
            className="text-slate-400 hover:text-red-500 transition-colors text-xs sm:text-sm px-1 font-bold"
            title="Delete habit"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

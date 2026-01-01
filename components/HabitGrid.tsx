'use client'

import { HabitRow } from './HabitRow'
import { getDaysInMonth, getStartOfMonth, formatMonthYear } from '@/lib/utils'

interface Habit {
  id: string
  name: string
  emoji: string
  targetTime?: string
  weeklyTarget?: number
  monthlyTarget?: number
  entries: { date: Date; completed: boolean }[]
}

interface HabitGridProps {
  habits: Habit[]
  selectedMonth: Date
  onToggleEntry: (habitId: string, date: Date) => void
  onDeleteHabit: (habitId: string) => void
  onEditHabit?: (habit: Habit) => void
}

export function HabitGrid({ habits, selectedMonth, onToggleEntry, onDeleteHabit, onEditHabit }: HabitGridProps) {
  const daysInMonth = getDaysInMonth(selectedMonth.getFullYear(), selectedMonth.getMonth())
  const startOfMonth = getStartOfMonth(selectedMonth)
  const today = new Date()
  const todayDay = today.getMonth() === selectedMonth.getMonth() && 
                    today.getFullYear() === selectedMonth.getFullYear()
                    ? today.getDate() - 1
                    : -1

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 overflow-x-auto">
      <div className="mb-4 min-w-[600px] sm:min-w-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-slate-300 rounded-lg bg-slate-50"></div>
            <span>Not completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-600 rounded-lg"></div>
            <span>Completed</span>
          </div>
          {todayDay >= 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-500 rounded-lg ring-1 ring-amber-500"></div>
              <span>Today</span>
            </div>
          )}
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-slate-500 min-w-[600px] sm:min-w-0">
          <p className="text-base sm:text-lg mb-2 font-medium">No habits yet</p>
          <p className="text-xs sm:text-sm">Add your first habit to get started!</p>
        </div>
      ) : (
        <>
          <div className="mb-4 pb-3 border-b border-slate-200 min-w-[600px] sm:min-w-0">
            <div className="flex items-center gap-2">
              <div className="min-w-[120px] sm:min-w-[200px] font-semibold text-xs sm:text-sm text-slate-700">Habit</div>
              <div className="flex-1 flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-7 sm:w-9 text-center text-[10px] sm:text-xs text-slate-600 font-semibold flex-shrink-0"
                  >
                    {dayIndex + 1}
                  </div>
                ))}
              </div>
              <div className="min-w-[80px] sm:min-w-[120px] text-right text-xs sm:text-sm text-slate-600 font-semibold">Progress</div>
            </div>
          </div>

          <div className="space-y-2 min-w-[600px] sm:min-w-0">
            {habits.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                selectedMonth={selectedMonth}
                onToggleEntry={onToggleEntry}
                onDelete={onDeleteHabit}
                onEdit={onEditHabit}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

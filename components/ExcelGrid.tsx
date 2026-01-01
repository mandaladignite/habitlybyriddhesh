'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

interface Habit {
  id: string
  name: string
  emoji: string
  targetTime?: string
  entries: { date: Date; completed: boolean }[]
}

interface ExcelGridProps {
  habits: Habit[]
  selectedMonth: Date
  onToggleEntry: (habitId: string, date: Date) => void
  onDeleteHabit: (habitId: string) => void
}

export function ExcelGrid({ habits, selectedMonth, onToggleEntry, onDeleteHabit }: ExcelGridProps) {
  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getCompletionStatus = (habit: Habit, day: Date) => {
    const entry = habit.entries.find(e => isSameDay(e.date, day))
    return entry?.completed || false
  }

  const getDayNumber = (day: Date) => day.getDate()

  const getWeekNumber = (day: Date) => {
    const firstDayOfMonth = startOfMonth(selectedMonth)
    const dayOffset = Math.floor((day.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
    return Math.floor(dayOffset / 7) + 1
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Excel-style header */}
      <div className="bg-muted/50 border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Excel-Style Habit Tracker</h3>
        <p className="text-sm text-muted-foreground">
          {format(selectedMonth, 'MMMM yyyy')} - Click cells to mark habits complete
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header row with day numbers */}
          <thead>
            <tr className="bg-muted/30">
              <th className="sticky left-0 bg-muted/30 p-3 text-left text-xs font-medium text-muted-foreground border-r border-border">
                HABITS
              </th>
              {days.map((day, index) => (
                <th 
                  key={day.toISOString()}
                  className={`p-2 text-center text-xs font-medium ${
                    isToday(day) 
                      ? 'text-amber-600 bg-amber-50' 
                      : 'text-muted-foreground'
                  } min-w-[40px]`}
                >
                  <div>{getDayNumber(day)}</div>
                  {index % 7 === 0 && (
                    <div className="text-xs text-blue-600 font-semibold">
                      W{getWeekNumber(day)}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {habits.map((habit, habitIndex) => (
              <motion.tr
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: habitIndex * 0.05 }}
                className="border-b border-border hover:bg-muted/20 transition-colors"
              >
                {/* Habit name cell */}
                <td className="sticky left-0 bg-card p-3 border-r border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.emoji}</span>
                    <div>
                      <div className="font-medium text-foreground text-sm">{habit.name}</div>
                      {habit.targetTime && (
                        <div className="text-xs text-muted-foreground">{habit.targetTime}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Day cells */}
                {days.map((day) => {
                  const isCompleted = getCompletionStatus(habit, day)
                  const isTodayCell = isToday(day)
                  
                  return (
                    <td 
                      key={day.toISOString()}
                      className={`p-1 text-center border-r border-border last:border-r-0 ${
                        isTodayCell ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <button
                        onClick={() => onToggleEntry(habit.id, day)}
                        className={`w-8 h-8 rounded-md border-2 transition-all text-xs font-medium ${
                          isCompleted
                            ? 'bg-green-500 border-green-600 text-white hover:bg-green-600'
                            : isTodayCell
                            ? 'border-amber-400 hover:bg-amber-100 text-amber-700'
                            : 'border-border hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? '✓' : ''}
                      </button>
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Excel-style summary row */}
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Total Habits</div>
            <div className="font-semibold text-foreground">{habits.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Days in Month</div>
            <div className="font-semibold text-foreground">{days.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Possible</div>
            <div className="font-semibold text-foreground">{habits.length * days.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Completion Rate</div>
            <div className="font-semibold text-green-600">
              {habits.length > 0 
                ? Math.round(
                    (habits.reduce((sum, habit) => 
                      sum + habit.entries.filter(e => e.completed).length, 0
                    ) / (habits.length * days.length)) * 100
                  )
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">No habits yet</p>
          <p className="text-sm">Add your first habit to start tracking</p>
        </div>
      )}
    </div>
  )
}

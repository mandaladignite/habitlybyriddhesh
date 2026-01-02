'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle, Minus } from 'lucide-react'
import { IHabit } from '@/types/models'
import { ISubTaskLog, IHabitProgress } from '@/models/SubTask'

interface ExcelTrackerProps {
  habits: IHabit[]
  progressData: IHabitProgress[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onHabitClick: (habitId: string) => void
}

export default function ExcelTracker({
  habits,
  progressData,
  currentDate,
  onDateChange,
  onHabitClick
}: ExcelTrackerProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  // Generate date range
  const getDateRange = () => {
    const dates = []
    const start = new Date(currentDate)
    
    if (viewMode === 'week') {
      // Get start of week (Sunday)
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date)
      }
    } else {
      // Get start of month
      start.setDate(1)
      const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0)
      
      for (let i = 0; i < endOfMonth.getDate(); i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date)
      }
    }
    
    return dates
  }

  const dates = getDateRange()

  // Navigate dates
  const navigateDates = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    onDateChange(newDate)
  }

  // Get progress for habit on specific date
  const getProgressForDate = (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return progressData.find(p => 
      p.habitId.toString() === habitId && 
      p.date.toISOString().split('T')[0] === dateStr
    )
  }

  // Get cell status and styling
  const getCellStatus = (progress?: IHabitProgress) => {
    if (!progress) {
      return { status: 'empty', icon: Circle, color: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-400' }
    }

    if (progress.isCompleted) {
      return { 
        status: 'completed', 
        icon: CheckCircle2, 
        color: 'bg-green-100 dark:bg-green-900', 
        textColor: 'text-green-600 dark:text-green-400',
        tooltip: `Completed: ${progress.completedSubTasks}/${progress.totalSubTasks} sub-tasks`
      }
    }

    if (progress.completionPercentage > 0) {
      return { 
        status: 'partial', 
        icon: Minus, 
        color: 'bg-yellow-100 dark:bg-yellow-900', 
        textColor: 'text-yellow-600 dark:text-yellow-400',
        tooltip: `Progress: ${progress.completionPercentage}% (${progress.completedSubTasks}/${progress.totalSubTasks})`
      }
    }

    return { 
      status: 'not_started', 
      icon: Circle, 
      color: 'bg-gray-100 dark:bg-gray-800', 
      textColor: 'text-gray-400',
      tooltip: 'Not started'
    }
  }

  const formatDayHeader = (date: Date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if (viewMode === 'week') {
      return {
        day: dayNames[date.getDay()],
        date: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString()
      }
    } else {
      return {
        day: monthNames[date.getMonth()],
        date: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString()
      }
    }
  }

  const getWeekSummary = (habitId: string) => {
    const weekProgress = progressData.filter(p => 
      p.habitId.toString() === habitId &&
      dates.some(date => p.date.toDateString() === date.toDateString())
    )
    
    const completed = weekProgress.filter(p => p.isCompleted).length
    const total = dates.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {viewMode === 'week' ? 'Weekly' : 'Monthly'} Tracker
            </h3>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDates('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric',
                  ...(viewMode === 'week' && { day: 'numeric' })
                })}
              </span>
            </div>
            
            <button
              onClick={() => navigateDates('next')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Date Headers */}
        <div className="grid grid-cols-8 gap-2 text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Habit
          </div>
          {dates.map((date, index) => {
            const header = formatDayHeader(date)
            return (
              <div
                key={index}
                className={`text-center ${
                  header.isToday ? 'bg-blue-100 dark:bg-blue-900 rounded-lg' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {header.day}
                </div>
                <div className={`text-sm font-bold ${
                  header.isToday 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {header.date}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tracker Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {habits.map((habit, habitIndex) => {
            const weekSummary = getWeekSummary(habit._id.toString())
            
            return (
              <motion.div
                key={habit._id.toString()}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: habitIndex * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="grid grid-cols-8 gap-2 p-3 items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  {/* Habit Name */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.emoji}</span>
                    <div>
                      <button
                        onClick={() => onHabitClick(habit._id.toString())}
                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                      >
                        {habit.name}
                      </button>
                      {habit.hasSubTasks && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {weekSummary.completed}/{weekSummary.total} ({weekSummary.percentage}%)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date Cells */}
                  {dates.map((date, dateIndex) => {
                    const progress = getProgressForDate(habit._id.toString(), date)
                    const cellStatus = getCellStatus(progress)
                    const StatusIcon = cellStatus.icon

                    return (
                      <div
                        key={dateIndex}
                        className="flex justify-center"
                        title={cellStatus.tooltip}
                      >
                        <button
                          onClick={() => onHabitClick(habit._id.toString())}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${cellStatus.color} ${cellStatus.textColor}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}

          {habits.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>No habits to track</p>
              <p className="text-sm">Create your first habit to see progress</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-yellow-600" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span>Not Started</span>
          </div>
        </div>
      </div>
    </div>
  )
}

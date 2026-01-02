'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  CheckCircle2, 
  Circle, 
  Minus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react'
import { IHabit } from '@/types/models'
import { ISubTask, ISubTaskLog, IHabitProgress } from '@/models/SubTask'

interface SubTaskProgressProps {
  habits: IHabit[]
  subTasks: ISubTask[]
  progressData: IHabitProgress[]
  subTaskLogs: ISubTaskLog[]
}

export default function SubTaskProgress({
  habits,
  subTasks,
  progressData,
  subTaskLogs
}: SubTaskProgressProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [selectedHabit, setSelectedHabit] = useState<string>('all')

  // Get date range based on view mode
  const getDateRange = () => {
    const dates = []
    const start = new Date(currentDate)
    
    if (viewMode === 'day') {
      dates.push(new Date(start))
    } else if (viewMode === 'week') {
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        dates.push(date)
      }
    } else {
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
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
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
        textColor: 'text-green-600 dark:text-green-400'
      }
    }

    if (progress.completionPercentage > 0) {
      return { 
        status: 'partial', 
        icon: Minus, 
        color: 'bg-yellow-100 dark:bg-yellow-900', 
        textColor: 'text-yellow-600 dark:text-yellow-400'
      }
    }

    return { 
      status: 'not_started', 
      icon: Circle, 
      color: 'bg-gray-100 dark:bg-gray-800', 
      textColor: 'text-gray-400'
    }
  }

  // Calculate statistics
  const calculateStats = () => {
    const filteredHabits = selectedHabit === 'all' 
      ? habits.filter(h => h.hasSubTasks)
      : habits.filter(h => h._id.toString() === selectedHabit && h.hasSubTasks)

    const totalDays = dates.length
    const totalPossible = filteredHabits.length * totalDays
    let completed = 0
    let partial = 0
    let notStarted = 0

    dates.forEach(date => {
      filteredHabits.forEach(habit => {
        const progress = getProgressForDate(habit._id.toString(), date)
        if (progress) {
          if (progress.isCompleted) completed++
          else if (progress.completionPercentage > 0) partial++
          else notStarted++
        } else {
          notStarted++
        }
      })
    })

    const completionRate = totalPossible > 0 ? (completed / totalPossible) * 100 : 0

    return {
      totalPossible,
      completed,
      partial,
      notStarted,
      completionRate: Math.round(completionRate)
    }
  }

  const stats = calculateStats()

  // Get habit info
  const getHabitInfo = (habitId: string) => {
    const habit = habits.find(h => h._id.toString() === habitId)
    return habit || { name: 'Unknown Habit', emoji: '❓' }
  }

  const formatDayHeader = (date: Date) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    if (viewMode === 'day') {
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: date.getDate(),
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        isToday: date.toDateString() === new Date().toDateString()
      }
    } else if (viewMode === 'week') {
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

  const filteredHabits = selectedHabit === 'all' 
    ? habits.filter(h => h.hasSubTasks)
    : habits.filter(h => h._id.toString() === selectedHabit && h.hasSubTasks)

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* View Mode */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Progress Tracker
            </h2>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Day
              </button>
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

          {/* Habit Filter */}
          <select
            value={selectedHabit}
            onChange={(e) => setSelectedHabit(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="all">All Habits with Sub-tasks</option>
            {habits.filter(h => h.hasSubTasks).map(habit => (
              <option key={habit._id.toString()} value={habit._id.toString()}>
                {habit.emoji} {habit.name}
              </option>
            ))}
          </select>

          {/* Date Navigation */}
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
                  ...(viewMode === 'day' && { day: 'numeric' })
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Possible</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPossible}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Minus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Partial</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.partial}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Progress Overview
          </h3>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Date Headers */}
            <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
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

            {/* Habit Rows */}
            {filteredHabits.map((habit, habitIndex) => {
              const habitInfo = getHabitInfo(habit._id.toString())
              
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
                      <span className="text-lg">{habitInfo.emoji}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {habitInfo.name}
                      </span>
                    </div>

                    {/* Date Cells */}
                    {dates.map((date, dateIndex) => {
                      const progress = getProgressForDate(habit._id.toString(), date)
                      const cellStatus = getCellStatus(progress)
                      const StatusIcon = cellStatus.icon

                      return (
                        <div key={dateIndex} className="flex justify-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${cellStatus.color} ${cellStatus.textColor}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}

            {filteredHabits.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No habits with sub-tasks found</p>
                <p className="text-sm">Enable sub-tasks for your habits to see progress</p>
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
    </div>
  )
}

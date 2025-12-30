'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { HabitGrid } from '@/components/HabitGrid'
import { AddHabitModal } from '@/components/AddHabitModal'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { ExportButton } from '@/components/ExportButton'
import { ProgressBar } from '@/components/ProgressBar'
import { PerformanceChart } from '@/components/PerformanceChart'
import { useAppStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Plus, TrendingUp, Calendar } from 'lucide-react'
import { formatMonthYear, getStartOfMonth } from '@/lib/utils'
import { format, addMonths, subMonths } from 'date-fns'
import { motion } from 'framer-motion'

interface Habit {
  id: string
  name: string
  emoji: string
  entries: { date: Date; completed: boolean }[]
}

interface AnalyticsData {
  daily: Array<{ date: string; completed: number; total: number; percentage: number }>
  weekly: Array<{ week: number; completed: number; total: number; percentage: number }>
}

export function TrackerContent() {
  const { selectedMonth, setSelectedMonth, isAddHabitModalOpen, setIsAddHabitModalOpen } = useAppStore()
  const [habits, setHabits] = useState<Habit[]>([])
  const [reflection, setReflection] = useState('')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
    fetchReflection()
    fetchAnalytics()
  }, [selectedMonth])

  const fetchHabits = async () => {
    try {
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      const res = await fetch(`/api/habits?archived=false&month=${month}&year=${year}`)
      const data = await res.json()
      
      const habitsWithEntries = data.map((habit: Habit & { entries: any[] }) => ({
        ...habit,
        entries: habit.entries?.map((e: { date: string; completed: boolean }) => ({
          date: new Date(e.date),
          completed: e.completed,
        })) || [],
      }))
      
      setHabits(habitsWithEntries)
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      const res = await fetch(`/api/analytics?month=${month}&year=${year}`)
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchReflection = async () => {
    try {
      const res = await fetch(
        `/api/reflections?year=${selectedMonth.getFullYear()}&month=${selectedMonth.getMonth() + 1}`
      )
      const data = await res.json()
      setReflection(data.content || '')
    } catch (error) {
      console.error('Error fetching reflection:', error)
    }
  }

  const handleToggleEntry = async (habitId: string, date: Date) => {
    try {
      const completed = !habits
        .find((h) => h.id === habitId)
        ?.entries.find((e) => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))?.completed

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date: date.toISOString(),
          completed,
        }),
      })

      if (res.ok) {
        fetchHabits()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error toggling entry:', error)
    }
  }

  const handleAddHabit = async (name: string, emoji: string) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emoji }),
      })

      if (res.ok) {
        fetchHabits()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      const res = await fetch(`/api/habits?id=${habitId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchHabits()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleReflectionChange = async (content: string) => {
    setReflection(content)
    
    setTimeout(async () => {
      try {
        await fetch('/api/reflections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: selectedMonth.getFullYear(),
            month: selectedMonth.getMonth() + 1,
            content,
          }),
        })
      } catch (error) {
        console.error('Error saving reflection:', error)
      }
    }, 1000)
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading tracker...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {formatMonthYear(selectedMonth)}
                </h1>
                <p className="text-slate-600 text-sm">
                  Track your daily habits and build consistency
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeSwitcher />
              <ExportButton elementId="habit-tracker-export" filename="habit-tracker" />
              <button
                onClick={() => setIsAddHabitModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Habit</span>
              </button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors border border-slate-200"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </motion.div>

        {/* Performance Chart */}
        {analytics && analytics.daily.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Performance Trend
              </h2>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px] sm:min-w-0">
                <PerformanceChart data={analytics.daily} type="area" height={200} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Habit Grid */}
        <div id="habit-tracker-export">
          <HabitGrid
            habits={habits}
            selectedMonth={selectedMonth}
            onToggleEntry={handleToggleEntry}
            onDeleteHabit={handleDeleteHabit}
          />
        </div>

        {/* Weekly Summary */}
        {analytics && analytics.weekly.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-6"
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
              Weekly Summary
            </h3>
            <div className="space-y-4">
              {analytics.weekly.map((week) => (
                <div key={week.week}>
                  <ProgressBar
                    percentage={week.percentage}
                    label={`Week ${week.week} (${week.completed}/${week.total} completed)`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reflection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
            Monthly Reflection
          </h3>
          <textarea
            value={reflection}
            onChange={(e) => handleReflectionChange(e.target.value)}
            placeholder="What worked this month? What would you like to improve next month?"
            className="w-full min-h-[120px] px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-800 placeholder-slate-400 text-sm sm:text-base"
          />
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Your reflection is saved automatically
          </p>
        </motion.div>
      </div>

      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onAdd={handleAddHabit}
      />
    </div>
  )
}

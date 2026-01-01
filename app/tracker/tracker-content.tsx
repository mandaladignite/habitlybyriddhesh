'use client'

import { useEffect, useState, useCallback } from 'react'
import { Navbar } from '@/components/Navbar'
import { HabitGrid } from '@/components/HabitGrid'
import { AddHabitModal } from '@/components/AddHabitModal'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { ExportButton } from '@/components/ExportButton'
import { ProgressBar } from '@/components/ProgressBar'
import { PerformanceChart } from '@/components/PerformanceChart'
import WeeklyProgress from '@/components/WeeklyProgress'
import MonthlyOverview from '@/components/MonthlyOverview'
import GlobalProgress from '@/components/GlobalProgress'
import { ExcelGrid } from '@/components/ExcelGrid'
import { CalendarSettings } from '@/components/CalendarSettings'
import { useAppStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Plus, TrendingUp, Calendar } from 'lucide-react'
import { formatMonthYear, getStartOfMonth } from '@/lib/utils'
import { format, addMonths, subMonths } from 'date-fns'
import { motion } from 'framer-motion'

interface Habit {
  id: string
  name: string
  emoji: string
  targetTime?: string
  weeklyTarget?: number
  monthlyTarget?: number
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
  const [viewMode, setViewMode] = useState<'default' | 'excel'>('excel') // Default to Excel view
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [togglingEntry, setTogglingEntry] = useState<string | null>(null) // Prevent double-clicks

  const fetchHabits = useCallback(async () => {
    try {
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      
      const res = await fetch(`/api/habits?archived=false&month=${month}&year=${year}`)
      
      if (!res.ok) {
        console.error('Failed to fetch habits:', res.status, res.statusText)
        setHabits([])
        return
      }
      
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
      setHabits([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedMonth])

  const fetchAnalytics = useCallback(async () => {
    try {
      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()
      
      const res = await fetch(`/api/analytics?month=${month}&year=${year}`)
      
      if (!res.ok) {
        console.error('Failed to fetch analytics:', res.status, res.statusText)
        setAnalytics(null)
        return
      }
      
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setAnalytics(null)
    }
  }, [selectedMonth])

  const fetchReflection = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reflections?year=${selectedMonth.getFullYear()}&month=${selectedMonth.getMonth() + 1}`
      )
      
      if (!res.ok) {
        console.error('Failed to fetch reflection:', res.status, res.statusText)
        setReflection('')
        return
      }
      
      const data = await res.json()
      setReflection(data.content || '')
    } catch (error) {
      console.error('Error fetching reflection:', error)
      setReflection('')
    }
  }, [selectedMonth])

  useEffect(() => {
    fetchHabits()
    fetchReflection()
    fetchAnalytics()
  }, [selectedMonth]) // Only depend on selectedMonth, not the fetch functions

  const handleToggleEntry = useCallback(async (habitId: string, date: Date) => {
    // Prevent multiple simultaneous toggles
    const toggleKey = `${habitId}-${format(date, 'yyyy-MM-dd')}`
    if (togglingEntry === toggleKey) return
    
    setTogglingEntry(toggleKey)
    
    try {
      const currentEntry = habits
        .find((h) => h.id === habitId)
        ?.entries.find((e) => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      
      const completed = !currentEntry?.completed

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
        const result = await res.json()
        
        // Optimistically update UI
        setHabits(prevHabits => 
          prevHabits.map(habit => {
            if (habit.id === habitId) {
              if (completed) {
                // If checking, add or update the entry
                const existingEntry = habit.entries.find(e => 
                  format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                )
                
                if (existingEntry) {
                  return {
                    ...habit,
                    entries: habit.entries.map(e => 
                      format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        ? { ...e, completed }
                        : e
                    )
                  }
                } else {
                  return {
                    ...habit,
                    entries: [...habit.entries, { date, completed }]
                  }
                }
              } else {
                // If unchecking, remove the entry entirely
                return {
                  ...habit,
                  entries: habit.entries.filter(e => 
                    format(e.date, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
                  )
                }
              }
            }
            return habit
          })
        )
        
        // Only fetch analytics, not habits (to preserve optimistic update)
        fetchAnalytics()
      } else {
        // If API call failed, refresh habits to get correct state
        fetchHabits()
      }
    } catch (error) {
      console.error('Error toggling entry:', error)
      // On error, refresh habits to get correct state
      fetchHabits()
    } finally {
      setTogglingEntry(null)
    }
  }, [habits, togglingEntry, fetchAnalytics])

  const handleAddHabit = async (name: string, emoji: string, targetTime?: string, weeklyTarget?: number, monthlyTarget?: number) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          emoji, 
          targetTime, 
          weeklyTarget: weeklyTarget || 7, 
          monthlyTarget: monthlyTarget || 30 
        }),
      })

      if (res.ok) {
        fetchHabits()
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  const handleEditHabit = async (id: string, name: string, emoji: string, targetTime?: string, weeklyTarget?: number, monthlyTarget?: number) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          name, 
          emoji, 
          targetTime, 
          weeklyTarget: weeklyTarget || 7, 
          monthlyTarget: monthlyTarget || 30 
        }),
      })

      if (res.ok) {
        fetchHabits()
        fetchAnalytics()
        setEditingHabit(null)
        setIsAddHabitModalOpen(false)
      }
    } catch (error) {
      console.error('Error editing habit:', error)
    }
  }

  const handleStartEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setIsAddHabitModalOpen(true)
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
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('excel')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'excel' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Excel View
                </button>
                <button
                  onClick={() => setViewMode('default')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'default' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Default View
                </button>
              </div>
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

        {/* Excel-inspired Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MonthlyOverview />
          <WeeklyProgress />
        </div>

        {/* Calendar Settings */}
        <CalendarSettings
          selectedYear={selectedMonth.getFullYear()}
          selectedMonth={selectedMonth.getMonth() + 1}
          onYearChange={(year) => setSelectedMonth(new Date(year, selectedMonth.getMonth()))}
          onMonthChange={(month) => setSelectedMonth(new Date(selectedMonth.getFullYear(), month - 1))}
        />

        {/* Global Progress */}
        <GlobalProgress />

        {/* Habit Grid - Excel or Default View */}
        <div id="habit-tracker-export" className="mb-6">
          {viewMode === 'excel' ? (
            <ExcelGrid
              habits={habits}
              selectedMonth={selectedMonth}
              onToggleEntry={handleToggleEntry}
              onDeleteHabit={handleDeleteHabit}
              onEditHabit={handleStartEdit}
              togglingEntry={togglingEntry}
            />
          ) : (
            <HabitGrid
              habits={habits}
              selectedMonth={selectedMonth}
              onToggleEntry={handleToggleEntry}
              onDeleteHabit={handleDeleteHabit}
              onEditHabit={handleStartEdit}
            />
          )}
        </div>

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
        onClose={() => {
          setIsAddHabitModalOpen(false)
          setEditingHabit(null)
        }}
        onAdd={handleAddHabit}
        onEdit={handleEditHabit}
        editingHabit={editingHabit || undefined}
      />
    </div>
  )
}

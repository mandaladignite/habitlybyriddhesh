'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns'

interface WeeklyProgressData {
  habitId: string
  habitName: string
  habitEmoji: string
  completed: number
  target: number
  percentage: number
  ratio: string
}

interface WeeklyProgressResponse {
  weekStart: string
  weekEnd: string
  data: WeeklyProgressData[]
}

export default function WeeklyProgress() {
  const [progressData, setProgressData] = useState<WeeklyProgressData[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [loading, setLoading] = useState(true)

  const fetchWeeklyProgress = async (weekStart: Date) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/progress/weekly?weekStart=${weekStart.toISOString()}`)
      if (response.ok) {
        const data: WeeklyProgressResponse = await response.json()
        setProgressData(data.data)
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyProgress(currentWeekStart)
  }, [currentWeekStart])

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' 
      ? subWeeks(currentWeekStart, 1)
      : addWeeks(currentWeekStart, 1)
    setCurrentWeekStart(newWeekStart)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-500'
    if (percentage >= 80) return 'text-blue-500'
    if (percentage >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Weekly Progress</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-muted-foreground min-w-[120px] text-center">
            {format(currentWeekStart, 'MMM d')} - {format(addWeeks(currentWeekStart, 1).setDate(0), 'MMM d')}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {progressData.map((item, index) => (
          <motion.div
            key={item.habitId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.habitEmoji}</span>
              <span className="font-medium text-foreground">{item.habitName}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Excel-style ratio */}
              <div className="text-right">
                <div className={`font-mono font-semibold ${getProgressColor(item.percentage)}`}>
                  {item.ratio}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.percentage}%
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {progressData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No habits tracked for this week
        </div>
      )}
    </div>
  )
}

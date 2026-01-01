'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface GlobalProgressData {
  totalHabits: number
  completedToday: number
  completedThisWeek: number
  completedThisMonth: number
  weeklyTarget: number
  monthlyTarget: number
  weeklyPercentage: number
  monthlyPercentage: number
  topHabits: Array<{
    name: string
    emoji: string
    completed: number
    total: number
    percentage: number
  }>
}

export default function GlobalProgress() {
  const [progressData, setProgressData] = useState<GlobalProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchGlobalProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/progress/global')
      if (response.ok) {
        const data: GlobalProgressData = await response.json()
        setProgressData(data)
      }
    } catch (error) {
      console.error('Error fetching global progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalProgress()
  }, [])

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="text-center py-8 text-muted-foreground">
          No progress data available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Global Progress</h3>
        <div className="text-sm text-muted-foreground">
          {format(new Date(), 'MMMM yyyy')}
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-foreground">{progressData.totalHabits}</div>
          <div className="text-xs text-muted-foreground">Total Habits</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/50 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-green-500">{progressData.completedToday}</div>
          <div className="text-xs text-muted-foreground">Completed Today</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-muted/50 rounded-lg p-4 text-center"
        >
          <div className={`text-2xl font-bold ${getProgressColor(progressData.weeklyPercentage)}`}>
            {progressData.completedThisWeek}/{progressData.weeklyTarget}
          </div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-lg p-4 text-center"
        >
          <div className={`text-2xl font-bold ${getProgressColor(progressData.monthlyPercentage)}`}>
            {progressData.completedThisMonth}/{progressData.monthlyTarget}
          </div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </motion.div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className={`font-semibold ${getProgressColor(progressData.weeklyPercentage)}`}>
              {progressData.weeklyPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                progressData.weeklyPercentage >= 100 
                  ? 'bg-green-500' 
                  : progressData.weeklyPercentage >= 80
                  ? 'bg-blue-500'
                  : progressData.weeklyPercentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressData.weeklyPercentage, 100)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Monthly Progress</span>
            <span className={`font-semibold ${getProgressColor(progressData.monthlyPercentage)}`}>
              {progressData.monthlyPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                progressData.monthlyPercentage >= 100 
                  ? 'bg-green-500' 
                  : progressData.monthlyPercentage >= 80
                  ? 'bg-blue-500'
                  : progressData.monthlyPercentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressData.monthlyPercentage, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Top Performing Habits */}
      {progressData.topHabits.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Top Performing Habits</h4>
          <div className="space-y-2">
            {progressData.topHabits.slice(0, 5).map((habit, index) => (
              <motion.div
                key={habit.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{habit.emoji}</span>
                  <span className="text-sm text-foreground">{habit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono font-semibold ${getProgressColor(habit.percentage)}`}>
                    {habit.completed}/{habit.total}
                  </span>
                  <span className={`text-xs font-semibold ${getProgressColor(habit.percentage)}`}>
                    {habit.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

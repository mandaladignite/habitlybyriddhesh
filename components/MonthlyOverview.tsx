'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subMonths, addMonths } from 'date-fns'

interface MonthlyOverviewData {
  year: number
  month: number
  monthName: string
  completed: number
  target: number
  left: number
  percentage: number
}

export default function MonthlyOverview() {
  const [overviewData, setOverviewData] = useState<MonthlyOverviewData | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const fetchMonthlyOverview = async (date: Date) => {
    try {
      setLoading(true)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 1-12
      
      const response = await fetch(`/api/progress/monthly?year=${year}&month=${month}`)
      if (response.ok) {
        const data: MonthlyOverviewData = await response.json()
        setOverviewData(data)
      }
    } catch (error) {
      console.error('Error fetching monthly overview:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthlyOverview(currentDate)
  }, [currentDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1)
    setCurrentDate(newDate)
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
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="text-center py-8 text-muted-foreground">
          No data available for this month
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Monthly Overview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            {overviewData.monthName} {overviewData.year}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Excel-style statistics cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
        >
          <div className="text-sm text-green-600 font-medium mb-1">COMPLETED</div>
          <div className="text-2xl font-bold text-green-500">{overviewData.completed}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <div className="text-sm text-blue-600 font-medium mb-1">TARGET</div>
          <div className="text-2xl font-bold text-blue-500">{overviewData.target}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
        >
          <div className="text-sm text-orange-600 font-medium mb-1">LEFT</div>
          <div className="text-2xl font-bold text-orange-500">{overviewData.left}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`border rounded-lg p-4 ${
            overviewData.percentage >= 100 
              ? 'bg-green-500/10 border-green-500/20' 
              : overviewData.percentage >= 80
              ? 'bg-blue-500/10 border-blue-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            overviewData.percentage >= 100 
              ? 'text-green-600' 
              : overviewData.percentage >= 80
              ? 'text-blue-600'
              : 'text-red-600'
          }`}>
            PROGRESS
          </div>
          <div className={`text-2xl font-bold ${getProgressColor(overviewData.percentage)}`}>
            {overviewData.percentage}%
          </div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Monthly Progress</span>
          <span>{overviewData.completed}/{overviewData.target}</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              overviewData.percentage >= 100 
                ? 'bg-green-500' 
                : overviewData.percentage >= 80
                ? 'bg-blue-500'
                : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(overviewData.percentage, 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Excel-style summary text */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {overviewData.percentage >= 100 
          ? '🎉 Excellent! You\'ve exceeded your monthly target!'
          : overviewData.percentage >= 80
          ? '👍 Great progress! Keep it up!'
          : overviewData.percentage >= 60
          ? '💪 Good effort! You can do better!'
          : '📈 Keep pushing! Every habit counts!'
        }
      </div>
    </div>
  )
}

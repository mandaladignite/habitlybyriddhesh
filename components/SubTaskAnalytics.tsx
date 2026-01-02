'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Clock, 
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { IHabit } from '@/types/models'
import { ISubTask, ISubTaskLog, IHabitProgress } from '@/models/SubTask'

interface SubTaskAnalyticsProps {
  habits: IHabit[]
  subTasks: ISubTask[]
  subTaskLogs: ISubTaskLog[]
  progressData: IHabitProgress[]
}

interface AnalyticsInsight {
  type: 'bottleneck' | 'pattern' | 'recommendation' | 'achievement'
  title: string
  description: string
  data?: any
  severity: 'low' | 'medium' | 'high'
  icon: React.ComponentType<any>
}

export default function SubTaskAnalytics({
  habits,
  subTasks,
  subTaskLogs,
  progressData
}: SubTaskAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  // Calculate analytics
  const calculateAnalytics = () => {
    const insights: AnalyticsInsight[] = []

    // Filter data by time range
    const filteredData = filterDataByTimeRange(progressData, timeRange)

    // Bottleneck Detection
    const bottlenecks = detectBottlenecks(subTasks, subTaskLogs, filteredData)
    bottlenecks.forEach(bottleneck => {
      insights.push({
        type: 'bottleneck',
        title: `Bottleneck: ${bottleneck.subTask.title}`,
        description: `Skipped ${bottleneck.skipRate}% of the time. Consider breaking it down or reducing complexity.`,
        data: bottleneck,
        severity: bottleneck.skipRate > 70 ? 'high' : bottleneck.skipRate > 50 ? 'medium' : 'low',
        icon: AlertTriangle
      })
    })

    // Pattern Detection
    const patterns = detectPatterns(subTasks, subTaskLogs, filteredData)
    patterns.forEach(pattern => {
      insights.push({
        type: 'pattern',
        title: pattern.title,
        description: pattern.description,
        data: pattern,
        severity: 'medium',
        icon: Activity
      })
    })

    // Recommendations
    const recommendations = generateRecommendations(habits, subTasks, filteredData)
    recommendations.forEach(rec => {
      insights.push({
        type: 'recommendation',
        title: rec.title,
        description: rec.description,
        data: rec,
        severity: 'low',
        icon: Target
      })
    })

    // Achievements
    const achievements = detectAchievements(habits, filteredData)
    achievements.forEach(achievement => {
      insights.push({
        type: 'achievement',
        title: achievement.title,
        description: achievement.description,
        data: achievement,
        severity: 'low',
        icon: Star
      })
    })

    return insights
  }

  const filterDataByTimeRange = (data: IHabitProgress[], range: string) => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (range) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
    }
    
    return data.filter(p => p.date >= cutoffDate)
  }

  const detectBottlenecks = (
    subTasks: ISubTask[], 
    subTaskLogs: ISubTaskLog[], 
    progressData: IHabitProgress[]
  ) => {
    const bottlenecks = []
    
    subTasks.forEach(subTask => {
      const logs = subTaskLogs.filter(log => log.subTaskId.toString() === subTask._id?.toString())
      const totalAttempts = logs.length
      const skippedCount = logs.filter(log => !log.completed).length
      const skipRate = totalAttempts > 0 ? (skippedCount / totalAttempts) * 100 : 0
      
      if (skipRate > 40) { // Only show significant bottlenecks
        bottlenecks.push({
          subTask,
          skipRate,
          totalAttempts,
          avgTimeSpent: logs.reduce((sum, log) => sum + (log.timeSpentMinutes || 0), 0) / totalAttempts
        })
      }
    })
    
    return bottlenecks.sort((a, b) => b.skipRate - a.skipRate)
  }

  const detectPatterns = (
    subTasks: ISubTask[], 
    subTaskLogs: ISubTaskLog[], 
    progressData: IHabitProgress[]
  ) => {
    const patterns = []
    
    // Time-based patterns
    const timePatterns = analyzeTimePatterns(subTaskLogs)
    if (timePatterns.length > 0) {
      patterns.push({
        title: 'Time-based Patterns',
        description: timePatterns[0].description,
        data: timePatterns
      })
    }
    
    // Sequence patterns
    const sequencePatterns = analyzeSequencePatterns(subTaskLogs)
    if (sequencePatterns.length > 0) {
      patterns.push({
        title: 'Execution Sequence',
        description: sequencePatterns[0].description,
        data: sequencePatterns
      })
    }
    
    return patterns
  }

  const analyzeTimePatterns = (logs: ISubTaskLog[]) => {
    const hourlyCompletion = new Array(24).fill(0)
    const hourlyAttempts = new Array(24).fill(0)
    
    logs.forEach(log => {
      const hour = log.date.getHours()
      hourlyAttempts[hour]++
      if (log.completed) {
        hourlyCompletion[hour]++
      }
    })
    
    const hourlyRates = hourlyCompletion.map((completed, hour) => ({
      hour,
      rate: hourlyAttempts[hour] > 0 ? (completed / hourlyAttempts[hour]) * 100 : 0,
      attempts: hourlyAttempts[hour]
    }))
    
    const peakHours = hourlyRates
      .filter(h => h.attempts >= 3) // Only consider hours with enough data
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3)
    
    if (peakHours.length > 0) {
      return [{
        description: `Best completion times: ${peakHours.map(h => `${h.hour}:00`).join(', ')}`,
        data: hourlyRates
      }]
    }
    
    return []
  }

  const analyzeSequencePatterns = (logs: ISubTaskLog[]) => {
    // Group by habit and date to analyze completion order
    const sequences: Record<string, string[]> = {}
    
    logs.forEach(log => {
      if (log.completed) {
        const key = `${log.habitId.toString()}-${log.date.toDateString()}`
        if (!sequences[key]) {
          sequences[key] = []
        }
        sequences[key].push(log.subTaskId.toString())
      }
    })
    
    // Find common sequences
    const sequenceCounts: Record<string, number> = {}
    Object.values(sequences).forEach(sequence => {
      const sequenceKey = sequence.join(' -> ')
      sequenceCounts[sequenceKey] = (sequenceCounts[sequenceKey] || 0) + 1
    })
    
    const commonSequences = Object.entries(sequenceCounts)
      .filter(([_, count]) => count >= 3) // At least 3 occurrences
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    if (commonSequences.length > 0) {
      return [{
        description: `Common completion patterns found`,
        data: commonSequences
      }]
    }
    
    return []
  }

  const generateRecommendations = (
    habits: IHabit[], 
    subTasks: ISubTask[], 
    progressData: IHabitProgress[]
  ) => {
    const recommendations = []
    
    habits.forEach(habit => {
      if (!habit.hasSubTasks) return
      
      const habitProgress = progressData.filter(p => p.habitId.toString() === habit._id.toString())
      const avgCompletion = habitProgress.length > 0 
        ? habitProgress.filter(p => p.isCompleted).length / habitProgress.length * 100 
        : 0
      
      if (avgCompletion < 50) {
        recommendations.push({
          title: `Optimize "${habit.name}"`,
          description: 'Consider switching to PERCENTAGE rule or reducing completion threshold',
          habitId: habit._id.toString(),
          currentRate: avgCompletion
        })
      }
      
      // Check if habit has too many sub-tasks
      const habitSubTasks = subTasks.filter(st => st.habitId.toString() === habit._id.toString())
      if (habitSubTasks.length > 7) {
        recommendations.push({
          title: `Simplify "${habit.name}"`,
          description: 'Consider reducing sub-tasks or grouping similar items',
          habitId: habit._id.toString(),
          subTaskCount: habitSubTasks.length
        })
      }
    })
    
    return recommendations
  }

  const detectAchievements = (habits: IHabit[], progressData: IHabitProgress[]) => {
    const achievements = []
    
    habits.forEach(habit => {
      if (!habit.hasSubTasks) return
      
      const habitProgress = progressData.filter(p => p.habitId.toString() === habit._id.toString())
      const recentProgress = habitProgress.slice(-7) // Last 7 days
      const streak = calculateStreak(recentProgress)
      
      if (streak >= 7) {
        achievements.push({
          title: `🔥 ${habit.name} - Week Streak!`,
          description: `Completed all sub-tasks for ${streak} consecutive days`,
          habitId: habit._id.toString(),
          streak
        })
      }
      
      if (streak >= 30) {
        achievements.push({
          title: `🏆 ${habit.name} - Month Master!`,
          description: `Perfect execution for ${streak} consecutive days`,
          habitId: habit._id.toString(),
          streak
        })
      }
    })
    
    return achievements
  }

  const calculateStreak = (progressData: IHabitProgress[]) => {
    let streak = 0
    const sortedData = progressData.sort((a, b) => b.date.getTime() - a.date.getTime())
    
    for (const progress of sortedData) {
      if (progress.isCompleted) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const getOverallStats = () => {
    const filteredData = filterDataByTimeRange(progressData, timeRange)
    
    const totalHabits = habits.filter(h => h.hasSubTasks).length
    const totalSubTasks = subTasks.length
    const avgCompletion = filteredData.length > 0 
      ? filteredData.reduce((sum, p) => sum + p.completionPercentage, 0) / filteredData.length 
      : 0
    
    const mostActiveDay = getMostActiveDay(filteredData)
    const averageSubTasksPerHabit = totalHabits > 0 ? totalSubTasks / totalHabits : 0
    
    return {
      totalHabits,
      totalSubTasks,
      avgCompletion: Math.round(avgCompletion),
      mostActiveDay,
      averageSubTasksPerHabit: Math.round(averageSubTasksPerHabit * 10) / 10
    }
  }

  const getMostActiveDay = (data: IHabitProgress[]) => {
    const dayCounts = new Array(7).fill(0)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    data.forEach(progress => {
      if (progress.completionPercentage > 0) {
        const day = progress.date.getDay()
        dayCounts[day]++
      }
    })
    
    const maxCount = Math.max(...dayCounts)
    const mostActiveDayIndex = dayCounts.indexOf(maxCount)
    
    return maxCount > 0 ? dayNames[mostActiveDayIndex] : 'No data'
  }

  const insights = calculateAnalytics()
  const stats = getOverallStats()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400'
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Sub-task Analytics
        </h2>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Habits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalHabits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sub-tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSubTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.avgCompletion}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most Active Day</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.mostActiveDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Insights & Recommendations
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getSeverityColor(insight.severity).split(' ')[1]} ${getSeverityColor(insight.severity).split(' ')[2]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Complete more sub-tasks to see analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

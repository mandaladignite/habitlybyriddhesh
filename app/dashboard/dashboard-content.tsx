'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { StreakBadge } from '@/components/StreakBadge'
import { PerformanceChart } from '@/components/PerformanceChart'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Calendar, Target, Trophy, TrendingUp, Sparkles, CheckCircle2, Activity } from 'lucide-react'

interface DashboardContentProps {
  userId: string
}

interface Stats {
  totalHabits: number
  currentStreak: number
  completionPercentage: number
  bestHabit: {
    name: string
    emoji: string
    completionRate: number
  } | null
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchAnalytics()
  }, [])

  const fetchStats = async () => {
    try {
      const now = new Date()
      const res = await fetch(
        `/api/stats?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
      )
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const now = new Date()
      const res = await fetch(
        `/api/analytics?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
      )
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Good {getGreeting()}, {userId ? 'there' : ''}
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
            Your daily habit tracking overview • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard
            icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Current Streak"
            value={stats?.currentStreak || 0}
            suffix="days"
            color="bg-gradient-to-br from-orange-500 to-red-500"
            trend="up"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Habits Tracked"
            value={stats?.totalHabits || 0}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Completion Rate"
            value={stats?.completionPercentage || 0}
            suffix="%"
            color="bg-gradient-to-br from-emerald-500 to-green-500"
            trend="up"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Best Habit"
            value={stats?.bestHabit?.name || 'None'}
            emoji={stats?.bestHabit?.emoji}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
            rate={stats?.bestHabit?.completionRate}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Performance Chart - Takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                      Performance Overview
                    </h2>
                    <p className="text-slate-500 text-sm">This month&apos;s habit completion rate</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <span className="text-xs text-slate-600">Completion Rate</span>
                  </div>
                </div>
              </div>
              
              {analytics && analytics.daily && analytics.daily.length > 0 ? (
                <div className="h-[280px] sm:h-[320px]">
                  <PerformanceChart 
                    data={analytics.daily} 
                    type="area" 
                    height={280}
                    colors={['#3b82f6', '#8b5cf6']}
                  />
                </div>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center">
                  <Activity className="w-16 h-16 text-slate-300 mb-4" />
                  <p className="text-slate-500">No data available yet</p>
                  <p className="text-slate-400 text-sm mt-1">Start tracking habits to see your performance</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions - Takes 1/3 on desktop */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-5 sm:p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  href="/tracker"
                  className="group flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Log Today&apos;s Habits</p>
                      <p className="text-slate-300 text-sm">Update your progress</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/habits"
                  className="group flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Manage Habits</p>
                      <p className="text-slate-300 text-sm">Add or edit habits</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/insights"
                  className="group flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">View Insights</p>
                      <p className="text-slate-300 text-sm">Detailed analytics</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to build better habits?
                </h2>
                <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
                  Consistency is key to success. Track your habits daily and watch your progress grow.
                </p>
              </div>
              <Link
                href="/tracker"
                className="group flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Open Daily Tracker</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  emoji,
  color,
  trend,
  rate,
}: {
  icon: React.ReactElement
  label: string
  value: string | number
  suffix?: string
  emoji?: string
  color: string
  trend?: 'up' | 'down' | 'neutral'
  rate?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`${color} rounded-2xl shadow-lg overflow-hidden group cursor-default`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
            {icon}
          </div>
          {emoji && (
            <span className="text-2xl sm:text-3xl opacity-80 group-hover:scale-110 transition-transform">
              {emoji}
            </span>
          )}
        </div>
        
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
          {typeof value === 'number' && typeof value !== 'string' ? value.toLocaleString() : value}
          {suffix && <span className="text-base sm:text-lg lg:text-xl ml-1 opacity-90">{suffix}</span>}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-white/90 text-sm sm:text-base">{label}</div>
          {trend && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' ? 'bg-green-500/20 text-green-100' :
              trend === 'down' ? 'bg-red-500/20 text-red-100' :
              'bg-slate-500/20 text-slate-100'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </div>
          )}
        </div>
        
        {rate && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span>Completion Rate</span>
              <span>{rate}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/60 rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
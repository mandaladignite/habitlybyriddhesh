'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react'
import { PerformanceChart } from '@/components/PerformanceChart'

export function ProgressPanel() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  return (
    <div className="p-6 space-y-6">
      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Performance Analytics</h3>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="h-64">
          <PerformanceChart data={[]} type="area" height={256} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Best Day</h4>
              <p className="text-sm text-muted-foreground">Wednesday</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">95%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Weekly Goal</h4>
              <p className="text-sm text-muted-foreground">Average target completion</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">42/49</div>
            <div className="text-sm text-muted-foreground">Habits Completed</div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Current Streak</h4>
              <p className="text-sm text-muted-foreground">Keep it going!</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">12 Days</div>
            <div className="text-sm text-muted-foreground">Personal Best</div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Monthly Trend</h4>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">+15%</div>
            <div className="text-sm text-muted-foreground">Improvement</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

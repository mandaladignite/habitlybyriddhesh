'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Target, TrendingUp, Calendar } from 'lucide-react'
import MonthlyOverview from '@/components/MonthlyOverview'
import WeeklyProgress from '@/components/WeeklyProgress'
import GlobalProgress from '@/components/GlobalProgress'

export function OverviewPanel() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <MonthlyOverview />
        <WeeklyProgress />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlobalProgress />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
            <p className="text-sm text-muted-foreground">Your habit tracking at a glance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-sm text-muted-foreground">Active Habits</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">89%</div>
            <div className="text-sm text-green-600">Completion Rate</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <LayoutDashboard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-blue-600">Day Streak</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">🔥</div>
            <div className="text-sm text-purple-600">On Fire!</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

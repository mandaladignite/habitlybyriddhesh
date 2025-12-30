'use client'

import { motion } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full font-semibold ${sizeClasses[size]}`}
    >
      <span>🔥</span>
      <span>{streak} day streak</span>
    </motion.div>
  )
}


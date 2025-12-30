'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  percentage: number
  label?: string
  showLabel?: boolean
}

export function ProgressBar({ percentage, label, showLabel = true }: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-slate-700 font-medium">{label}</span>
          <span className="text-xs sm:text-sm text-slate-600 font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        />
      </div>
    </div>
  )
}

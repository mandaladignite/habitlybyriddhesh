'use client'

import { motion } from 'framer-motion'
import { isToday, isPast } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DayCellProps {
  date: Date
  completed: boolean
  onClick: () => void
  isTodayColumn: boolean
}

export function DayCell({ date, completed, onClick, isTodayColumn }: DayCellProps) {
  const today = isToday(date)
  const past = isPast(date)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'w-7 h-7 sm:w-9 sm:h-9 rounded-lg border-2 transition-all flex items-center justify-center text-xs font-semibold',
        completed
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white shadow-md'
          : 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-400',
        today && 'ring-2 ring-amber-500 ring-offset-1 ring-offset-white',
        isTodayColumn && !completed && 'bg-blue-50/50',
        past && !completed && 'opacity-50'
      )}
      title={date.toLocaleDateString()}
    >
      {completed && '✓'}
    </motion.button>
  )
}

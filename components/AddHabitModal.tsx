'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const EMOJIS = ['✨', '🏃', '📚', '💧', '🧘', '🍎', '💤', '🎯', '📝', '🎨', '🎵', '🌱', '🔥', '💪', '🧠', '❤️']

interface AddHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, emoji: string, targetTime?: string, weeklyTarget?: number, monthlyTarget?: number) => void
}

export function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('✨')
  const [targetTime, setTargetTime] = useState('')
  const [weeklyTarget, setWeeklyTarget] = useState(7)
  const [monthlyTarget, setMonthlyTarget] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), selectedEmoji, targetTime || undefined, weeklyTarget, monthlyTarget)
      setName('')
      setSelectedEmoji('✨')
      setTargetTime('')
      setWeeklyTarget(7)
      setMonthlyTarget(30)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Add New Habit
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Wake up at 4:30AM, Drink water..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    placeholder="e.g., 4:30AM, 9:00PM"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    For time-specific habits like &quot;Wake up at 4:30AM&quot;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Weekly Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(parseInt(e.target.value) || 7)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                    />
                    <p className="mt-1 text-xs text-slate-500">Days per week</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Monthly Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                    />
                    <p className="mt-1 text-xs text-slate-500">Days per month</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Emoji
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-xl sm:text-2xl p-2 rounded-lg border-2 transition-all ${
                          selectedEmoji === emoji
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

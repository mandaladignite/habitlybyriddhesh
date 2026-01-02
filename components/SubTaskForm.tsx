'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, X, Check, AlertCircle, Clock, Target } from 'lucide-react'
import mongoose from 'mongoose'
import { IHabit } from '@/types/models'
import { ISubTask } from '@/models/SubTask'

interface SubTaskFormProps {
  subTask?: Partial<ISubTask>
  habits: IHabit[]
  onSubmit: (subTask: Partial<ISubTask>) => void
  onCancel: () => void
  isOpen: boolean
}

export default function SubTaskForm({
  subTask,
  habits,
  onSubmit,
  onCancel,
  isOpen
}: SubTaskFormProps) {
  const [formData, setFormData] = useState({
    habitId: subTask?.habitId || (habits.length > 0 ? habits[0]._id : new mongoose.Types.ObjectId()),
    title: subTask?.title || '',
    description: subTask?.description || '',
    weight: subTask?.weight || 1,
    isRequired: subTask?.isRequired ?? true,
    order: subTask?.order || 0,
    estimatedMinutes: subTask?.estimatedMinutes || 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (subTask) {
      setFormData({
        habitId: subTask.habitId || (habits.length > 0 ? habits[0]._id : new mongoose.Types.ObjectId()),
        title: subTask.title || '',
        description: subTask.description || '',
        weight: subTask.weight || 1,
        isRequired: subTask.isRequired ?? true,
        order: subTask.order || 0,
        estimatedMinutes: subTask.estimatedMinutes || 0
      })
    }
  }, [subTask, habits])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Sub-task title is required'
    }

    if (!formData.habitId) {
      newErrors.habitId = 'Please select a habit'
    }

    if (formData.weight < 1 || formData.weight > 10) {
      newErrors.weight = 'Weight must be between 1 and 10'
    }

    if (formData.estimatedMinutes < 0) {
      newErrors.estimatedMinutes = 'Time estimate must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit({
      ...formData,
      habitId: formData.habitId,
      updatedAt: new Date()
    })
  }

  const getSelectedHabit = () => {
    return habits.find(h => h._id.toString() === formData.habitId.toString())
  }

  const selectedHabit = getSelectedHabit()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {subTask?._id ? 'Edit Sub-Task' : 'Create Sub-Task'}
                </h2>
                <button
                  onClick={onCancel}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Habit Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parent Habit *
                </label>
                <select
                  value={formData.habitId.toString()}
                  onChange={(e) => setFormData({ ...formData, habitId: new mongoose.Types.ObjectId(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  required
                >
                  <option value="">Select a habit...</option>
                  {habits.map(habit => (
                    <option key={habit._id.toString()} value={habit._id.toString()}>
                      {habit.emoji} {habit.name}
                    </option>
                  ))}
                </select>
                {errors.habitId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.habitId}
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sub-Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="e.g., Watch tutorial video, Take notes, Practice exercises"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="Add more details about this sub-task..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Higher weight = more importance (for POINTS rule)
                    </p>
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.weight}
                      </p>
                    )}
                  </div>

                  {/* Time Estimate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Estimate (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional: Estimated time to complete
                    </p>
                    {errors.estimatedMinutes && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.estimatedMinutes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRequired}
                        onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Required Sub-Task
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Must be completed for ALL rule to pass
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Display order (0 = first)
                  </p>
                </div>
              </div>

              {/* Habit Info */}
              {selectedHabit && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{selectedHabit.emoji}</span>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        {selectedHabit.name}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Progress Rule: {selectedHabit.progressRule || 'PERCENTAGE'}
                        {selectedHabit.progressRule === 'PERCENTAGE' && ` (${selectedHabit.completionThreshold || 70}% threshold)`}
                        {selectedHabit.progressRule === 'POINTS' && ` (${selectedHabit.completionThreshold || 70}% points threshold)`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>This sub-task will contribute to the habit's overall progress</span>
                    </div>
                    {formData.estimatedMinutes > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Estimated time: {formData.estimatedMinutes} minutes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {subTask?._id ? 'Update Sub-Task' : 'Create Sub-Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

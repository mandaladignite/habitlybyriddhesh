'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Settings, X, Check, AlertCircle } from 'lucide-react'
import mongoose from 'mongoose'
import { IHabit, ProgressRule } from '@/types/models'
import { ISubTask } from '@/models/SubTask'

interface HabitFormProps {
  habit?: Partial<IHabit>
  subTasks?: ISubTask[]
  onSave: (habit: Partial<IHabit>, subTasks: ISubTask[]) => void
  onCancel: () => void
  isOpen: boolean
}

export default function HabitForm({
  habit,
  subTasks = [],
  onSave,
  onCancel,
  isOpen
}: HabitFormProps) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    emoji: habit?.emoji || '✨',
    frequency: habit?.frequency || 'daily',
    hasSubTasks: habit?.hasSubTasks || false,
    progressRule: habit?.progressRule || 'PERCENTAGE',
    completionThreshold: habit?.completionThreshold || 70
  })

  const [subTasksData, setSubTasksData] = useState<ISubTask[]>(subTasks)
  const [newSubTask, setNewSubTask] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.name.trim()) {
      return
    }

    if (formData.hasSubTasks && subTasksData.length === 0) {
      return
    }

    onSave(formData, subTasksData)
  }

  const addSubTask = () => {
    if (!newSubTask.trim()) return

    const newSubTaskData: ISubTask = {
      habitId: habit?._id || new mongoose.Types.ObjectId(),
      title: newSubTask.trim(),
      weight: 1,
      isRequired: true,
      order: subTasksData.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setSubTasksData([...subTasksData, newSubTaskData])
    setNewSubTask('')
  }

  const updateSubTask = (index: number, updates: Partial<ISubTask>) => {
    const updated = [...subTasksData]
    updated[index] = { ...updated[index], ...updates }
    setSubTasksData(updated)
  }

  const deleteSubTask = (index: number) => {
    setSubTasksData(subTasksData.filter((_, i) => i !== index))
  }

  const getRuleDescription = () => {
    switch (formData.progressRule) {
      case 'ALL':
        return 'All required sub-tasks must be completed'
      case 'PERCENTAGE':
        return `${formData.completionThreshold}% of sub-tasks must be completed`
      case 'POINTS':
        return `${formData.completionThreshold}% of total points must be earned`
      default:
        return ''
    }
  }

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
                  {habit?._id ? 'Edit Habit' : 'Create Habit'}
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
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    placeholder="e.g., Morning Exercise, Read Books"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="✨"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-tasks Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasSubTasks}
                        onChange={(e) => setFormData({ ...formData, hasSubTasks: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Enable Sub-tasks
                      </span>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Break down habits into smaller, manageable steps
                    </p>
                  </div>
                </div>

                {/* Sub-tasks Configuration */}
                {formData.hasSubTasks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pl-7"
                  >
                    {/* Progress Rule */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Progress Rule
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'ALL', label: 'All required sub-tasks', description: 'Best for routines and fixed processes' },
                          { value: 'PERCENTAGE', label: 'Percentage-based', description: 'Most flexible, recommended default' },
                          { value: 'POINTS', label: 'Weighted points', description: 'Advanced, for learning and projects' }
                        ].map((rule) => (
                          <label key={rule.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <input
                              type="radio"
                              name="progressRule"
                              value={rule.value}
                              checked={formData.progressRule === rule.value}
                              onChange={(e) => setFormData({ ...formData, progressRule: e.target.value as ProgressRule })}
                              className="w-4 h-4 text-blue-600 mt-1"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {rule.label}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {rule.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Completion Threshold */}
                    {formData.progressRule !== 'ALL' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Completion Threshold: {formData.completionThreshold}%
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={formData.completionThreshold}
                          onChange={(e) => setFormData({ ...formData, completionThreshold: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1%</span>
                          <span>{formData.completionThreshold}%</span>
                          <span>100%</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {getRuleDescription()}
                        </p>
                      </div>
                    )}

                    {/* Sub-tasks List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sub-tasks
                      </label>
                      
                      {/* Add Sub-task */}
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newSubTask}
                          onChange={(e) => setNewSubTask(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubTask())}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                          placeholder="Add a sub-task..."
                        />
                        <button
                          type="button"
                          onClick={addSubTask}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sub-tasks */}
                      <div className="space-y-2">
                        {subTasksData.map((subTask, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <input
                              type="text"
                              value={subTask.title}
                              onChange={(e) => updateSubTask(index, { title: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                              placeholder="Sub-task title"
                            />

                            {formData.progressRule === 'POINTS' && (
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={subTask.weight}
                                onChange={(e) => updateSubTask(index, { weight: parseInt(e.target.value) || 1 })}
                                className="w-16 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 text-center"
                                title="Weight"
                              />
                            )}

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={subTask.isRequired}
                                onChange={(e) => updateSubTask(index, { isRequired: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Required</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => deleteSubTask(index)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {subTasksData.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No sub-tasks added yet</p>
                            <p className="text-sm">Add sub-tasks to track progress in detail</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {habit?._id ? 'Update Habit' : 'Create Habit'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

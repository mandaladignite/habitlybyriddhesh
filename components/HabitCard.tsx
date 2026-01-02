'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Settings, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle,
  GripVertical,
  Edit2,
  Trash2,
  Star
} from 'lucide-react'
import { IHabit, ProgressRule } from '@/types/models'
import { ISubTask, ISubTaskLog } from '@/models/SubTask'
import { ProgressCalculator, ProgressCalculation } from '@/lib/progressCalculator'

interface HabitCardProps {
  habit: IHabit
  subTasks?: ISubTask[]
  todayLogs?: ISubTaskLog[]
  progress?: ProgressCalculation
  onToggleExpand?: () => void
  onEditHabit?: (habit: IHabit) => void
  onSubTaskToggle?: (subTaskId: string, completed: boolean) => void
  onEditSubTask?: (subTask: ISubTask) => void
  onDeleteSubTask?: (subTaskId: string) => void
  isExpanded?: boolean
}

export default function HabitCard({
  habit,
  subTasks = [],
  todayLogs = [],
  progress,
  onToggleExpand,
  onEditHabit,
  onSubTaskToggle,
  onEditSubTask,
  onDeleteSubTask,
  isExpanded = false
}: HabitCardProps) {
  const [isExpandedInternal, setIsExpandedInternal] = useState(isExpanded)
  const [isEditingSubTask, setIsEditingSubTask] = useState<string | null>(null)

  // Calculate progress if not provided
  useEffect(() => {
    if (!progress && subTasks.length > 0) {
      // This would be calculated server-side in real implementation
      // ProgressCalculator.calculateProgress(habit, subTasks, todayLogs)
    }
  }, [habit, subTasks, todayLogs, progress])

  const handleExpand = () => {
    const newExpanded = !isExpandedInternal
    setIsExpandedInternal(newExpanded)
    onToggleExpand?.()
  }

  const getProgressColor = () => {
    if (!progress) return 'bg-gray-500'
    if (progress.isCompleted) return 'bg-green-500'
    if (progress.completionPercentage > 0) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const getProgressStatus = () => {
    if (!progress) return { icon: Circle, color: 'text-gray-500', label: 'Not Started' }
    return ProgressCalculator.getProgressStatus(progress)
  }

  const progressStatus = getProgressStatus()
  const StatusIcon = progressStatus.icon || Circle

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Main Habit Row */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={handleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Habit Icon and Name */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{habit.emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {habit.name}
                </h3>
                {habit.hasSubTasks && progress && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {progress.completedSubTasks}/{progress.totalSubTasks} sub-tasks
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar for Sub-tasks */}
            {habit.hasSubTasks && progress && (
              <div className="flex-1 max-w-xs mx-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor()} transition-all duration-300`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[3rem]">
                    {progress.completionPercentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Status Icon */}
            <StatusIcon className={`w-5 h-5 ${progressStatus.color}`} />
          </div>

          {/* Expand/Collapse Icon */}
          <div className="flex items-center gap-2">
            {onEditHabit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditHabit(habit)
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {habit.hasSubTasks && (
              <motion.div
                animate={{ rotate: isExpandedInternal ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Sub-task View */}
      <AnimatePresence>
        {isExpandedInternal && habit.hasSubTasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-750">
              {/* Progress Summary */}
              {progress && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Today's Progress
                    </h4>
                    <span className={`text-sm font-medium ${progressStatus.color}`}>
                      {progressStatus.label}
                    </span>
                  </div>
                  
                  {/* Progress Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {progress.completedSubTasks}/{progress.totalSubTasks} ({progress.completionPercentage}%)
                      </span>
                    </div>
                    
                    {habit.progressRule === 'POINTS' && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Points:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {progress.earnedPoints}/{progress.totalPoints}
                        </span>
                      </div>
                    )}
                    
                    {habit.progressRule === 'ALL' && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Required:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                          {progress.completedRequired}/{progress.totalRequired}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rule Info */}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Rule: {habit.progressRule} 
                    {habit.progressRule === 'PERCENTAGE' && ` (≥${habit.completionThreshold}% to complete)`}
                    {habit.progressRule === 'POINTS' && ` (≥${habit.completionThreshold}% points to complete)`}
                  </div>
                </div>
              )}

              {/* Sub-tasks List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Sub-tasks
                  </h4>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Sub-task
                  </button>
                </div>

                {subTasks.map((subTask) => {
                  const log = todayLogs.find(l => l.subTaskId.toString() === subTask._id?.toString())
                  const isCompleted = log?.completed || false
                  const isEditing = isEditingSubTask === subTask._id?.toString()

                  return (
                    <motion.div
                      key={subTask._id?.toString()}
                      layout
                      className={`p-3 bg-white dark:bg-gray-800 rounded-lg border ${
                        isCompleted 
                          ? 'border-green-200 dark:border-green-800' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={subTask.title}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            placeholder="Sub-task title"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsEditingSubTask(null)}
                              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => setIsEditingSubTask(null)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {/* Drag Handle */}
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

                          {/* Checkbox */}
                          <button
                            onClick={() => onSubTaskToggle?.(subTask._id?.toString() || '', !isCompleted)}
                            className="flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>

                          {/* Sub-task Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                isCompleted 
                                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {subTask.title}
                              </span>
                              
                              {/* Required Badge */}
                              {subTask.isRequired && (
                                <Star className="w-3 h-3 text-yellow-500" title="Required" />
                              )}
                              
                              {/* Weight Badge */}
                              {habit.progressRule === 'POINTS' && subTask.weight > 1 && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                  {subTask.weight}pt
                                </span>
                              )}

                              {/* Time Estimate */}
                              {subTask.estimatedMinutes && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {subTask.estimatedMinutes}m
                                </div>
                              )}
                            </div>
                            
                            {subTask.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {subTask.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {onEditSubTask && (
                              <button
                                onClick={() => setIsEditingSubTask(subTask._id?.toString() || '')}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                            {onDeleteSubTask && (
                              <button
                                onClick={() => onDeleteSubTask(subTask._id?.toString() || '')}
                                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {subTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No sub-tasks yet</p>
                    <p className="text-sm">Add sub-tasks to track progress in detail</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

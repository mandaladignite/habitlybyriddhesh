'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Star, 
  Edit2, 
  Trash2, 
  GripVertical,
  Calendar,
  Target,
  Timer
} from 'lucide-react'
import { IHabit } from '@/types/models'
import { ISubTask, ISubTaskLog, IHabitProgress } from '@/models/SubTask'

interface SubTaskListProps {
  subTasks: ISubTask[]
  layoutMode: 'grid' | 'list'
  onEdit: (subTask: ISubTask) => void
  onDelete: (id: string) => void
  onToggle: (id: string, completed: boolean) => void
  subTaskLogs: ISubTaskLog[]
  progressData: IHabitProgress[]
}

export default function SubTaskList({
  subTasks,
  layoutMode,
  onEdit,
  onDelete,
  onToggle,
  subTaskLogs,
  progressData
}: SubTaskListProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Get today's completion status for each sub-task
  const getTodayStatus = (subTaskId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const todayLog = subTaskLogs.find(log => 
      log.subTaskId.toString() === subTaskId &&
      log.date.toISOString().split('T')[0] === today
    )
    return {
      completed: todayLog?.completed || false,
      completedAt: todayLog?.completedAt,
      timeSpent: todayLog?.timeSpentMinutes
    }
  }

  // Get habit info for sub-task
  const getHabitInfo = (habitId: string) => {
    // This would come from props or context in real implementation
    // For now, return mock data
    return {
      name: 'Sample Habit',
      emoji: '✨',
      progressRule: 'PERCENTAGE'
    }
  }

  const renderSubTaskCard = (subTask: ISubTask) => {
    const status = getTodayStatus(subTask._id?.toString() || '')
    const habitInfo = getHabitInfo(subTask.habitId.toString())
    const isCompleted = status.completed

    return (
      <motion.div
        key={subTask._id?.toString()}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all ${
          isCompleted 
            ? 'border-green-200 dark:border-green-800 shadow-green-100 dark:shadow-green-900' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } shadow-sm hover:shadow-md`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Drag Handle */}
              <div className="flex items-center justify-center mt-1">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              </div>

              {/* Checkbox */}
              <button
                onClick={() => onToggle(subTask._id?.toString() || '', !isCompleted)}
                className="flex-shrink-0 mt-1"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold text-lg ${
                    isCompleted 
                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {subTask.title}
                  </h3>
                  
                  {/* Required Badge */}
                  {subTask.isRequired && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                      <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        Required
                      </span>
                    </div>
                  )}

                  {/* Weight Badge */}
                  {subTask.weight > 1 && (
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        {subTask.weight}pt
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {subTask.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {subTask.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {/* Habit Reference */}
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{habitInfo.emoji}</span>
                    <span>{habitInfo.name}</span>
                  </div>

                  {/* Time Estimate */}
                  {subTask.estimatedMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{subTask.estimatedMinutes} min</span>
                    </div>
                  )}

                  {/* Time Spent */}
                  {status.timeSpent && (
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      <span>{status.timeSpent} min spent</span>
                    </div>
                  )}

                  {/* Completion Time */}
                  {status.completedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {status.completedAt.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(subTask)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(subTask._id?.toString() || '')}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Progress Bar (if applicable) */}
          {isCompleted && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-600"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Completed
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderListItem = (subTask: ISubTask) => {
    const status = getTodayStatus(subTask._id?.toString() || '')
    const habitInfo = getHabitInfo(subTask.habitId.toString())
    const isCompleted = status.completed

    return (
      <motion.div
        key={subTask._id?.toString()}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
          isCompleted 
            ? 'border-green-200 dark:border-green-800' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Drag Handle */}
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />

            {/* Checkbox */}
            <button
              onClick={() => onToggle(subTask._id?.toString() || '', !isCompleted)}
              className="flex-shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${
                  isCompleted 
                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {subTask.title}
                </h3>
                
                {/* Badges */}
                <div className="flex items-center gap-2">
                  {subTask.isRequired && (
                    <Star className="w-3 h-3 text-yellow-500" />
                  )}
                  {subTask.weight > 1 && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                      {subTask.weight}pt
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {subTask.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {subTask.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span>{habitInfo.emoji}</span>
                  {habitInfo.name}
                </span>
                {subTask.estimatedMinutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {subTask.estimatedMinutes}m
                  </span>
                )}
                {status.timeSpent && (
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {status.timeSpent}m
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(subTask)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit2 className="w-3 h-3 text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(subTask._id?.toString() || '')}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (subTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No sub-tasks found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first sub-task to get started
        </p>
      </div>
    )
  }

  return (
    <div>
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subTasks.map(renderSubTaskCard)}
        </div>
      ) : (
        <div className="space-y-3">
          {subTasks.map(renderListItem)}
        </div>
      )}
    </div>
  )
}

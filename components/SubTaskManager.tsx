'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react'
import { IHabit } from '@/types/models'
import { ISubTask, ISubTaskLog, IHabitProgress } from '@/models/SubTask'
import SubTaskList from './SubTaskList'
import SubTaskProgress from './SubTaskProgress'
import SubTaskAnalyticsSimple from './SubTaskAnalyticsSimple'
import SubTaskForm from './SubTaskForm'

interface SubTaskManagerProps {
  habits: IHabit[]
  subTasks: ISubTask[]
  subTaskLogs: ISubTaskLog[]
  progressData: IHabitProgress[]
  onSubTaskCreate: (subTask: Partial<ISubTask>) => void
  onSubTaskUpdate: (id: string, updates: Partial<ISubTask>) => void
  onSubTaskDelete: (id: string) => void
  onSubTaskToggle: (id: string, completed: boolean) => void
}

type ViewMode = 'list' | 'progress' | 'analytics'
type LayoutMode = 'grid' | 'list'

export default function SubTaskManager({
  habits,
  subTasks,
  subTaskLogs,
  progressData,
  onSubTaskCreate,
  onSubTaskUpdate,
  onSubTaskDelete,
  onSubTaskToggle
}: SubTaskManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHabit, setSelectedHabit] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingSubTask, setEditingSubTask] = useState<ISubTask | null>(null)

  // Filter sub-tasks based on search and habit selection
  const filteredSubTasks = subTasks.filter(subTask => {
    const matchesSearch = subTask.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subTask.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesHabit = selectedHabit === 'all' || 
                        subTask.habitId.toString() === selectedHabit
    return matchesSearch && matchesHabit
  })

  // Get today's progress
  const today = new Date().toISOString().split('T')[0]
  const todayProgress = progressData.filter(p => 
    p.date.toISOString().split('T')[0] === today
  )

  // Calculate stats
  const stats = {
    totalSubTasks: subTasks.length,
    completedToday: todayProgress.filter(p => p.isCompleted).length,
    inProgress: todayProgress.filter(p => p.completionPercentage > 0 && !p.isCompleted).length,
    notStarted: subTasks.length - todayProgress.length
  }

  const handleSubTaskSubmit = (subTaskData: Partial<ISubTask>) => {
    if (editingSubTask) {
      onSubTaskUpdate(editingSubTask._id?.toString() || '', subTaskData)
      setEditingSubTask(null)
    } else {
      onSubTaskCreate(subTaskData)
    }
    setShowForm(false)
  }

  const handleEditSubTask = (subTask: ISubTask) => {
    setEditingSubTask(subTask)
    setShowForm(true)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <SubTaskList
            subTasks={filteredSubTasks}
            layoutMode={layoutMode}
            onEdit={handleEditSubTask}
            onDelete={onSubTaskDelete}
            onToggle={onSubTaskToggle}
            subTaskLogs={subTaskLogs}
            progressData={progressData}
          />
        )
      case 'progress':
        return (
          <SubTaskProgress
            habits={habits}
            subTasks={subTasks}
            progressData={progressData}
            subTaskLogs={subTaskLogs}
          />
        )
      case 'analytics':
        return (
          <SubTaskAnalyticsSimple
            habits={habits}
            subTasks={subTasks}
            subTaskLogs={subTaskLogs}
            progressData={progressData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Sub-Task Manager
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage and track detailed sub-tasks for your habits
                </p>
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sub-Task
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sub-tasks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSubTasks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completedToday}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                    <Circle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Not Started</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.notStarted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sub-tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                />
              </div>

              {/* Habit Filter */}
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="all">All Habits</option>
                {habits.map(habit => (
                  <option key={habit._id.toString()} value={habit._id.toString()}>
                    {habit.emoji} {habit.name}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('progress')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'progress'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'analytics'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Layout Mode (only for list view) */}
              {viewMode === 'list' && (
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      layoutMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      layoutMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </div>

      {/* Sub-Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <SubTaskForm
            subTask={editingSubTask}
            habits={habits}
            onSubmit={handleSubTaskSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingSubTask(null)
            }}
            isOpen={showForm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

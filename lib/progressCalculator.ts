import mongoose from 'mongoose'
import { ISubTask, ISubTaskLog, IHabitProgress, ProgressRule } from '@/models/SubTask'
import { IHabit } from '@/types/models'

export interface ProgressCalculation {
  completionPercentage: number
  isCompleted: boolean
  totalSubTasks: number
  completedSubTasks: number
  totalPoints: number
  earnedPoints: number
  completedRequired: number
  totalRequired: number
  breakdown: SubTaskBreakdown[]
}

export interface SubTaskBreakdown {
  subTaskId: string
  title: string
  weight: number
  isRequired: boolean
  completed: boolean
  contribution: number // How much this contributes to total progress
}

export class ProgressCalculator {
  /**
   * Calculate habit progress based on sub-task completion
   */
  static async calculateProgress(
    habit: IHabit,
    subTasks: ISubTask[],
    subTaskLogs: ISubTaskLog[],
    date: Date = new Date()
  ): Promise<ProgressCalculation> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get logs for today
    const todayLogs = subTaskLogs.filter(log => 
      log.date >= startOfDay && log.date <= endOfDay
    )

    // Create breakdown
    const breakdown: SubTaskBreakdown[] = subTasks.map(subTask => {
      const log = todayLogs.find(l => l.subTaskId.toString() === (subTask._id?.toString() || ''))
      const completed = log?.completed || false
      
      return {
        subTaskId: subTask._id?.toString() || '',
        title: subTask.title,
        weight: subTask.weight,
        isRequired: subTask.isRequired,
        completed,
        contribution: this.calculateContribution(subTask, subTasks.length)
      }
    })

    // Calculate totals
    const totalSubTasks = subTasks.length
    const completedSubTasks = breakdown.filter(st => st.completed).length
    const totalRequired = subTasks.filter(st => st.isRequired).length
    const completedRequired = breakdown.filter(st => st.isRequired && st.completed).length
    const totalPoints = subTasks.reduce((sum, st) => sum + st.weight, 0)
    const earnedPoints = breakdown
      .filter(st => st.completed)
      .reduce((sum, st) => sum + st.weight, 0)

    // Calculate completion based on rule
    let completionPercentage = 0
    let isCompleted = false

    switch (habit.progressRule) {
      case 'ALL':
        // All required sub-tasks must be completed
        completionPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0
        isCompleted = completedRequired === totalRequired && totalRequired > 0
        break

      case 'PERCENTAGE':
        // Percentage of all sub-tasks completed
        completionPercentage = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0
        isCompleted = completionPercentage >= habit.completionThreshold
        break

      case 'POINTS':
        // Weighted points system
        completionPercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
        isCompleted = completionPercentage >= habit.completionThreshold
        break
    }

    return {
      completionPercentage: Math.round(completionPercentage),
      isCompleted,
      totalSubTasks,
      completedSubTasks,
      totalPoints,
      earnedPoints,
      completedRequired,
      totalRequired,
      breakdown
    }
  }

  /**
   * Calculate individual sub-task contribution to total progress
   */
  private static calculateContribution(subTask: ISubTask, totalSubTasks: number): number {
    if (totalSubTasks === 0) return 0
    
    // For percentage-based: equal contribution
    // For points-based: weight-based contribution
    // This is a simplified calculation - actual contribution depends on the rule
    return (1 / totalSubTasks) * 100
  }

  /**
   * Get progress status for UI display
   */
  static getProgressStatus(calculation: ProgressCalculation): {
    status: 'completed' | 'partial' | 'not_started'
    color: string
    label: string
    description: string
  } {
    if (calculation.isCompleted) {
      return {
        status: 'completed',
        color: 'text-green-500',
        label: 'Completed',
        description: `${calculation.completedSubTasks}/${calculation.totalSubTasks} sub-tasks done`
      }
    } else if (calculation.completionPercentage > 0) {
      return {
        status: 'partial',
        color: 'text-yellow-500',
        label: 'In Progress',
        description: `${calculation.completionPercentage}% complete`
      }
    } else {
      return {
        status: 'not_started',
        color: 'text-gray-500',
        label: 'Not Started',
        description: 'No sub-tasks completed yet'
      }
    }
  }

  /**
   * Generate insights about sub-task completion patterns
   */
  static generateInsights(
    habit: IHabit,
    recentProgress: IHabitProgress[],
    subTasks: ISubTask[]
  ): {
    mostSkipped: { subTask: ISubTask; skipRate: number }[]
    bottlenecks: { subTask: ISubTask; avgCompletionTime: number }[]
    recommendations: string[]
  } {
    // Analyze skip rates (would need more historical data)
    const mostSkipped: { subTask: ISubTask; skipRate: number }[] = []
    
    // Analyze bottlenecks (time-consuming sub-tasks)
    const bottlenecks: { subTask: ISubTask; avgCompletionTime: number }[] = subTasks
      .filter(st => st.estimatedMinutes && st.estimatedMinutes > 30)
      .map(st => ({ subTask: st, avgCompletionTime: st.estimatedMinutes || 0 }))
      .sort((a, b) => b.avgCompletionTime - a.avgCompletionTime)

    // Generate recommendations
    const recommendations: string[] = []

    if (bottlenecks.length > 0) {
      recommendations.push(`Consider breaking down "${bottlenecks[0].subTask.title}" into smaller steps`)
    }

    if (habit.progressRule === 'ALL' && subTasks.filter(st => st.isRequired).length > 3) {
      recommendations.push('Consider switching to PERCENTAGE rule for more flexibility')
    }

    if (subTasks.length > 5) {
      recommendations.push('You have many sub-tasks. Consider focusing on the most important ones first')
    }

    return {
      mostSkipped,
      bottlenecks,
      recommendations
    }
  }

  /**
   * Validate progress rule configuration
   */
  static validateProgressRule(
    rule: ProgressRule,
    completionThreshold: number,
    subTasks: ISubTask[]
  ): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate threshold
    if (completionThreshold < 1 || completionThreshold > 100) {
      errors.push('Completion threshold must be between 1 and 100')
    }

    // Rule-specific validations
    switch (rule) {
      case 'ALL':
        if (subTasks.filter(st => st.isRequired).length === 0) {
          warnings.push('No required sub-tasks found. ALL rule may not be appropriate')
        }
        break

      case 'PERCENTAGE':
        if (completionThreshold < 50) {
          warnings.push('Low completion threshold may lead to inconsistent habits')
        }
        break

      case 'POINTS':
        if (subTasks.every(st => st.weight === 1)) {
          warnings.push('All sub-tasks have equal weight. Consider PERCENTAGE rule instead')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Simulate progress with different completion scenarios
   */
  static simulateProgress(
    habit: IHabit,
    subTasks: ISubTask[],
    completedSubTaskIds: string[]
  ): Promise<ProgressCalculation> {
    const mockLogs: ISubTaskLog[] = completedSubTaskIds.map((subTaskId, index) => ({
      subTaskId: new mongoose.Types.ObjectId(subTaskId),
      habitId: habit._id,
      userId: habit.userId,
      date: new Date(),
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    return this.calculateProgress(habit, subTasks, mockLogs)
  }
}

import mongoose, { Schema, Model } from 'mongoose'

// Sub-task interface
export interface ISubTask {
  _id?: mongoose.Types.ObjectId
  habitId: mongoose.Types.ObjectId
  title: string
  description?: string
  weight: number // importance (default = 1)
  isRequired: boolean
  order: number // for drag & reorder
  estimatedMinutes?: number // optional time estimate
  createdAt: Date
  updatedAt: Date
}

// Sub-task log interface
export interface ISubTaskLog {
  _id?: mongoose.Types.ObjectId
  subTaskId: mongoose.Types.ObjectId
  habitId: mongoose.Types.ObjectId
  userId: string
  date: Date
  completed: boolean
  completedAt?: Date
  timeSpentMinutes?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Progress calculation strategies
export type ProgressRule = 'ALL' | 'PERCENTAGE' | 'POINTS'

// Habit progress interface
export interface IHabitProgress {
  habitId: mongoose.Types.ObjectId
  userId: string
  date: Date
  completionPercentage: number // 0-100
  isCompleted: boolean
  totalSubTasks: number
  completedSubTasks: number
  totalPoints: number
  earnedPoints: number
  calculationRule: ProgressRule
  updatedAt: Date
}

// SubTask Schema
const SubTaskSchema = new Schema<ISubTask>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    weight: { type: Number, default: 1, min: 1, max: 10 },
    isRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, min: 1, max: 480 } // max 8 hours
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Indexes for performance
SubTaskSchema.index({ habitId: 1, order: 1 })
SubTaskSchema.index({ habitId: 1, isRequired: 1 })

// SubTaskLog Schema
const SubTaskLogSchema = new Schema<ISubTaskLog>(
  {
    subTaskId: { type: Schema.Types.ObjectId, ref: 'SubTask', required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    timeSpentMinutes: { type: Number, min: 0, max: 480 },
    notes: { type: String, trim: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Compound indexes for efficient queries
SubTaskLogSchema.index({ userId: 1, date: 1 })
SubTaskLogSchema.index({ habitId: 1, userId: 1, date: 1 })
SubTaskLogSchema.index({ subTaskId: 1, date: 1 })

// HabitProgress Schema
const HabitProgressSchema = new Schema<IHabitProgress>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    completionPercentage: { type: Number, required: true, min: 0, max: 100 },
    isCompleted: { type: Boolean, required: true, index: true },
    totalSubTasks: { type: Number, required: true, min: 0 },
    completedSubTasks: { type: Number, required: true, min: 0 },
    totalPoints: { type: Number, required: true, min: 0 },
    earnedPoints: { type: Number, required: true, min: 0 },
    calculationRule: { type: String, required: true, enum: ['ALL', 'PERCENTAGE', 'POINTS'] },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Compound indexes for progress queries
HabitProgressSchema.index({ userId: 1, date: 1 })
HabitProgressSchema.index({ habitId: 1, userId: 1, date: 1 })
HabitProgressSchema.index({ userId: 1, isCompleted: 1, date: 1 })

// Virtual for formatted completion
HabitProgressSchema.virtual('formattedProgress').get(function() {
  return `${this.completedSubTasks}/${this.totalSubTasks} (${this.completionPercentage}%)`
})

// Export models
export const SubTask: Model<ISubTask> = mongoose.models.SubTask || mongoose.model('SubTask', SubTaskSchema)
export const SubTaskLog: Model<ISubTaskLog> = mongoose.models.SubTaskLog || mongoose.model('SubTaskLog', SubTaskLogSchema)
export const HabitProgress: Model<IHabitProgress> = mongoose.models.HabitProgress || mongoose.model('HabitProgress', HabitProgressSchema)

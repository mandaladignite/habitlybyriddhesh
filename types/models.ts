import { Document, Types } from 'mongoose'

export interface IUser extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

// Progress calculation strategies
export type ProgressRule = 'ALL' | 'PERCENTAGE' | 'POINTS'

export interface IHabit extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  name: string
  emoji: string
  color?: string
  frequency: string
  targetTime?: string // For time-specific habits like "4:30AM"
  targetValue?: number // Target value for quantitative habits
  unit?: string // Unit for target values (e.g., "minutes", "hours", "km")
  weeklyTarget?: number // Target completions per week
  monthlyTarget?: number // Target completions per month
  userId: string
  archived: boolean
  // Sub-task support
  hasSubTasks: boolean
  progressRule: ProgressRule
  completionThreshold: number // For PERCENTAGE rule (default: 70)
  createdAt: Date
  updatedAt: Date
}

export interface IHabitEntry extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  habitId: string
  userId: string
  date: Date
  completed: boolean
  notes?: string
  value?: number
  createdAt: Date
  updatedAt: Date
}

export interface IMonthlyReflection extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  year: number
  month: number
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface IThemePreference extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  theme: string
  updatedAt: Date
}



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

export interface IHabit extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  name: string
  emoji: string
  color?: string
  frequency: string
  userId: string
  archived: boolean
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



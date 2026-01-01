import mongoose, { Schema, Model } from 'mongoose'
import { Document, Types } from 'mongoose'

export interface IWeeklyProgress extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  habitId: string
  weekStart: Date // Start of the week (Sunday or Monday)
  completed: number
  target: number
  percentage: number
  createdAt: Date
  updatedAt: Date
}

const WeeklyProgressSchema = new Schema<IWeeklyProgress>(
  {
    userId: { type: String, required: true, index: true },
    habitId: { type: String, required: true, index: true },
    weekStart: { type: Date, required: true, index: true },
    completed: { type: Number, required: true, default: 0 },
    target: { type: Number, required: true, default: 7 },
    percentage: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
)

WeeklyProgressSchema.index({ userId: 1, habitId: 1, weekStart: 1 }, { unique: true })
WeeklyProgressSchema.index({ userId: 1, weekStart: 1 })

const WeeklyProgress: Model<IWeeklyProgress> =
  mongoose.models.WeeklyProgress || mongoose.model<IWeeklyProgress>('WeeklyProgress', WeeklyProgressSchema)

export default WeeklyProgress

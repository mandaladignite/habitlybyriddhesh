import mongoose, { Schema, Model } from 'mongoose'
import { Document, Types } from 'mongoose'

export interface IMonthlyOverview extends Document<Types.ObjectId> {
  _id: Types.ObjectId
  userId: string
  year: number
  month: number
  completed: number // Total completed habits
  target: number // Total target habits
  left: number // Remaining target
  percentage: number // Completion percentage
  createdAt: Date
  updatedAt: Date
}

const MonthlyOverviewSchema = new Schema<IMonthlyOverview>(
  {
    userId: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    completed: { type: Number, required: true, default: 0 },
    target: { type: Number, required: true, default: 0 },
    left: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
)

MonthlyOverviewSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true })

const MonthlyOverview: Model<IMonthlyOverview> =
  mongoose.models.MonthlyOverview || mongoose.model<IMonthlyOverview>('MonthlyOverview', MonthlyOverviewSchema)

export default MonthlyOverview

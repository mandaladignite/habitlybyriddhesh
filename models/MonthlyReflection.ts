import mongoose, { Schema, Model } from 'mongoose'
import { IMonthlyReflection } from '@/types/models'

const MonthlyReflectionSchema = new Schema<IMonthlyReflection>(
  {
    userId: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    content: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

MonthlyReflectionSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true })

const MonthlyReflection: Model<IMonthlyReflection> =
  mongoose.models.MonthlyReflection ||
  mongoose.model<IMonthlyReflection>('MonthlyReflection', MonthlyReflectionSchema)

export default MonthlyReflection



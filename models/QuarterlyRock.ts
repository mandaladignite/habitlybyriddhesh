import mongoose, { Schema, Model } from 'mongoose'
import { IQuarterlyRock } from '@/types/v2-models'

const QuarterlyRockSchema = new Schema<IQuarterlyRock>(
  {
    userId: { type: String, required: true, index: true },
    northStarGoalId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    quarter: { type: String, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

QuarterlyRockSchema.index({ userId: 1, northStarGoalId: 1, quarter: 1 })
QuarterlyRockSchema.index({ userId: 1, completed: 1 })

const QuarterlyRock: Model<IQuarterlyRock> = 
  mongoose.models.QuarterlyRock || mongoose.model<IQuarterlyRock>('QuarterlyRock', QuarterlyRockSchema)

export default QuarterlyRock

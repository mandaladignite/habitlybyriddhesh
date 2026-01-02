import mongoose, { Schema, Model } from 'mongoose'
import { INorthStarGoal } from '@/types/v2-models'

const NorthStarGoalSchema = new Schema<INorthStarGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    deadline: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    alignmentScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
)

NorthStarGoalSchema.index({ userId: 1, progress: -1 })

const NorthStarGoal: Model<INorthStarGoal> = 
  mongoose.models.NorthStarGoal || mongoose.model<INorthStarGoal>('NorthStarGoal', NorthStarGoalSchema)

export default NorthStarGoal

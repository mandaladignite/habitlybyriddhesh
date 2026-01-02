import mongoose, { Schema, Model } from 'mongoose'
import { IInsight } from '@/types/v2-models'

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['leverage', 'friction', 'bias', 'pattern', 'prediction'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
    dismissed: { type: Boolean, default: false },
    actedUpon: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

InsightSchema.index({ userId: 1, priority: -1, dismissed: 1 })
InsightSchema.index({ userId: 1, type: 1, createdAt: -1 })

const Insight: Model<IInsight> = 
  mongoose.models.Insight || mongoose.model<IInsight>('Insight', InsightSchema)

export default Insight

import mongoose, { Schema, Model } from 'mongoose'
import { IExecutionQuality, IQualityFactor } from '@/types/v2-models'

const QualityFactorSchema = new Schema<IQualityFactor>({
  factor: { type: String, required: true },
  impact: { type: Number, required: true, min: -100, max: 100 },
  description: { type: String, required: true },
})

const ExecutionQualitySchema = new Schema<IExecutionQuality>(
  {
    userId: { type: String, required: true, index: true },
    systemId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    completionRate: { type: Number, required: true, min: 0, max: 100 },
    energyCost: { type: Number, required: true, min: 0, max: 100 },
    contextFit: { type: Number, required: true, min: 0, max: 100 },
    sequenceEffectiveness: { type: Number, required: true, min: 0, max: 100 },
    quality: { type: Number, required: true, min: 0, max: 100 },
    factors: [QualityFactorSchema],
  },
  {
    timestamps: true,
  }
)

ExecutionQualitySchema.index({ userId: 1, systemId: 1, date: -1 })
ExecutionQualitySchema.index({ userId: 1, date: -1 })

const ExecutionQuality: Model<IExecutionQuality> = 
  mongoose.models.ExecutionQuality || mongoose.model<IExecutionQuality>('ExecutionQuality', ExecutionQualitySchema)

export default ExecutionQuality

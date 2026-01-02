import mongoose, { Schema, Model } from 'mongoose'
import { IAdaptiveSystem, ISystemAdaptation, IFailureCondition } from '@/types/v2-models'

const SystemAdaptationSchema = new Schema<ISystemAdaptation>({
  timestamp: { type: Date, required: true },
  trigger: { type: String, required: true },
  change: { type: String, required: true },
  impact: { type: Number, required: true, min: -100, max: 100 },
})

const FailureConditionSchema = new Schema<IFailureCondition>({
  pattern: { type: String, required: true },
  threshold: { type: Number, required: true },
  action: { type: String, required: true },
  active: { type: Boolean, default: true },
})

const AdaptiveSystemSchema = new Schema<IAdaptiveSystem>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['habit', 'routine', 'process', 'strategy'] },
    effectivenessScore: { type: Number, default: 50, min: 0, max: 100 },
    frictionCoefficient: { type: Number, default: 50, min: 0, max: 100 },
    adaptationHistory: [SystemAdaptationSchema],
    failureConditions: [FailureConditionSchema],
    autoAdapt: { type: Boolean, default: true },
    locked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

AdaptiveSystemSchema.index({ userId: 1, effectivenessScore: -1 })
AdaptiveSystemSchema.index({ userId: 1, frictionCoefficient: 1 })

const AdaptiveSystem: Model<IAdaptiveSystem> = 
  mongoose.models.AdaptiveSystem || mongoose.model<IAdaptiveSystem>('AdaptiveSystem', AdaptiveSystemSchema)

export default AdaptiveSystem

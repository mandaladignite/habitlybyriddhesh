import mongoose, { Schema, Model } from 'mongoose'
import { IRecoveryProtocol, IRecoveryCondition, IRecoveryAction } from '@/types/v2-models'

const RecoveryConditionSchema = new Schema<IRecoveryCondition>({
  metric: { type: String, required: true },
  operator: { type: String, required: true, enum: ['gt', 'lt', 'eq'] },
  threshold: { type: Number, required: true },
})

const RecoveryActionSchema = new Schema<IRecoveryAction>({
  type: { type: String, required: true, enum: ['system', 'mindset', 'environment', 'schedule'] },
  description: { type: String, required: true },
  priority: { type: Number, required: true, min: 1, max: 10 },
  automated: { type: Boolean, default: false },
})

const RecoveryProtocolSchema = new Schema<IRecoveryProtocol>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    trigger: { type: String, required: true },
    conditions: [RecoveryConditionSchema],
    actions: [RecoveryActionSchema],
    effectiveness: { type: Number, default: 50, min: 0, max: 100 },
    lastUsed: { type: Date },
  },
  {
    timestamps: true,
  }
)

RecoveryProtocolSchema.index({ userId: 1, effectiveness: -1 })
RecoveryProtocolSchema.index({ userId: 1, lastUsed: -1 })

const RecoveryProtocol: Model<IRecoveryProtocol> = 
  mongoose.models.RecoveryProtocol || mongoose.model<IRecoveryProtocol>('RecoveryProtocol', RecoveryProtocolSchema)

export default RecoveryProtocol

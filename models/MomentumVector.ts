import mongoose, { Schema, Model } from 'mongoose'
import { IMomentumVector, IMomentumForecast } from '@/types/v2-models'

const MomentumForecastSchema = new Schema<IMomentumForecast>({
  date: { type: Date, required: true },
  predictedMomentum: { type: Number, required: true, min: 0, max: 100 },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  factors: [{ type: String }],
})

const MomentumVectorSchema = new Schema<IMomentumVector>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    consistencyMomentum: { type: Number, required: true, min: 0, max: 100 },
    difficultyGrowthMomentum: { type: Number, required: true, min: 0, max: 100 },
    impactMomentum: { type: Number, required: true, min: 0, max: 100 },
    learningMomentum: { type: Number, required: true, min: 0, max: 100 },
    overallMomentum: { type: Number, required: true, min: 0, max: 100 },
    direction: { type: String, required: true, enum: ['increasing', 'decreasing', 'stable'] },
    strength: { type: Number, required: true, min: 0, max: 100 },
    forecast: [MomentumForecastSchema],
  },
  {
    timestamps: true,
  }
)

MomentumVectorSchema.index({ userId: 1, date: -1 })
MomentumVectorSchema.index({ userId: 1, overallMomentum: -1 })

const MomentumVector: Model<IMomentumVector> = 
  mongoose.models.MomentumVector || mongoose.model<IMomentumVector>('MomentumVector', MomentumVectorSchema)

export default MomentumVector

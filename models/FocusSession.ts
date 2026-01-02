import mongoose, { Schema, Model } from 'mongoose'
import { IFocusSession } from '@/types/v2-models'

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date },
    mode: { type: String, required: true, enum: ['sprint', 'maintenance', 'exploration', 'recovery'] },
    energyState: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    context: { type: Schema.Types.Mixed, required: true },
    systems: [{ type: String }],
    effectiveness: { type: Number, min: 0, max: 100 },
    interruptions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

FocusSessionSchema.index({ userId: 1, startTime: -1 })
FocusSessionSchema.index({ userId: 1, mode: 1, effectiveness: -1 })

const FocusSession: Model<IFocusSession> = 
  mongoose.models.FocusSession || mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema)

export default FocusSession

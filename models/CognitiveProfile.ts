import mongoose, { Schema, Model } from 'mongoose'
import { ICognitiveProfile, IEnergyPattern, IContextPreference } from '@/types/v2-models'

const EnergyPatternSchema = new Schema<IEnergyPattern>({
  hour: { type: Number, required: true, min: 0, max: 23 },
  energyLevel: { type: Number, required: true, min: 0, max: 100 },
  focusLevel: { type: Number, required: true, min: 0, max: 100 },
  creativityLevel: { type: Number, required: true, min: 0, max: 100 },
})

const ContextPreferenceSchema = new Schema<IContextPreference>({
  context: { type: String, required: true },
  preferences: { type: Schema.Types.Mixed, required: true },
})

const CognitiveProfileSchema = new Schema<ICognitiveProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    chronotype: { type: String, required: true, enum: ['morning', 'evening', 'intermediate'] },
    workStyle: { type: String, required: true, enum: ['sprinter', 'marathoner', 'mixed'] },
    energyPatterns: [EnergyPatternSchema],
    contextPreferences: [ContextPreferenceSchema],
    cognitiveBiases: [{ type: String }],
    adaptation: { type: Number, default: 50, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
)

const CognitiveProfile: Model<ICognitiveProfile> = 
  mongoose.models.CognitiveProfile || mongoose.model<ICognitiveProfile>('CognitiveProfile', CognitiveProfileSchema)

export default CognitiveProfile

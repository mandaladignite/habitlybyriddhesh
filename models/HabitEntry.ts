import mongoose, { Schema, Model } from 'mongoose'
import { IHabitEntry } from '@/types/models'

const HabitEntrySchema = new Schema<IHabitEntry>(
  {
    habitId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String },
    value: { type: Number }, // For quantitative habits (e.g., "ran 5km")
  },
  {
    timestamps: true,
  }
)

HabitEntrySchema.index({ habitId: 1, userId: 1, date: 1 }, { unique: true })
HabitEntrySchema.index({ userId: 1, date: 1 })

const HabitEntry: Model<IHabitEntry> =
  mongoose.models.HabitEntry || mongoose.model<IHabitEntry>('HabitEntry', HabitEntrySchema)

export default HabitEntry



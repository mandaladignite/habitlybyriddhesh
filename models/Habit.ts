import mongoose, { Schema, Model } from 'mongoose'
import { IHabit } from '@/types/models'

const HabitSchema = new Schema<IHabit>(
  {
    name: { type: String, required: true },
    emoji: { type: String, default: '✨' },
    color: { type: String },
    frequency: { type: String, default: 'daily' },
    userId: { type: String, required: true, index: true },
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

HabitSchema.index({ userId: 1, archived: 1 })

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)

export default Habit



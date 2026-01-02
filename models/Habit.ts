import mongoose, { Schema, Model } from 'mongoose'
import { IHabit, ProgressRule } from '@/types/models'

const HabitSchema = new Schema<IHabit>(
  {
    name: { type: String, required: true },
    emoji: { type: String, default: '✨' },
    color: { type: String },
    frequency: { type: String, default: 'daily' },
    targetTime: { type: String }, // For time-specific habits like "4:30AM"
    targetValue: { type: Number }, // Target value for quantitative habits
    unit: { type: String }, // Unit for target values (e.g., "minutes", "hours", "km")
    weeklyTarget: { type: Number, default: 7 }, // Target completions per week
    monthlyTarget: { type: Number, default: 30 }, // Target completions per month
    userId: { type: String, required: true, index: true },
    archived: { type: Boolean, default: false },
    // Sub-task support
    hasSubTasks: { type: Boolean, default: false },
    progressRule: { 
      type: String, 
      enum: ['ALL', 'PERCENTAGE', 'POINTS'], 
      default: 'PERCENTAGE' 
    },
    completionThreshold: { type: Number, default: 70, min: 1, max: 100 } // For PERCENTAGE rule
  },
  {
    timestamps: true,
  }
)

HabitSchema.index({ userId: 1, archived: 1 })
HabitSchema.index({ userId: 1, hasSubTasks: 1 })

// Virtual for sub-tasks (populated when needed)
HabitSchema.virtual('subTasks', {
  ref: 'SubTask',
  localField: '_id',
  foreignField: 'habitId'
})

// Virtual for today's progress
HabitSchema.virtual('todayProgress', {
  ref: 'HabitProgress',
  localField: '_id',
  foreignField: 'habitId',
  match: { date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }
})

const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)

export default Habit



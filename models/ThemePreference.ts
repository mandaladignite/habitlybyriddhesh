import mongoose, { Schema, Model } from 'mongoose'
import { IThemePreference } from '@/types/models'

const ThemePreferenceSchema = new Schema<IThemePreference>(
  {
    userId: { type: String, required: true, unique: true },
    theme: { type: String, default: 'discipline' },
  },
  {
    timestamps: true,
  }
)

const ThemePreference: Model<IThemePreference> =
  mongoose.models.ThemePreference ||
  mongoose.model<IThemePreference>('ThemePreference', ThemePreferenceSchema)

export default ThemePreference



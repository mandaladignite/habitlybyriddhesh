import mongoose, { Schema, Model } from 'mongoose'
import { IUser } from '@/types/models'

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ email: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User



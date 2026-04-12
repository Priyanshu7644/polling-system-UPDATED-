import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'admin' | 'creator' | 'user';
  isVerified: boolean;
  verificationToken?: string;
  otpExpires?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, // Optional for social login
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'creator', 'user'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);

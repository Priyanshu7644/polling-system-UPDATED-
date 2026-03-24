import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  _id?: mongoose.Types.ObjectId;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  title: string;
  description?: string;
  category: string;
  creator: mongoose.Types.ObjectId;
  options: IPollOption[];
  isPublic: boolean;
  expiresAt?: Date;
  status: 'active' | 'closed';
  createdAt: Date;
}

const pollOptionSchema = new Schema<IPollOption>({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const pollSchema = new Schema<IPoll>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: 'Other',
    trim: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  options: [pollOptionSchema],
  isPublic: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  }
}, { timestamps: true });

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);

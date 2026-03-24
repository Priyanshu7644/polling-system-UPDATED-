import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  poll: mongoose.Types.ObjectId;
  optionId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
  },
  optionId: {
    type: Schema.Types.ObjectId,
    required: true,
  }
}, { timestamps: true });

// Prevent multiple votes per user per poll
voteSchema.index({ user: 1, poll: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);

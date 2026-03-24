import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  poll: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  parentId?: mongoose.Types.ObjectId | null;
  likes: mongoose.Types.ObjectId[];
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

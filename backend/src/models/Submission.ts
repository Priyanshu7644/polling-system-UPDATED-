import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  student: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  answers: number[]; // indices of selected options
  score: number;
  totalQuestions: number;
  submittedAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  answers: [{
    type: Number,
    required: true,
  }],
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

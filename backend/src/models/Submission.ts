import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  objectiveAnswer?: number; // index of selected option
  subjectiveAnswer?: string; // text response
}

export interface ISubmission extends Document {
  student: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalMarks: number;
  totalQuestions: number;
  submittedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  objectiveAnswer: { type: Number },
  subjectiveAnswer: { type: String }
}, { _id: false });

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
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalMarks: {
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

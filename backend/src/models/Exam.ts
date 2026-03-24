import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface IExam extends Document {
  title: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  questions: IQuestion[];
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true }
});

const examSchema = new Schema<IExam>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published',
  }
}, { timestamps: true });

export const Exam = mongoose.model<IExam>('Exam', examSchema);

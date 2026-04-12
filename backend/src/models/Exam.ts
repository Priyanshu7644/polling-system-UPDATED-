import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  text: string;
  type: 'objective' | 'subjective';
  options?: string[]; // Only for objective
  correctAnswer?: string; // For auto-grading or reference
  correctAnswerIndex?: number; // Only for objective
  marks: number;
}

export interface IExam extends Document {
  title: string;
  description?: string;
  teacher: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  examType: 'scheduled' | 'anytime';
  attemptsLimit: number; // 0 for unlimited
  questions: IQuestion[];
  status: 'draft' | 'published' | 'closed';
  proctoringLevel: 'none' | 'primary' | 'both';
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['objective', 'subjective'], 
    default: 'objective',
    required: true 
  },
  options: [{ type: String }],
  correctAnswer: { type: String },
  correctAnswerIndex: { type: Number },
  marks: { type: Number, default: 1 }
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
  duration: {
    type: Number,
    required: true,
    default: 60 // Default 1 hour
  },
  examType: {
    type: String,
    enum: ['scheduled', 'anytime'],
    default: 'scheduled'
  },
  attemptsLimit: {
    type: Number,
    default: 1 // 0 for unlimited
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'published',
  },
  proctoringLevel: {
    type: String,
    enum: ['none', 'primary', 'both'],
    default: 'none'
  }
}, { timestamps: true });

export const Exam = mongoose.model<IExam>('Exam', examSchema);

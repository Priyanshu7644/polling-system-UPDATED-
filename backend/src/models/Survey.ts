import mongoose, { Document, Schema } from 'mongoose';

export interface ISurveyQuestion {
  type: 'mcq' | 'text';
  text: string;
  options?: string[]; // Only for mcq
  required: boolean;
}

export interface ISurvey extends Document {
  title: string;
  description?: string;
  creator: mongoose.Types.ObjectId;
  questions: ISurveyQuestion[];
  isAnonymous: boolean;
  status: 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const surveyQuestionSchema = new Schema<ISurveyQuestion>({
  type: { type: String, enum: ['mcq', 'text'], required: true },
  text: { type: String, required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: true }
});

const surveySchema = new Schema<ISurvey>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [surveyQuestionSchema],
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['published', 'closed'], default: 'published' }
}, { timestamps: true });

export const Survey = mongoose.model<ISurvey>('Survey', surveySchema);

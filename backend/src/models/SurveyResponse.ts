import mongoose, { Document, Schema } from 'mongoose';

export interface ISurveyResponse extends Document {
  survey: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId; // Optional for anonymous surveys
  answers: any[]; // Array of answers corresponding to survey questions
  submittedAt: Date;
}

const surveyResponseSchema = new Schema<ISurveyResponse>({
  survey: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  answers: [{ type: Schema.Types.Mixed, required: true }]
}, { timestamps: true });

export const SurveyResponse = mongoose.model<ISurveyResponse>('SurveyResponse', surveyResponseSchema);

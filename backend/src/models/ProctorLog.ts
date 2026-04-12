import mongoose, { Schema } from 'mongoose';

const proctorLogSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true }, // e.g., 'tab-switch', 'camera-off', 'second-device-connected'
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const ProctorLog = mongoose.model('ProctorLog', proctorLogSchema);

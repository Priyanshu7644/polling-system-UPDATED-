import express, { Response } from 'express';
import { authMiddleware, optionalAuthMiddleware, verifiedMiddleware, AuthRequest } from '../middleware/auth';
import { Exam } from '../models/Exam';
import { Submission } from '../models/Submission';
import mongoose from 'mongoose';

const router = express.Router();

// Create Exam (Teachers only)
router.post('/', authMiddleware, verifiedMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, duration, questions, proctoringLevel, examType, attemptsLimit } = req.body;
    
    if (!title || !startTime || !endTime || !duration || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exam = new Exam({
      title,
      description,
      teacher: req.user?.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: duration || 60,
      questions,
      examType: examType || 'scheduled',
      attemptsLimit: attemptsLimit || 1,
      proctoringLevel: proctoringLevel || 'both',
      status: 'published'
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Get all published exams
router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'published' })
      .sort({ startTime: 1 })
      .populate('teacher', 'username avatar');
    
    // Strip sensitive fields
    const safeExams = exams.map(exam => {
      const examObj = exam.toObject();
      examObj.questions = examObj.questions.map((q: any) => ({
        ...q,
        correctAnswerIndex: undefined,
        correctAnswer: undefined
      }));
      return examObj;
    });

    res.json(safeExams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get specific exam
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacher', 'username avatar');
      
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const userId = req.user?.userId;
    // Check if user is the teacher (creator)
    const teacherId = exam.teacher._id ? exam.teacher._id.toString() : exam.teacher.toString();
    const isTeacher = teacherId === userId;
    const now = new Date();

    // Check if exam is within time window for students
    if (!isTeacher && exam.examType === 'scheduled' && now < exam.startTime) {
       return res.status(403).json({ 
         error: 'Exam not yet started', 
         startTime: exam.startTime 
       });
    }

    const examObj = exam.toObject() as any;
    
    // Check attempts limit
    const submissionCount = userId ? await Submission.countDocuments({ exam: req.params.id, student: userId }) : 0;
    examObj.userSubmissions = submissionCount;

    // Only allow creator to see correct answers in the detail view
    if (!isTeacher) {
      examObj.questions = examObj.questions.map((q: any) => ({
        ...q,
        correctAnswerIndex: undefined,
        correctAnswer: undefined
      }));
    }

    res.json(examObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// Submit Exam
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const { answers } = req.body; 
    const userId = req.user?.userId;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const now = new Date();
    const isTeacher = exam.teacher.toString() === userId;

    // Time window enforcement for non-teachers
    if (!isTeacher && exam.examType === 'scheduled') {
      if (now < exam.startTime) {
         return res.status(403).json({ error: 'Exam has not started yet' });
      }
      if (now.getTime() > new Date(exam.endTime).getTime() + (exam.duration * 60000) + 120000) { // 2 min grace
         return res.status(403).json({ error: 'Exam window has closed' });
      }
    }

    // Attempts limit enforcement
    if (!isTeacher && exam.attemptsLimit > 0) {
      const existingSubmissions = await Submission.countDocuments({ exam: examId, student: userId });
      if (existingSubmissions >= exam.attemptsLimit) {
        return res.status(400).json({ error: `You have reached the maximum of ${exam.attemptsLimit} attempts for this exam` });
      }
    }

    // Scoring logic (only for objective questions)
    let score = 0;
    let totalMarksPossible = 0;

    exam.questions.forEach((question) => {
      totalMarksPossible += question.marks;
      const submissionAnswer = answers.find((a: any) => a.questionId.toString() === question._id!.toString());
      
      if (question.type === 'objective' && submissionAnswer) {
        if (submissionAnswer.objectiveAnswer === question.correctAnswerIndex) {
          score += question.marks;
        }
      }
    });

    const submission = new Submission({
      student: userId,
      exam: examId,
      answers,
      score,
      totalMarks: totalMarksPossible,
      totalQuestions: exam.questions.length
    });

    await submission.save();
    res.status(201).json({ 
      message: 'Exam submitted successfully', 
      score, 
      totalMarks: totalMarksPossible,
      totalQuestions: exam.questions.length 
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// Get Exam Results (Teacher only, or Student's own)
router.get('/:id/results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const userId = req.user?.userId;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Use a robust comparison for teacher ID
    const teacherId = exam.teacher.toString();
    if (teacherId === userId) {
      const submissions = await Submission.find({ exam: examId })
        .populate('student', 'username email');
      return res.json({ submissions, isTeacher: true });
    } else {
      // If student, return their own submission
      const submission = await Submission.findOne({ exam: examId, student: userId });
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      return res.json({ submission, isTeacher: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Delete Exam (Teachers only)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const userId = req.user?.userId;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Check ownership
    if (exam.teacher.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this exam' });
    }

    await Exam.findByIdAndDelete(examId);
    // Cascade delete submissions
    await Submission.deleteMany({ exam: examId });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// Record Proctor Logs
router.post('/:id/proctor-logs', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { eventType, details } = req.body;
    const { ProctorLog } = await import('../models/ProctorLog');
    const log = new ProctorLog({
      examId: req.params.id,
      userId: req.user?.userId,
      eventType,
      details
    });
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record proctor log' });
  }
});

// Get Proctor Logs for an Exam (Teacher only)
router.get('/:id/proctor-logs', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const userId = req.user?.userId;

    const exam = await Exam.findById(examId);
    if (!exam || exam.teacher.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized view logs' });
    }

    const { ProctorLog } = await import('../models/ProctorLog');
    const logs = await ProctorLog.find({ examId }).populate('userId', 'username email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proctor logs' });
  }
});

export default router;

import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Exam } from '../models/Exam';
import { Submission } from '../models/Submission';
import mongoose from 'mongoose';

const router = express.Router();

// Create Exam (Teachers only)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startTime, endTime, questions } = req.body;
    
    // Authorization check (simplistic - usually checking user role)
    // For now, assuming anyone logged in can create (or check req.user.role if it exists)
    
    if (!title || !startTime || !endTime || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const exam = new Exam({
      title,
      description,
      teacher: req.user?.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
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
    
    // Strip correct answers for the list view
    const safeExams = exams.map(exam => {
      const examObj = exam.toObject();
      examObj.questions = examObj.questions.map((q: any) => ({
        ...q,
        correctAnswerIndex: undefined
      }));
      return examObj;
    });

    res.json(safeExams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get specific exam
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacher', 'username avatar');
      
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Hide correct answers if it's a student (not the teacher)
    // For simplicity, always hide if requesting the questions
    const examObj = exam.toObject();
    examObj.questions = examObj.questions.map((q: any) => ({
      ...q,
      correctAnswerIndex: undefined
    }));

    res.json(examObj);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// Submit Exam
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const examId = req.params.id;
    const { answers } = req.body; // Array of option indices
    const userId = req.user?.userId;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      return res.status(400).json({ error: 'Exam is not currently active' });
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({ exam: examId, student: userId });
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted this exam' });
    }

    // Scoring logic
    let score = 0;
    exam.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswerIndex) {
        score++;
      }
    });

    const submission = new Submission({
      student: userId,
      exam: examId,
      answers,
      score,
      totalQuestions: exam.questions.length
    });

    await submission.save();
    res.status(201).json({ 
      message: 'Exam submitted successfully', 
      score, 
      totalQuestions: exam.questions.length 
    });
  } catch (error) {
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

    // If teacher, return all submissions
    if (exam.teacher.toString() === userId) {
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

export default router;

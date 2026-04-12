import express, { Response } from 'express';
import { authMiddleware, verifiedMiddleware, AuthRequest } from '../middleware/auth';
import { Survey } from '../models/Survey';
import { SurveyResponse } from '../models/SurveyResponse';
import mongoose from 'mongoose';

const router = express.Router();

// Create Survey
router.post('/', authMiddleware, verifiedMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, questions, isAnonymous } = req.body;
    
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    const survey = new Survey({
      title,
      description,
      creator: req.user?.userId,
      questions,
      isAnonymous: isAnonymous || false,
      status: 'published'
    });

    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

// Get all published surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar');
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// Get specific survey
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('creator', 'username avatar');
      
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

// Submit Survey Response
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = req.params.id;
    const { answers } = req.body;
    const userId = req.user?.userId;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'closed') {
      return res.status(400).json({ error: 'Survey is closed' });
    }

    // Check if user already submitted (if not anonymous)
    if (!survey.isAnonymous) {
      const existingResponse = await SurveyResponse.findOne({ survey: surveyId, user: userId });
      if (existingResponse) {
        return res.status(400).json({ error: 'You have already submitted this survey' });
      }
    }

    const response = new SurveyResponse({
      survey: surveyId,
      user: survey.isAnonymous ? undefined : userId,
      answers
    });

    await response.save();
    res.status(201).json({ message: 'Survey submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// Get Survey Results (Creator only)
router.get('/:id/results', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = req.params.id;
    const userId = req.user?.userId;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view results' });
    }

    const responses = await SurveyResponse.find({ survey: surveyId })
      .populate('user', 'username email');
      
    res.json({ survey, responses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Delete Survey
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const surveyId = req.params.id;
    const userId = req.user?.userId;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this survey' });
    }

    await Survey.findByIdAndDelete(surveyId);
    await SurveyResponse.deleteMany({ survey: surveyId });

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

export default router;

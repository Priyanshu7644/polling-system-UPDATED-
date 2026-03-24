import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Poll } from '../models/Poll';
import { Vote } from '../models/Vote';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

const router = express.Router();

// Create Poll
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, options, category, isPublic, expiresAt } = req.body;
    
    if (!title || !options || options.length < 2) {
      return res.status(400).json({ error: 'Title and at least 2 options are required' });
    }

    const pollOptions = options.map((opt: string) => ({ text: opt, votes: 0 }));

    const poll = new Poll({
      title,
      description,
      category: category || 'Other',
      creator: req.user?.userId,
      options: pollOptions,
      isPublic: isPublic !== undefined ? isPublic : true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await poll.save();
    await poll.populate('creator', 'username avatar');
    
    // Broadcast to all clients
    const io: Server = req.app.get('io');
    if (io && poll.isPublic) {
      io.emit('newPoll', poll);
    }

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Get all public active polls
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query: any = { isPublic: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar');
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Get specific poll
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('creator', 'username avatar');
      
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// Get user's vote for a poll
router.get('/:id/my-vote', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pollId = req.params.id;
    const userId = req.user?.userId;

    const vote = await Vote.findOne({ poll: pollId, user: userId });
    if (!vote) {
      return res.json({ voted: false });
    }
    res.json({ voted: true, optionId: vote.optionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

// Vote on a poll
router.post('/:id/vote', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pollId = req.params.id;
    const { optionId } = req.body;
    const userId = req.user?.userId;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.status === 'closed' || (poll.expiresAt && new Date() > poll.expiresAt)) {
      return res.status(400).json({ error: 'Poll is closed or expired' });
    }

    // Verify new option exists
    const newOptionIndex = poll.options.findIndex(opt => opt._id?.toString() === optionId);
    if (newOptionIndex === -1) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ poll: pollId, user: userId });
    
    if (existingVote) {
      if (String(existingVote.optionId) === optionId) {
        return res.status(400).json({ error: 'You have already voted for this option' });
      }

      // Subtract from old option
      const oldOptionIndex = poll.options.findIndex(opt => opt._id?.toString() === String(existingVote.optionId));
      if (oldOptionIndex !== -1 && poll.options[oldOptionIndex].votes > 0) {
        poll.options[oldOptionIndex].votes -= 1;
      }

      // Update the vote record
      existingVote.optionId = new mongoose.Types.ObjectId(optionId) as any;
      await existingVote.save();
    } else {
      // Record new vote
      const vote = new Vote({
        poll: pollId,
        user: userId,
        optionId
      });
      await vote.save();
    }

    // Increment new option vote count
    poll.options[newOptionIndex].votes += 1;
    await poll.save();
    await poll.populate('creator', 'username avatar');

    // Emit live update via socket.io
    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`pollUpdate:${pollId}`, poll);
      
      // Also broadcast globally for lists
      await poll.populate('creator', 'username avatar');
      io.emit('pollUpdated', poll);
    }

    res.json({ message: 'Vote recorded', poll });
  } catch (error) {
    console.error('Vote Error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// Update a poll
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pollId = req.params.id;
    const { title, description, category, isPublic, status, options } = req.body;
    const userId = req.user?.userId;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check ownership
    if (poll.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this poll' });
    }

    if (title) poll.title = title;
    if (description !== undefined) poll.description = description;
    if (category) poll.category = category;
    if (isPublic !== undefined) poll.isPublic = isPublic;
    if (status) poll.status = status;

    if (options && Array.isArray(options)) {
      // Process modified or new options
      for (const updatedOption of options) {
        if (updatedOption._id) {
          // Update text of existing option
          const match = poll.options.find(opt => opt._id?.toString() === updatedOption._id);
          if (match) {
            match.text = updatedOption.text;
          }
        } else if (updatedOption.text) {
          // Append new option
          poll.options.push({ text: updatedOption.text, votes: 0 });
        }
      }
    }

    await poll.save();
    await poll.populate('creator', 'username avatar');
    
    // Emit live update via socket.io
    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`pollUpdate:${pollId}`, poll);
      io.emit('pollUpdated', poll);
    }
    
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poll' });
  }
});

// Delete a poll
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pollId = req.params.id;
    const userId = req.user?.userId;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check ownership
    if (poll.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this poll' });
    }

    await Poll.findByIdAndDelete(pollId);
    // Cascade delete votes and comments
    await Vote.deleteMany({ poll: pollId });
    // Assuming you'd have a Comment model imported if cascading, but let's do Votes at minimum
    
    // Emit global deletion
    const io: Server = req.app.get('io');
    if (io) {
      io.emit('pollDeleted', pollId);
    }

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

export default router;

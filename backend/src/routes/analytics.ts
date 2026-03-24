import express from 'express';
import { Poll } from '../models/Poll';
import { Vote } from '../models/Vote';
import { User } from '../models/User';
import { Comment } from '../models/Comment';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get global analytics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const totalPolls = await Poll.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();

    // Category distribution
    const categoryStats = await Poll.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Engagement over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const votesOverTime = await Vote.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          votes: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular polls (top 5)
    const popularPolls = await Poll.find({})
      .sort({ 'options.votes': -1 })
      .limit(5)
      .select('title options category')
      .populate('creator', 'username');

    // Calculate total votes for each popular poll correctly
    const popularPollsFormatted = popularPolls.map(poll => {
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
      return {
        _id: poll._id,
        title: poll.title,
        category: poll.category,
        totalVotes
      };
    }).sort((a, b) => b.totalVotes - a.totalVotes);

    res.json({
      summary: {
        totalPolls,
        totalVotes,
        totalUsers,
        totalComments
      },
      categoryStats: categoryStats.map(stat => ({ name: stat._id, value: stat.count })),
      votesOverTime: votesOverTime.map(v => ({ date: v._id, votes: v.votes })),
      popularPolls: popularPollsFormatted
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get poll-specific analytics
router.get('/poll/:id', authMiddleware, async (req, res) => {
  try {
    const pollId = req.params.id;
    
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const votes = await Vote.aggregate([
      { $match: { poll: poll._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const commentCount = await Comment.countDocuments({ poll: pollId });

    res.json({
      poll: {
        title: poll.title,
        options: poll.options
      },
      engagement: {
        votes: votes.map(v => ({ date: v._id, count: v.count })),
        commentCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch poll analytics' });
  }
});

export default router;

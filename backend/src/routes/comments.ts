import express, { Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Comment } from '../models/Comment';
import { Server } from 'socket.io';

const router = express.Router();

// Get comments for a poll
router.get('/:pollId', async (req, res) => {
  try {
    const comments = await Comment.find({ poll: req.params.pollId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to open poll
router.post('/:pollId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text, parentId } = req.body;
    const pollId = req.params.pollId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = new Comment({
      poll: pollId,
      user: req.user?.userId,
      text,
      parentId: parentId || null
    });

    await comment.save();
    await comment.populate('user', 'username avatar');

    // Emit live comment
    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`newComment:${pollId}`, comment);
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Toggle Like on a comment
router.put('/action/:commentId/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const likeIndex = comment.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      // Like
      comment.likes.push(userId as any);
    } else {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    
    // Broadcast update
    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`commentUpdated:${comment.poll}`, comment);
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Edit a comment
router.put('/action/:commentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?.userId;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    }
    
    if (comment.isDeleted) {
      return res.status(400).json({ error: 'Cannot edit deleted comment' });
    }

    comment.text = text;
    comment.isEdited = true;
    await comment.save();

    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`commentUpdated:${comment.poll}`, comment);
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

// Delete a comment (Soft delete to preserve threads/replies)
router.delete('/action/:commentId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    comment.text = '[This comment was deleted]';
    comment.isDeleted = true;
    await comment.save();

    const io: Server = req.app.get('io');
    if (io) {
      io.emit(`commentUpdated:${comment.poll}`, comment);
    }

    res.json({ message: 'Comment deleted successfully', comment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;

import express from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Update Username
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Alias must be at least 3 characters' });
    }

    // Check if new username is taken
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser && existingUser._id.toString() !== req.user?.userId) {
      return res.status(400).json({ error: 'This alias is already claimed by another node' });
    }

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { username: username.trim() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Neural identity updated successfully', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Identity update sequence failed' });
  }
});

export default router;

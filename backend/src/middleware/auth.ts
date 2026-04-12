import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fallback_secret'
    ) as { userId: string, role: string };
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifiedMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const user = await User.findById(req.user.userId);
    if (!user || !user.isVerified) {
      return res.status(403).json({ 
        error: 'Identity Synchronization Required', 
        message: 'Your neural link is not yet established. Please verify your identity via OTP.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Verification check failed' });
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'fallback_secret'
      ) as { userId: string, role: string };
      
      req.user = decoded;
    }
  } catch (error) {
    // Ignore verification errors for optional auth
  }
  next();
};

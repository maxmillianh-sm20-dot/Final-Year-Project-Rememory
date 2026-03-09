import type { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'rl',
  points: 100, // Increased from 12 to 100 to prevent blocking during testing
  duration: 60 // 60 seconds
});

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip ?? 'global';
    await rateLimiter.consume(key);
    return next();
  } catch (error) {
    return res.status(429).json({
      error: {
        code: 'rate_limited',
        message: 'Too many requests. Please slow down.'
      }
    });
  }
};


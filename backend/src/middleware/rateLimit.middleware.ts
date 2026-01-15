import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { redisService } from '../services/redis.service';
import { AuthRequest } from './auth.middleware';

/**
 * Create rate limiter based on user tier
 */
export const createRateLimiter = (tier: 'FREE' | 'PRO' | 'ENTERPRISE' | 'PUBLIC') => {
    const limits = {
        PUBLIC: { windowMs: 15 * 60 * 1000, max: 50 }, // 50 requests per 15 minutes
        FREE: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
        PRO: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
        ENTERPRISE: { windowMs: 15 * 60 * 1000, max: 10000 }, // 10000 requests per 15 minutes
    };

    const config = limits[tier];

    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: {
            error: 'Too many requests',
            retryAfter: config.windowMs / 1000,
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

/**
 * Adaptive rate limiting based on authenticated user's tier
 */
export const adaptiveRateLimit = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const tier = req.user?.tier || 'PUBLIC';
        const identifier = req.user?.id || req.ip || 'unknown';

        const limits: Record<string, { limit: number; window: number }> = {
            PUBLIC: { limit: 50, window: 900 }, // 50 per 15 min
            FREE: { limit: 100, window: 900 }, // 100 per 15 min
            PRO: { limit: 1000, window: 900 }, // 1000 per 15 min
            ENTERPRISE: { limit: 10000, window: 900 }, // 10000 per 15 min
        };

        const config = limits[tier as keyof typeof limits];
        const rateLimitKey = `ratelimit:${tier}:${identifier}`;

        const { allowed, remaining } = await redisService.checkRateLimit(
            rateLimitKey,
            config.limit,
            config.window
        );

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', config.limit.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', Date.now() + config.window * 1000);

        if (!allowed) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                limit: config.limit,
                window: config.window,
                retryAfter: config.window,
            });
        }

        next();
    } catch (error) {
        // If Redis fails, continue without rate limiting (fail open)
        console.error('Rate limiting error:', error);
        next();
    }
};

/**
 * API key rate limiting (more strict)
 */
export const apiKeyRateLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }

        const rateLimitKey = `api:ratelimit:${apiKey}`;
        const { allowed, remaining } = await redisService.checkRateLimit(
            rateLimitKey,
            1000, // 1000 requests
            3600  // per hour
        );

        res.setHeader('X-RateLimit-Limit', '1000');
        res.setHeader('X-RateLimit-Remaining', remaining.toString());

        if (!allowed) {
            return res.status(429).json({
                error: 'API rate limit exceeded',
                retryAfter: 3600,
            });
        }

        next();
    } catch (error) {
        console.error('API rate limiting error:', error);
        next();
    }
};

/**
 * Public endpoints rate limiter (very strict)
 */
export const publicRateLimiter = createRateLimiter('PUBLIC');

/**
 * Exponential backoff for failed attempts (e.g., login)
 */
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many login attempts, please try again later',
    },
});

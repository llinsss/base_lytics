import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        walletAddress: string;
        tier: string;
    };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            walletAddress: string;
        };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                walletAddress: true,
                tier: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

/**
 * Optional authentication - continues even without token
 */
export const optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                walletAddress: string;
            };

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    walletAddress: true,
                    tier: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

/**
 * Check if user has required subscription tier
 */
export const requireTier = (minTier: 'FREE' | 'PRO' | 'ENTERPRISE') => {
    const tierLevels = { FREE: 0, PRO: 1, ENTERPRISE: 2 };

    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userTierLevel = tierLevels[req.user.tier as keyof typeof tierLevels];
        const requiredTierLevel = tierLevels[minTier];

        if (userTierLevel < requiredTierLevel) {
            return res.status(403).json({
                error: 'Insufficient subscription tier',
                required: minTier,
                current: req.user.tier,
            });
        }

        next();
    };
};

/**
 * Verify wallet signature for authentication
 */
export const verifyWalletSignature = (
    message: string,
    signature: string,
    expectedAddress: string
): boolean => {
    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        return false;
    }
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (userId: string, walletAddress: string) => {
    const accessToken = jwt.sign(
        { userId, walletAddress },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
        { userId, walletAddress },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
            userId: string;
            walletAddress: string;
        };
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

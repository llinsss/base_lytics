import { Router } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import {
    generateTokens,
    verifyWalletSignature,
    verifyRefreshToken,
} from '../middleware/auth.middleware';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { loginRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/nonce
 * Get nonce for wallet signature
 */
router.post(
    '/nonce',
    validate([body('walletAddress').isEthereumAddress()]),
    asyncHandler(async (req, res) => {
        const { walletAddress } = req.body;

        // Generate a unique nonce for this wallet
        const nonce = `Sign this message to authenticate with BaseLytics.\n\nNonce: ${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Store nonce in database or cache (valid for 5 minutes)
        // For simplicity, we'll encode it in the message
        // In production, store in Redis with TTL

        res.json({ nonce });
    })
);

/**
 * POST /api/auth/login
 * Authenticate with wallet signature
 */
router.post(
    '/login',
    loginRateLimit,
    validate([
        body('walletAddress').isEthereumAddress(),
        body('signature').isString(),
        body('message').isString(),
    ]),
    asyncHandler(async (req, res) => {
        const { walletAddress, signature, message } = req.body;

        // Verify signature
        const isValid = verifyWalletSignature(message, signature, walletAddress);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Verify message freshness (nonce should be recent)
        // In production, verify against stored nonce in Redis

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    walletAddress: walletAddress.toLowerCase(),
                    tier: 'FREE',
                },
            });
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.walletAddress);

        res.json({
            success: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                tier: user.tier,
            },
            accessToken,
            refreshToken,
        });
    })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
    '/refresh',
    validate([body('refreshToken').isString()]),
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        try {
            const decoded = verifyRefreshToken(refreshToken);

            // Verify user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Generate new tokens
            const tokens = generateTokens(user.id, user.walletAddress);

            res.json({
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        } catch (error) {
            res.status(401).json({ error: 'Invalid refresh token' });
        }
    })
);

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, optional blacklist)
 */
router.post('/logout', (req, res) => {
    // In production, you might want to blacklist the token in Redis
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;

import { Router } from 'express';
import { body, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireTier } from '../middleware/auth.middleware';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { adaptiveRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and rate limiting to all user routes
router.use(authenticateToken);
router.use(adaptiveRateLimit);

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get(
    '/profile',
    asyncHandler(async (req: AuthRequest, res) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: {
                subscriptions: {
                    where: { status: 'active' },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    })
);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put(
    '/profile',
    validate([
        body('email').optional().isEmail(),
        body('username').optional().isString().isLength({ min: 3, max: 30 }),
        body('preferences').optional().isObject(),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { email, username, preferences } = req.body;

        const updated = await prisma.user.update({
            where: { id: req.user!.id },
            data: {
                ...(email && { email }),
                ...(username && { username }),
                ...(preferences && { preferences }),
            },
        });

        res.json({ success: true, user: updated });
    })
);

/**
 * GET /api/users/watchlist
 * Get user's watchlists
 */
router.get(
    '/watchlist',
    asyncHandler(async (req: AuthRequest, res) => {
        const watchlists = await prisma.watchlist.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ watchlists });
    })
);

/**
 * POST /api/users/watchlist
 * Create a new watchlist
 */
router.post(
    '/watchlist',
    validate([
        body('name').isString().isLength({ min: 1, max: 50 }),
        body('items').isArray(),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { name, items } = req.body;

        const watchlist = await prisma.watchlist.create({
            data: {
                userId: req.user!.id,
                name,
                items,
            },
        });

        res.status(201).json({ success: true, watchlist });
    })
);

/**
 * PUT /api/users/watchlist/:id
 * Update a watchlist
 */
router.put(
    '/watchlist/:id',
    validate([
        body('name').optional().isString(),
        body('items').optional().isArray(),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { id } = req.params;
        const { name, items } = req.body;

        // Verify ownership
        const watchlist = await prisma.watchlist.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        const updated = await prisma.watchlist.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(items && { items }),
            },
        });

        res.json({ success: true, watchlist: updated });
    })
);

/**
 * DELETE /api/users/watchlist/:id
 * Delete a watchlist
 */
router.delete(
    '/watchlist/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        const { id } = req.params;

        // Verify ownership
        const watchlist = await prisma.watchlist.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        await prisma.watchlist.delete({ where: { id } });

        res.json({ success: true, message: 'Watchlist deleted' });
    })
);

/**
 * GET /api/users/alerts
 * Get user's alerts
 */
router.get(
    '/alerts',
    validate([
        query('status').optional().isIn(['ACTIVE', 'TRIGGERED', 'DISABLED']),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { status } = req.query;

        const alerts = await prisma.alert.findMany({
            where: {
                userId: req.user!.id,
                ...(status && { status: status as any }),
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ alerts });
    })
);

/**
 * POST /api/users/alerts
 * Create a new alert
 */
router.post(
    '/alerts',
    requireTier('PRO'), // Alerts are Pro feature
    validate([
        body('type').isIn(['PRICE_ABOVE', 'PRICE_BELOW', 'WHALE_TRANSACTION', 'LARGE_TRANSFER', 'TOKEN_LAUNCH', 'CUSTOM']),
        body('conditions').isObject(),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { type, conditions } = req.body;

        const alert = await prisma.alert.create({
            data: {
                userId: req.user!.id,
                type,
                conditions,
                status: 'ACTIVE',
            },
        });

        res.status(201).json({ success: true, alert });
    })
);

/**
 * PATCH /api/users/alerts/:id
 * Update alert status
 */
router.patch(
    '/alerts/:id',
    validate([
        body('status').isIn(['ACTIVE', 'DISABLED']),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const alert = await prisma.alert.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        const updated = await prisma.alert.update({
            where: { id },
            data: { status },
        });

        res.json({ success: true, alert: updated });
    })
);

/**
 * DELETE /api/users/alerts/:id
 * Delete an alert
 */
router.delete(
    '/alerts/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        const { id } = req.params;

        const alert = await prisma.alert.findFirst({
            where: { id, userId: req.user!.id },
        });

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        await prisma.alert.delete({ where: { id } });

        res.json({ success: true, message: 'Alert deleted' });
    })
);

/**
 * GET /api/users/portfolio/history
 * Get portfolio snapshot history
 */
router.get(
    '/portfolio/history',
    validate([
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('days').optional().isInt({ min: 1, max: 365 }),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const limit = parseInt(req.query.limit as string) || 30;
        const days = parseInt(req.query.days as string) || 30;

        const since = new Date();
        since.setDate(since.getDate() - days);

        const snapshots = await prisma.portfolio.findMany({
            where: {
                userId: req.user!.id,
                timestamp: { gte: since },
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });

        res.json({ snapshots });
    })
);

/**
 * POST /api/users/portfolio/snapshot
 * Save portfolio snapshot
 */
router.post(
    '/portfolio/snapshot',
    validate([
        body('snapshot').isObject(),
        body('totalValue').isFloat({ min: 0 }),
    ]),
    asyncHandler(async (req: AuthRequest, res) => {
        const { snapshot, totalValue } = req.body;

        const portfolioSnapshot = await prisma.portfolio.create({
            data: {
                userId: req.user!.id,
                snapshot,
                totalValue,
            },
        });

        res.status(201).json({ success: true, snapshot: portfolioSnapshot });
    })
);

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get(
    '/stats',
    asyncHandler(async (req: AuthRequest, res) => {
        const [watchlistCount, alertCount, portfolioCount] = await Promise.all([
            prisma.watchlist.count({ where: { userId: req.user!.id } }),
            prisma.alert.count({ where: { userId: req.user!.id, status: 'ACTIVE' } }),
            prisma.portfolio.count({ where: { userId: req.user!.id } }),
        ]);

        res.json({
            stats: {
                watchlists: watchlistCount,
                activeAlerts: alertCount,
                portfolioSnapshots: portfolioCount,
            },
        });
    })
);

export default router;

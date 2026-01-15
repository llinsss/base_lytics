import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { redisService } from './services/redis.service';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware
// =====================

// Security headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', { stream: morganStream }));

// =====================
// Routes
// =====================

// Health check
app.get('/health', async (req, res) => {
    const dbHealth = await prisma.$queryRaw`SELECT 1`;
    const redisHealth = await redisService.healthCheck();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: dbHealth ? 'connected' : 'disconnected',
            redis: redisHealth ? 'connected' : 'disconnected',
        },
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// =====================
// Server startup
// =====================

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('✅ Database connected');

        // Test Redis connection
        if (redisService.connected) {
            logger.info('✅ Redis connected');
        } else {
            logger.warn('⚠️ Redis not connected (caching disabled)');
        }

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle shutdown gracefully
const shutdown = async () => {
    logger.info('Shutting down gracefully...');

    await prisma.$disconnect();
    await redisService.disconnect();

    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();

export default app;

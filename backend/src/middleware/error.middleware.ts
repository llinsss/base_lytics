import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../utils/logger';

/**
 * Middleware to handle validation errors
 */
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Run all validations
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map((err) => ({
            field: err.type === 'field' ? err.path : undefined,
            message: err.msg,
        }));

        logger.warn('Validation errors:', { errors: extractedErrors, path: req.path });

        return res.status(400).json({
            error: 'Validation failed',
            details: extractedErrors,
        });
    };
};

/**
 * Error handling middleware
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry',
            field: err.meta?.target,
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Record not found',
        });
    }

    // Handle specific error types
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

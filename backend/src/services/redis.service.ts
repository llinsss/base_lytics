import Redis from 'ioredis';
import { logger } from '../utils/logger';

class RedisService {
    private client: Redis;
    private isConnected: boolean = false;

    constructor() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            logger.info('✅ Redis connected');
        });

        this.client.on('error', (error) => {
            logger.error('❌ Redis connection error:', error);
            this.isConnected = false;
        });

        this.client.on('close', () => {
            this.isConnected = false;
            logger.warn('⚠️ Redis connection closed');
        });
    }

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL
     */
    async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            return true;
        } catch (error) {
            logger.error(`Error setting key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete key from cache
     */
    async delete(key: string): Promise<boolean> {
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            logger.error(`Error deleting key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete keys by pattern
     */
    async deletePattern(pattern: string): Promise<number> {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                return await this.client.del(...keys);
            }
            return 0;
        } catch (error) {
            logger.error(`Error deleting pattern ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Error checking existence of key ${key}:`, error);
            return false;
        }
    }

    /**
     * Set key expiration
     */
    async expire(key: string, seconds: number): Promise<boolean> {
        try {
            await this.client.expire(key, seconds);
            return true;
        } catch (error) {
            logger.error(`Error setting expiration for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Increment value
     */
    async increment(key: string, amount: number = 1): Promise<number> {
        try {
            return await this.client.incrby(key, amount);
        } catch (error) {
            logger.error(`Error incrementing key ${key}:`, error);
            return 0;
        }
    }

    /**
     * Cache helpers for common use cases
     */

    // Cache blockchain price data (5 minutes TTL)
    async cachePrice(tokenAddress: string, chainId: number, price: number): Promise<void> {
        const key = `price:${chainId}:${tokenAddress}`;
        await this.set(key, { price, timestamp: Date.now() }, 300); // 5 min
    }

    async getPrice(tokenAddress: string, chainId: number): Promise<number | null> {
        const key = `price:${chainId}:${tokenAddress}`;
        const data = await this.get<{ price: number; timestamp: number }>(key);
        return data?.price || null;
    }

    // Cache NFT data (1 hour TTL)
    async cacheNFT(contractAddress: string, tokenId: string, chainId: number, metadata: any): Promise<void> {
        const key = `nft:${chainId}:${contractAddress}:${tokenId}`;
        await this.set(key, metadata, 3600); // 1 hour
    }

    async getNFT(contractAddress: string, tokenId: string, chainId: number): Promise<any | null> {
        const key = `nft:${chainId}:${contractAddress}:${tokenId}`;
        return await this.get(key);
    }

    // Cache user portfolio (30 seconds TTL for real-time updates)
    async cachePortfolio(walletAddress: string, portfolio: any): Promise<void> {
        const key = `portfolio:${walletAddress}`;
        await this.set(key, portfolio, 30); // 30 seconds
    }

    async getPortfolio(walletAddress: string): Promise<any | null> {
        const key = `portfolio:${walletAddress}`;
        return await this.get(key);
    }

    // Cache gas prices (10 seconds TTL)
    async cacheGasPrice(chainId: number, gasData: any): Promise<void> {
        const key = `gas:${chainId}`;
        await this.set(key, gasData, 10); // 10 seconds
    }

    async getGasPrice(chainId: number): Promise<any | null> {
        const key = `gas:${chainId}`;
        return await this.get(key);
    }

    /**
     * Rate limiting helpers
     */
    async checkRateLimit(identifier: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
        const key = `ratelimit:${identifier}`;
        const current = await this.increment(key);

        if (current === 1) {
            await this.expire(key, windowSeconds);
        }

        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
        };
    }

    /**
     * Disconnect
     */
    async disconnect(): Promise<void> {
        await this.client.quit();
        logger.info('Redis disconnected');
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.client.ping();
            return true;
        } catch (error) {
            return false;
        }
    }

    get connected(): boolean {
        return this.isConnected;
    }
}

export const redisService = new RedisService();

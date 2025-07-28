import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 3600; // 1 hour
  private readonly defaultPrefix = 'cache:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Set a cache entry
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl ?? this.defaultTtl;

    try {
      await this.redisService.setJson(fullKey, value, ttl);
      this.logger.debug(`Cache set: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${fullKey}:`, error.message);
      throw error;
    }
  }

  /**
   * Get a cache entry
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const fullKey = this.buildKey(key, prefix);

    try {
      const value = await this.redisService.getJson<T>(fullKey);
      if (value !== null) {
        this.logger.debug(`Cache hit: ${fullKey}`);
      } else {
        this.logger.debug(`Cache miss: ${fullKey}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${fullKey}:`, error.message);
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, prefix);

    try {
      const result = await this.redisService.del(fullKey);
      this.logger.debug(`Cache delete: ${fullKey} (result: ${result})`);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${fullKey}:`, error.message);
      return false;
    }
  }

  /**
   * Check if a cache entry exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, prefix);

    try {
      const result = await this.redisService.exists(fullKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check cache key ${fullKey}:`, error.message);
      return false;
    }
  }

  /**
   * Set cache entry with custom TTL
   */
  async setWithTtl<T>(key: string, value: T, ttl: number, prefix?: string): Promise<void> {
    await this.set(key, value, { ttl, prefix });
  }

  /**
   * Get or set cache entry (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options?.prefix);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Clear all cache entries with a specific prefix
   */
  async clearByPrefix(prefix: string): Promise<number> {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use SCAN to iterate through keys
      this.logger.warn(`Cache clear by prefix: ${prefix} (not implemented)`);
      return 0;
    } catch (error) {
      this.logger.error(`Failed to clear cache by prefix ${prefix}:`, error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    try {
      const info = await this.redisService.info('memory');
      const memoryMatch = info.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

      // This is a simplified implementation
      // In production, you might want to track cache statistics differently
      return {
        totalKeys: 0, // Would need to implement key counting
        memoryUsage,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error.message);
      return {
        totalKeys: 0,
        memoryUsage: 'unknown',
      };
    }
  }

  private buildKey(key: string, prefix?: string): string {
    const keyPrefix = prefix ?? this.defaultPrefix;
    return `${keyPrefix}${key}`;
  }
} 
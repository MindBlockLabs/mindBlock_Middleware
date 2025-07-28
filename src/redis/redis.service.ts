import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  lazyConnect?: boolean;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private readonly config: RedisConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.getRedisConfig();
  }

  async onModuleInit() {
    await this.initializeRedisClient();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private getRedisConfig(): RedisConfig {
    return {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.configService.get('REDIS_KEY_PREFIX', 'mindblock:'),
      retryDelayOnFailover: this.configService.get('REDIS_RETRY_DELAY', 100),
      maxRetriesPerRequest: this.configService.get<number | undefined>('REDIS_MAX_RETRIES', undefined),
      enableReadyCheck: this.configService.get('REDIS_ENABLE_READY_CHECK', true),
      lazyConnect: this.configService.get('REDIS_LAZY_CONNECT', false),
    };
  }

  private async initializeRedisClient() {
    try {
      this.redisClient = new Redis(this.config);

      // Set up event listeners for connection management
      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis client error:', error.message);
      });

      this.redisClient.on('close', () => {
        this.logger.warn('Redis client connection closed');
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.log('Redis client reconnecting...');
      });

      // Wait for connection to be ready
      if (!this.config.lazyConnect) {
        await this.redisClient.ping();
        this.logger.log('Redis client initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error.message);
      throw error;
    }
  }

  private async closeConnection() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        this.logger.log('Redis client connection closed gracefully');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error.message);
      }
    }
  }

  // Get the Redis client instance
  getClient(): Redis {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }
    return this.redisClient;
  }

  // Basic Redis operations
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    try {
      if (ttl) {
        return await this.redisClient.setex(key, ttl, value);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error.message);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error.message);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error.message);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.redisClient.exists(key);
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error.message);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.redisClient.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}:`, error.message);
      throw error;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.redisClient.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Failed to hset ${key}:${field}:`, error.message);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redisClient.hget(key, field);
    } catch (error) {
      this.logger.error(`Failed to hget ${key}:${field}:`, error.message);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hgetall(key);
    } catch (error) {
      this.logger.error(`Failed to hgetall ${key}:`, error.message);
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.redisClient.hdel(key, field);
    } catch (error) {
      this.logger.error(`Failed to hdel ${key}:${field}:`, error.message);
      throw error;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redisClient.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to lpush ${key}:`, error.message);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redisClient.rpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to rpush ${key}:`, error.message);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.redisClient.lpop(key);
    } catch (error) {
      this.logger.error(`Failed to lpop ${key}:`, error.message);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redisClient.rpop(key);
    } catch (error) {
      this.logger.error(`Failed to rpop ${key}:`, error.message);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.redisClient.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to lrange ${key}:`, error.message);
      throw error;
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
    try {
      return await this.redisClient.ltrim(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to ltrim ${key}:`, error.message);
      throw error;
    }
  }

  // Sorted Set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.redisClient.zadd(key, score, member);
    } catch (error) {
      this.logger.error(`Failed to zadd ${key}:`, error.message);
      throw error;
    }
  }

  async zscore(key: string, member: string): Promise<number | null> {
    try {
      const score = await this.redisClient.zscore(key, member);
      return score !== null ? Number(score) : null;
    } catch (error) {
      this.logger.error(`Failed to zscore ${key}:${member}:`, error.message);
      throw error;
    }
  }

  async zrevrange(key: string, start: number, stop: number, withScores?: boolean): Promise<string[]> {
    try {
      if (withScores) {
        return await this.redisClient.zrevrange(key, start, stop, 'WITHSCORES');
      }
      return await this.redisClient.zrevrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to zrevrange ${key}:`, error.message);
      throw error;
    }
  }

  async zrank(key: string, member: string): Promise<number | null> {
    try {
      return await this.redisClient.zrank(key, member);
    } catch (error) {
      this.logger.error(`Failed to zrank ${key}:${member}:`, error.message);
      throw error;
    }
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    try {
      return await this.redisClient.zrevrank(key, member);
    } catch (error) {
      this.logger.error(`Failed to zrevrank ${key}:${member}:`, error.message);
      throw error;
    }
  }

  // Utility methods
  async ping(): Promise<string> {
    try {
      return await this.redisClient.ping();
    } catch (error) {
      this.logger.error('Failed to ping Redis:', error.message);
      throw error;
    }
  }

  async flushdb(): Promise<'OK'> {
    try {
      return await this.redisClient.flushdb();
    } catch (error) {
      this.logger.error('Failed to flush database:', error.message);
      throw error;
    }
  }

  async info(section?: string): Promise<string> {
    try {
      if (section) {
        return await this.redisClient.info(section);
      }
      return await this.redisClient.info();
    } catch (error) {
      this.logger.error('Failed to get Redis info:', error.message);
      throw error;
    }
  }

  // JSON operations helper
  async setJson(key: string, value: any, ttl?: number): Promise<'OK'> {
    try {
      const jsonValue = JSON.stringify(value);
      if (ttl) {
        return await this.redisClient.setex(key, ttl, jsonValue);
      }
      return await this.redisClient.set(key, jsonValue);
    } catch (error) {
      this.logger.error(`Failed to set JSON key ${key}:`, error.message);
      throw error;
    }
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get JSON key ${key}:`, error.message);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error.message);
      return false;
    }
  }
} 
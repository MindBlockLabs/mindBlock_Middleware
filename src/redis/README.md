# Centralized Redis Client

This module provides a centralized Redis client for the mindBlock middleware application, ensuring consistent and reusable caching logic across all modules.

## Features

- **Centralized Redis Connection**: Single Redis client instance shared across the application
- **Graceful Connection Management**: Automatic connection handling with error recovery
- **Environment Configuration**: Full .env support for Redis connection settings
- **Comprehensive Error Handling**: Robust error handling with detailed logging
- **Health Checks**: Built-in health check endpoints
- **JSON Support**: Helper methods for JSON serialization/deserialization
- **Cache Service**: High-level caching abstraction

## Installation

The Redis client uses `ioredis` which is already installed in the project:

```bash
npm install ioredis
```

## Environment Variables

Configure Redis connection using the following environment variables:

```env
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0

# Redis Configuration
REDIS_KEY_PREFIX=mindblock:
REDIS_RETRY_DELAY=100
REDIS_MAX_RETRIES=null
REDIS_ENABLE_READY_CHECK=true
REDIS_LAZY_CONNECT=false
```

## Usage

### Basic Usage

```typescript
import { RedisService } from './redis/redis.service';

@Injectable()
export class MyService {
  constructor(private readonly redisService: RedisService) {}

  async storeData(key: string, data: any): Promise<void> {
    await this.redisService.setJson(key, data, 3600); // TTL: 1 hour
  }

  async getData<T>(key: string): Promise<T | null> {
    return await this.redisService.getJson<T>(key);
  }
}
```

### Using the Cache Service

```typescript
import { CacheService } from './redis/cache.service';

@Injectable()
export class MyService {
  constructor(private readonly cacheService: CacheService) {}

  async getUserProfile(userId: string): Promise<UserProfile> {
    return await this.cacheService.getOrSet(
      `user:${userId}`,
      async () => {
        // Fetch from database
        return await this.userRepository.findById(userId);
      },
      { ttl: 1800, prefix: 'profile:' } // 30 minutes
    );
  }
}
```

## API Reference

### RedisService

#### Basic Operations

- `set(key: string, value: string, ttl?: number)`: Set a string value
- `get(key: string)`: Get a string value
- `del(key: string)`: Delete a key
- `exists(key: string)`: Check if key exists
- `expire(key: string, seconds: number)`: Set key expiration

#### Hash Operations

- `hset(key: string, field: string, value: string)`: Set hash field
- `hget(key: string, field: string)`: Get hash field
- `hgetall(key: string)`: Get all hash fields
- `hdel(key: string, field: string)`: Delete hash field

#### List Operations

- `lpush(key: string, ...values: string[])`: Push to list head
- `rpush(key: string, ...values: string[])`: Push to list tail
- `lpop(key: string)`: Pop from list head
- `rpop(key: string)`: Pop from list tail
- `lrange(key: string, start: number, stop: number)`: Get list range
- `ltrim(key: string, start: number, stop: number)`: Trim list

#### Sorted Set Operations

- `zadd(key: string, score: number, member: string)`: Add to sorted set
- `zscore(key: string, member: string)`: Get member score
- `zrevrange(key: string, start: number, stop: number, withScores?: boolean)`: Get range
- `zrank(key: string, member: string)`: Get member rank
- `zrevrank(key: string, member: string)`: Get reverse rank

#### JSON Operations

- `setJson(key: string, value: any, ttl?: number)`: Set JSON value
- `getJson<T>(key: string)`: Get JSON value with type

#### Utility Methods

- `ping()`: Test connection
- `flushdb()`: Clear database
- `info(section?: string)`: Get Redis info
- `healthCheck()`: Health check
- `getClient()`: Get raw Redis client

### CacheService

#### Basic Operations

- `set<T>(key: string, value: T, options?: CacheOptions)`: Set cache entry
- `get<T>(key: string, prefix?: string)`: Get cache entry
- `delete(key: string, prefix?: string)`: Delete cache entry
- `exists(key: string, prefix?: string)`: Check if entry exists

#### Advanced Operations

- `setWithTtl<T>(key: string, value: T, ttl: number, prefix?: string)`: Set with TTL
- `getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions)`: Cache-aside pattern
- `clearByPrefix(prefix: string)`: Clear by prefix
- `getStats()`: Get cache statistics

## Integration Examples

### Leaderboard Module

The leaderboard module has been updated to use the centralized Redis service:

```typescript
// Before (mock implementation)
export class RedisService {
  private client: RedisClient; // Mock client
}

// After (real implementation)
export class LeaderboardRedisService {
  constructor(
    private readonly redisService: RedisService
  ) {}
  
  async setLeaderboard(type: string, data: ProcessedLeaderboardData): Promise<void> {
    await this.redisService.setJson(key, data, ttl);
  }
}
```

### Queue Module

The queue module continues to use BullMQ's Redis connection for queue management, but now uses environment variables:

```typescript
export const REDIS_OPTIONS = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
}
```

## Health Checks

The application includes a Redis health check endpoint:

```bash
GET /health/redis
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The Redis service includes comprehensive error handling:

- Connection errors are logged and retried
- Operation errors are logged with context
- Graceful degradation when Redis is unavailable
- Health check failures are reported

## Best Practices

1. **Use the CacheService for high-level caching**: Provides better abstraction and error handling
2. **Set appropriate TTLs**: Avoid memory leaks by setting expiration times
3. **Use key prefixes**: Organize keys with prefixes (e.g., `user:`, `leaderboard:`)
4. **Handle Redis failures gracefully**: Always provide fallback behavior
5. **Monitor Redis health**: Use the health check endpoint in monitoring

## Migration Guide

### From Mock Redis to Real Redis

1. Update service imports to use `RedisService`
2. Replace mock client calls with real Redis operations
3. Update environment variables for Redis configuration
4. Test Redis connectivity and health checks

### Example Migration

```typescript
// Before
class MyService {
  private client: MockRedisClient;
  
  async getData(key: string) {
    return await this.client.get(key);
  }
}

// After
class MyService {
  constructor(private readonly redisService: RedisService) {}
  
  async getData<T>(key: string): Promise<T | null> {
    return await this.redisService.getJson<T>(key);
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Check Redis server is running and accessible
2. **Authentication failed**: Verify REDIS_PASSWORD is correct
3. **Memory issues**: Monitor Redis memory usage and set appropriate TTLs
4. **Performance issues**: Use Redis INFO command to monitor performance

### Debug Mode

Enable debug logging by setting the log level:

```typescript
// In your service
this.logger.debug('Redis operation details');
```

## Performance Considerations

- Use pipelining for bulk operations
- Set appropriate TTLs to prevent memory leaks
- Monitor Redis memory usage
- Use Redis INFO command for performance metrics
- Consider Redis clustering for high availability 
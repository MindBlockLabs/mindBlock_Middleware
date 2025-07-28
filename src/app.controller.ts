import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-rate-limit')
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per 60 seconds
  testRateLimit(): { message: string } {
    return { message: 'Rate limit test endpoint' };
  }

  @Get('health/redis')
  async checkRedisHealth(): Promise<{ status: string; timestamp: string }> {
    const isHealthy = await this.redisService.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}

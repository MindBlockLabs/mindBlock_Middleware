
import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello World' })
  @ApiResponse({ status: 200, description: 'Returns Hello World string.' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-rate-limit')
  @ApiOperation({ summary: 'Test rate limit endpoint' })
  @ApiResponse({ status: 200, description: 'Rate limit test endpoint.' })
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per 60 seconds
  testRateLimit(): { message: string } {
    return { message: 'Rate limit test endpoint' };
  }

  @Get('health/redis')
  @ApiOperation({ summary: 'Check Redis health' })
  @ApiResponse({ status: 200, description: 'Returns Redis health status.' })
  async checkRedisHealth(): Promise<{ status: string; timestamp: string }> {
    const isHealthy = await this.redisService.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}

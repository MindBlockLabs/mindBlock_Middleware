import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter: RateLimiterRedis;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.limiter = new RateLimiterRedis({
      storeClient: this.redisClient,
      points: this.configService.get<number>('RATE_LIMIT_POINTS', 100),
      duration: this.configService.get<number>('RATE_LIMIT_DURATION', 600),
      keyPrefix: 'rl:middleware',
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const key = req.user?.id || req.ip;
    try {
      await this.limiter.consume(key);
      next();
    } catch (error) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil(error.msBeforeNext / 1000)),
      );
      throw new BadRequestException(
        'Too many requests, please try again later.',
      );
    }
  }
}

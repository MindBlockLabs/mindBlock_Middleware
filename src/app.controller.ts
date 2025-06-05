import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-rate-limit')
  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 requests per 60 seconds
  testRateLimit(): { message: string } {
    return { message: 'Rate limit test endpoint' };
  }
}

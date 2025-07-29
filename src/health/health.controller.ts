import {
  Controller,
  Get,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthIndicatorResult } from './indicators/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: HealthIndicatorResult,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const results = await this.health.check([
      () => this.db.pingCheck('postgres'),
      () => this.redis.isHealthy('redis'),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dependencies: Object.fromEntries(
        results.details ? Object.entries(results.details).map(([k, v]: any) => [k, v.status]) : []
      ),
    };
  }
}

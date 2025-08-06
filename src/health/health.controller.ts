
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthIndicatorResult } from './indicators/redis.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: HealthIndicatorResult,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check for dependencies' })
  @ApiResponse({ status: 200, description: 'Returns health status for dependencies.' })
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

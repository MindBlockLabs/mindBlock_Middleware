

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthIndicatorResult } from './indicators/redis.health';

class HealthDependencies {
  @ApiProperty({ example: 'ok', description: 'Status of the dependency' })
  postgres: string;
  @ApiProperty({ example: 'ok', description: 'Status of the dependency' })
  redis: string;
}

class HealthResponse {
  @ApiProperty({ example: 'ok' })
  status: string;
  @ApiProperty({ example: '2025-08-06T12:00:00.000Z' })
  timestamp: string;
  @ApiProperty({ type: HealthDependencies })
  dependencies: HealthDependencies;
}

@ApiTags('Health')
@ApiExtraModels(HealthResponse, HealthDependencies)
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: HealthIndicatorResult,
  ) {}

  /**
   * Returns health status for all dependencies (Postgres, Redis, etc).
   * Useful for monitoring and readiness checks.
   */
  @Get()
  @ApiOperation({ summary: 'Get health status for all dependencies', description: 'Checks the health of Postgres and Redis and returns their status.' })
  @ApiOkResponse({ description: 'Health status for dependencies.', type: HealthResponse })
  @ApiResponse({ status: 503, description: 'Service unavailable if any dependency is down.' })
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

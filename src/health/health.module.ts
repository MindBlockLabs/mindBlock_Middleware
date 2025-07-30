import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { TypeOrmHealthIndicator, HealthCheckService } from '@nestjs/terminus';
import { HealthIndicatorResult } from './indicators/redis.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthCheckService, TypeOrmHealthIndicator, HealthIndicatorResult],
})
export class HealthModule {}

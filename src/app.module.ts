import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { PuzzleModule } from './puzzle/puzzle.module';
import { RequestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { AuthMiddleware } from './auth/auth.middleware';
import { AnalyticsEventsModule } from './analytics-events/analytics-events.module';
import { RequestContextMiddleware } from './middlewares/request-context.middleware';
import { TaskCleanupModule } from './task-cleanup/task-cleanup.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { GatewayModule } from './gateway/gateway.module';
import { RateLimitMiddleware } from './gateway/middlewares/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    AuthModule,
    GatewayModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    RedisModule,
    UserModule,
    PuzzleModule,
    AnalyticsEventsModule,
    TaskCleanupModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RateLimitMiddleware,
        RequestLoggerMiddleware,
        RequestContextMiddleware,
        AuthMiddleware,
      )
      .forRoutes('*');
  }
}

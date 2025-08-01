import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { AuthService } from './auth.service';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: +configService.get<number>('SESSION_CACHE_TTL', 300),
      }),
      isGlobal: true,
    }),
  ],
  providers: [AuthService, AuthMiddleware],
  exports: [AuthService],
})
export class AuthModule {}

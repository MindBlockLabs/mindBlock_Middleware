import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import Redis from 'ioredis';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class GatewayModule {}

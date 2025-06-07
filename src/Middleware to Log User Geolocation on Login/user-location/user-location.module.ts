import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserLocation } from './entities/user-location.entity';
import { UserService } from './services/user.service';
import { GeoLocationService } from './services/geo-location.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLocation])],
  controllers: [AuthController],
  providers: [UserService, GeoLocationService],
  exports: [UserService, GeoLocationService],
})
export class UserLocationModule {}
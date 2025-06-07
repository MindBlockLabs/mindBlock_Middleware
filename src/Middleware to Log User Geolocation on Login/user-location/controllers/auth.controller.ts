import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../services/user.service';
import { GeoLocationService } from '../services/geo-location.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly geoLocationService: GeoLocationService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.userService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract IP address from request
    const ipAddress = this.extractIpAddress(request);

    // Get location data
    const locationData = await this.geoLocationService.getLocationByIp(ipAddress);

    let userLocation = null;
    if (locationData) {
      // Store location data
      userLocation = await this.userService.createUserLocation({
        userId: user.id,
        ipAddress,
        country: locationData.country,
        countryCode: locationData.countryCode,
        region: locationData.region,
        regionName: locationData.regionName,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone: locationData.timezone,
        isp: locationData.isp,
      });

      // Update user's last login info
      await this.userService.updateLastLoginInfo(
        user.id,
        ipAddress,
        locationData.country,
        locationData.regionName,
      );
    }

    // Return login response (in real app, you'd generate JWT token here)
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLoginIp: ipAddress,
        lastLoginCountry: locationData?.country,
        lastLoginRegion: locationData?.regionName,
      },
      location: userLocation ? {
        country: locationData.country,
        region: locationData.regionName,
        city: locationData.city,
        timezone: locationData.timezone,
      } : null,
    };
  }

  @Get('user/:userId/locations')
  async getUserLocationHistory(@Param('userId') userId: string) {
    const locations = await this.userService.getUserLocationHistory(userId);
    return {
      message: 'User location history retrieved successfully',
      data: locations,
    };
  }

  @Get('user/:userId/analytics')
  async getUserLocationAnalytics(@Param('userId') userId: string) {
    const analytics = await this.userService.getLocationAnalytics(userId);
    return {
      message: 'User location analytics retrieved successfully',
      data: analytics,
    };
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    const { email, password, firstName, lastName } = registerDto;
    const user = await this.userService.createUser(email, password, firstName, lastName);
    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private extractIpAddress(request: Request): string {
    // Check various headers for the real IP address
    const forwarded = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const cfConnectingIp = request.headers['cf-connecting-ip'] as string;
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIp) {
      return realIp;
    }
    if (cfConnectingIp) {
      return cfConnectingIp;
    }
    
    return request.connection.remoteAddress || request.socket.remoteAddress || '127.0.0.1';
  }
}
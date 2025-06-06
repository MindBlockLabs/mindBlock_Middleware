import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFAGuard } from './guards/2fa.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2FA(@Request() req) {
    return this.authService.enable2FA(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirm')
  async confirm2FA(@Request() req, @Body() enable2FADto: Enable2FADto) {
    return this.authService.confirm2FA(req.user.id, enable2FADto.token);
  }

  @UseGuards(JwtAuthGuard, TwoFAGuard)
  @Post('2fa/disable')
  async disable2FA(@Request() req) {
    return this.authService.disable2FA(req.user.id);
  }

  @UseGuards(JwtAuthGuard, TwoFAGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      is2FAEnabled: req.user.is2FAEnabled,
    };
  }
}
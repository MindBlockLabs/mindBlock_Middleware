import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, twoFAToken } = loginDto;
    
    const user = await this.usersService.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.is2FAEnabled) {
      if (!twoFAToken) {
        return {
          requires2FA: true,
          message: '2FA token required',
        };
      }

      const is2FAValid = await this.usersService.verify2FA(user.id, twoFAToken);
      if (!is2FAValid) {
        throw new UnauthorizedException('Invalid 2FA token');
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      is2FAEnabled: user.is2FAEnabled,
      is2FAVerified: user.is2FAEnabled ? !!twoFAToken : true,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        is2FAEnabled: user.is2FAEnabled,
      },
    };
  }

  async enable2FA(userId: number) {
    return this.usersService.enable2FA(userId);
  }

  async confirm2FA(userId: number, token: string) {
    const isValid = await this.usersService.verify2FA(userId, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }

    await this.usersService.confirm2FASetup(userId);
    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: number) {
    await this.usersService.disable2FA(userId);
    return { message: '2FA disabled successfully' };
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async enable2FA(userId: number): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: user.email,
      service: 'YourApp',
      length: 20,
    });

    await this.usersRepository.update(userId, {
      twoFASecret: secret.base32,
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verify2FA(userId: number, token: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.twoFASecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  async confirm2FASetup(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is2FAEnabled: true,
    });
  }

  async disable2FA(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      is2FAEnabled: false,
      twoFASecret: null,
    });
  }
}
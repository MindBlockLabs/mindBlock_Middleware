import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../../users/users.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    is2FAEnabled: boolean;
    is2FAVerified?: boolean;
  };
}

@Injectable()
export class TwoFAMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip middleware if user is not authenticated
    if (!req.user) {
      return next();
    }

    const user = await this.usersService.findById(req.user.id);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If 2FA is enabled but not verified in this session
    if (user.is2FAEnabled && !req.user.is2FAVerified) {
      throw new UnauthorizedException('2FA verification required');
    }

    next();
  }
}
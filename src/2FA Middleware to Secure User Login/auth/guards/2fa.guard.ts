import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../middleware/2fa.middleware';

@Injectable()
export class TwoFAGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    // Check if user is authenticated
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if 2FA is required and verified
    if (request.user.is2FAEnabled && !request.user.is2FAVerified) {
      throw new UnauthorizedException('2FA verification required');
    }

    return true;
  }
}
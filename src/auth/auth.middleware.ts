import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly authHeaderKey: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.authHeaderKey = this.configService
      .get<string>('AUTH_HEADER_KEY')
      .toLowerCase();
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers[this.authHeaderKey];

    if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed.',
      );
    }

    const token = authHeader.toString().substring(7);

    try {
      const userContext = await this.authService.validateToken(token);
      req.user = userContext;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}

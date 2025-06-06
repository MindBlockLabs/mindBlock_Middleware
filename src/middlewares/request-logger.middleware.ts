import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
interface RequestWithUser extends Request {
  user?: {
    id: string | number;
  };
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress;
    const userId = req.user?.id || 'anonymous';
    
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${ip} - User: ${userId}`);
    
    next();
  }
} 
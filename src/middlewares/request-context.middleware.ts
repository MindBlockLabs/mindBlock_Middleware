import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request & { context?: any }, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();

    // Extract userId from Authorization header (if JWT is present)
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded: any = jwt.decode(token);
        userId = decoded?.sub || decoded?.id || null;
      } catch {
        // Ignore malformed tokens
      }
    }

    req.context = {
      requestId,
      ipAddress,
      userId,
      timestamp,
    };

    next();
  }
}
import { Request } from 'express';

// Extend Express Request interface to include 'context'
declare module 'express-serve-static-core' {
  interface Request {
    context?: Record<string, any>;
  }
}

export function getContext(req: Request) {
  return req.context || {};
}
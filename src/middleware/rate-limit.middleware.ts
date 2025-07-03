import { Injectable, type NestMiddleware, HttpException, HttpStatus } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"

export interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds
  max?: number // Maximum number of requests per window
  message?: string
  keyGenerator?: (req: Request) => string
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests = new Map<string, { count: number; resetTime: number }>()

  constructor(private readonly options: RateLimitOptions = {}) {}

  use(req: Request, res: Response, next: NextFunction) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100,
      message = "Too many requests",
      keyGenerator = (req) => req.ip,
    } = this.options

    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    this.cleanup(windowStart)

    const requestData = this.requests.get(key)

    if (!requestData) {
      // First request from this key
      this.requests.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (now > requestData.resetTime) {
      // Window has expired, reset
      this.requests.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (requestData.count >= max) {
      // Rate limit exceeded
      const resetTime = Math.ceil((requestData.resetTime - now) / 1000)
      res.set({
        "X-RateLimit-Limit": max.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetTime.toString(),
      })

      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS)
    }

    // Increment counter
    requestData.count++
    const remaining = Math.max(0, max - requestData.count)
    const resetTime = Math.ceil((requestData.resetTime - now) / 1000)

    res.set({
      "X-RateLimit-Limit": max.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetTime.toString(),
    })

    next()
  }

  private cleanup(windowStart: number) {
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime < windowStart) {
        this.requests.delete(key)
      }
    }
  }
}

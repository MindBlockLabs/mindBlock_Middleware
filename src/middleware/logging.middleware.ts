import { Injectable, type NestMiddleware, Logger } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"

export interface LoggingOptions {
  includeBody?: boolean
  includeHeaders?: boolean
  excludePaths?: string[]
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name)

  constructor(private readonly options: LoggingOptions = {}) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { includeBody = false, includeHeaders = false, excludePaths = [] } = this.options

    // Skip logging for excluded paths
    if (excludePaths.some((path) => req.path.includes(path))) {
      return next()
    }

    const start = Date.now()
    const { method, originalUrl, ip } = req

    // Log request
    const requestLog: any = {
      method,
      url: originalUrl,
      ip,
      userAgent: req.get("User-Agent"),
    }

    if (includeHeaders) {
      requestLog.headers = req.headers
    }

    if (includeBody && req.body) {
      requestLog.body = req.body
    }

    this.logger.log(`Incoming Request: ${JSON.stringify(requestLog)}`)

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function (chunk?: any, encoding?: any) {
      const duration = Date.now() - start
      const responseLog = {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      }

      if (res.statusCode >= 400) {
        Logger.error(`Response Error: ${JSON.stringify(responseLog)}`)
      } else {
        Logger.log(`Response: ${JSON.stringify(responseLog)}`)
      }

      originalEnd.call(this, chunk, encoding)
    }

    next()
  }
}

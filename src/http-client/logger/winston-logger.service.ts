import winston from "winston"
import type { Logger } from "../interfaces/logger.interface.ts"

export class WinstonLoggerService implements Logger {
  private logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: "http-client" },
      transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    })
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta)
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta)
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta)
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta)
  }
}

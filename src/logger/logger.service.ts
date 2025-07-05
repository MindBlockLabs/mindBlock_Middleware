import { Injectable, type LogLevel } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

export interface LoggerConfig {
  enableDebug: boolean
  logLevel: LogLevel
}

@Injectable()
export class CustomLoggerService {
  private readonly enableDebug: boolean
  private readonly logLevel: LogLevel

  constructor(private configService: ConfigService) {
    this.enableDebug = this.configService.get<boolean>("ENABLE_DEBUG_LOGS", false)
    this.logLevel = this.configService.get<LogLevel>("LOG_LEVEL", "log")
  }

  private formatMessage(level: string, context: string, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${context}] [${level.toUpperCase()}] ${message}`
  }

  private shouldLog(level: string): boolean {
    if (level === "DEBUG" && !this.enableDebug) {
      return false
    }
    return true
  }

  createLogger(context: string) {
    return {
      info: (message: string) => {
        if (this.shouldLog("INFO")) {
          console.log(this.formatMessage("INFO", context, message))
        }
      },

      warn: (message: string) => {
        if (this.shouldLog("WARN")) {
          console.warn(this.formatMessage("WARN", context, message))
        }
      },

      error: (message: string, error?: Error) => {
        if (this.shouldLog("ERROR")) {
          const errorMessage = error ? `${message} - ${error.message}` : message
          console.error(this.formatMessage("ERROR", context, errorMessage))
          if (error && error.stack) {
            console.error(error.stack)
          }
        }
      },

      debug: (message: string) => {
        if (this.shouldLog("DEBUG")) {
          console.debug(this.formatMessage("DEBUG", context, message))
        }
      },
    }
  }
}

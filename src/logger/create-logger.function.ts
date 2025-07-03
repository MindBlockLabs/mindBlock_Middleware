import { ConfigService } from "@nestjs/config"

// Standalone function for use outside of NestJS context (CLI tools, etc.)
export function createLogger(context: string) {
  const configService = new ConfigService()
  const enableDebug = configService.get<boolean>("ENABLE_DEBUG_LOGS", false)

  const formatMessage = (level: string, context: string, message: string): string => {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${context}] [${level.toUpperCase()}] ${message}`
  }

  const shouldLog = (level: string): boolean => {
    if (level === "DEBUG" && !enableDebug) {
      return false
    }
    return true
  }

  return {
    info: (message: string) => {
      if (shouldLog("INFO")) {
        console.log(formatMessage("INFO", context, message))
      }
    },

    warn: (message: string) => {
      if (shouldLog("WARN")) {
        console.warn(formatMessage("WARN", context, message))
      }
    },

    error: (message: string, error?: Error) => {
      if (shouldLog("ERROR")) {
        const errorMessage = error ? `${message} - ${error.message}` : message
        console.error(formatMessage("ERROR", context, errorMessage))
        if (error && error.stack) {
          console.error(error.stack)
        }
      }
    },

    debug: (message: string) => {
      if (shouldLog("DEBUG")) {
        console.debug(formatMessage("DEBUG", context, message))
      }
    },
  }
}

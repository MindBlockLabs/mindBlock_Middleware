import { HttpClientService } from "./http-client.service"
import { ConsoleLoggerService } from "./logger/console-logger.service"
import { WinstonLoggerService } from "./logger/winston-logger.service"
import type { Logger } from "./interfaces/logger.interface.ts"
import type { RetryConfig } from "./interfaces/http-config.interface"

export class HttpClientFactory {
  static createWithConsoleLogger(baseURL?: string): HttpClientService {
    const logger = new ConsoleLoggerService()
    return new HttpClientService(logger, baseURL)
  }

  static createWithWinstonLogger(baseURL?: string): HttpClientService {
    const logger = new WinstonLoggerService()
    return new HttpClientService(logger, baseURL)
  }

  static createWithCustomLogger(logger: Logger, baseURL?: string): HttpClientService {
    return new HttpClientService(logger, baseURL)
  }

  static createConfiguredClient(config: {
    logger?: Logger
    baseURL?: string
    defaultRetry?: Partial<RetryConfig>
  }): HttpClientService {
    const logger = config.logger || new ConsoleLoggerService()
    const client = new HttpClientService(logger, config.baseURL)

    if (config.defaultRetry) {
      // Override default retry config
      ;(client as any).defaultRetryConfig = {
        ...(client as any).defaultRetryConfig,
        ...config.defaultRetry,
      }
    }

    return client
  }
}

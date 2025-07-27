import { Injectable, Logger } from "@nestjs/common"
import type { RetryConfig } from "../interfaces/event.interface"

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name)

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    onRetry?: (attempt: number, error: Error) => void,
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (attempt === config.maxAttempts) {
          this.logger.error(`Operation failed after ${config.maxAttempts} attempts:`, error.message)
          throw error
        }

        const delay = this.calculateDelay(attempt, config)
        this.logger.warn(`Operation failed on attempt ${attempt}, retrying in ${delay}ms:`, error.message)

        if (onRetry) {
          onRetry(attempt, error)
        }

        await this.sleep(delay)
      }
    }

    throw lastError
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5) // Add jitter
    return Math.min(jitteredDelay, config.maxDelay)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

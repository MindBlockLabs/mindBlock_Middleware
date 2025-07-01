import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import type { RetryConfig, HttpRequestConfig, HttpResponse, FailedAttempt } from "./interfaces/http-config.interface"
import type { Logger } from "./interfaces/logger.interface.ts"

export class HttpClientService {
  private axiosInstance: AxiosInstance
  private logger: Logger
  private defaultRetryConfig: RetryConfig

  constructor(logger: Logger, baseURL?: string) {
    this.logger = logger
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
    })

    this.defaultRetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryCondition: this.defaultRetryCondition,
    }

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.info("HTTP Request initiated", {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: this.sanitizeHeaders(config.headers),
        })
        return config
      },
      (error) => {
        this.logger.error("HTTP Request setup failed", { error: error.message })
        return Promise.reject(error)
      },
    )

 
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.info("HTTP Request successful", {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          statusText: response.statusText,
        })
        return response
      },
      (error) => {
     
        return Promise.reject(error)
      },
    )
  }

  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const retryConfig = { ...this.defaultRetryConfig, ...config.retry }
    const requestId = this.generateRequestId()

    this.logger.info("Starting HTTP request with retry logic", {
      requestId,
      url: config.url,
      method: config.method,
      maxRetries: retryConfig.maxRetries,
    })

    return this.executeWithRetry<T>(config, retryConfig, requestId)
  }

  async get<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "GET",
      ...config,
    })
  }

  async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "POST",
      data,
      ...config,
    })
  }

  async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "PUT",
      data,
      ...config,
    })
  }

  async delete<T = any>(url: string, config?: Partial<HttpRequestConfig>): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...config,
    })
  }

  private async executeWithRetry<T>(
    config: HttpRequestConfig,
    retryConfig: RetryConfig,
    requestId: string,
  ): Promise<HttpResponse<T>> {
    let lastError: Error
    const failedAttempts: FailedAttempt[] = []

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const axiosConfig: AxiosRequestConfig = {
          url: config.url,
          method: config.method.toLowerCase() as any,
          headers: config.headers,
          data: config.data,
          params: config.params,
          timeout: config.timeout,
        }

        const response: AxiosResponse<T> = await this.axiosInstance.request(axiosConfig)

        if (attempt > 0) {
          this.logger.info("HTTP request succeeded after retries", {
            requestId,
            url: config.url,
            method: config.method,
            attempt: attempt + 1,
            totalAttempts: attempt + 1,
            failedAttempts: failedAttempts.length,
          })
        }

        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers as Record<string, string>,
        }
      } catch (error) {
        lastError = error as Error
        const isLastAttempt = attempt === retryConfig.maxRetries
        const shouldRetry = retryConfig.retryCondition!(error) && !isLastAttempt

        const failedAttempt: FailedAttempt = {
          attemptNumber: attempt + 1,
          error: lastError,
          timestamp: new Date(),
        }

        if (shouldRetry) {
          const delay = this.calculateDelay(attempt, retryConfig)
          failedAttempt.nextRetryIn = delay

          this.logger.warn("HTTP request failed, retrying", {
            requestId,
            url: config.url,
            method: config.method,
            attempt: attempt + 1,
            maxRetries: retryConfig.maxRetries,
            error: this.extractErrorInfo(lastError),
            nextRetryIn: delay,
            retryInSeconds: Math.round(delay / 1000),
          })

          failedAttempts.push(failedAttempt)
          await this.delay(delay)
        } else {
          failedAttempts.push(failedAttempt)

          this.logger.error("HTTP request failed permanently", {
            requestId,
            url: config.url,
            method: config.method,
            totalAttempts: attempt + 1,
            maxRetries: retryConfig.maxRetries,
            error: this.extractErrorInfo(lastError),
            failedAttempts: failedAttempts.map((fa) => ({
              attempt: fa.attemptNumber,
              error: fa.error.message,
              timestamp: fa.timestamp,
            })),
          })

          break
        }
      }
    }

    throw new HttpRequestError(
      `HTTP request failed after ${retryConfig.maxRetries + 1} attempts`,
      lastError,
      failedAttempts,
      config,
    )
  }

  private defaultRetryCondition(error: any): boolean {
    if (!error.response) {
      // Network errors
      return true
    }

    const status = error.response.status

    return status >= 500 || status === 408 || status === 429
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt)
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5)
    return Math.min(jitteredDelay, config.maxDelay)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private extractErrorInfo(error: Error): any {
    if (axios.isAxiosError(error)) {
      return {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
      }
    }

    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    }
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    if (!headers) return {}

    const sanitized = { ...headers }
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key", "x-auth-token"]

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]"
      }
      if (sanitized[header.toLowerCase()]) {
        sanitized[header.toLowerCase()] = "[REDACTED]"
      }
    })

    return sanitized
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export class HttpRequestError extends Error {
  constructor(
    message: string,
    public readonly originalError: Error,
    public readonly failedAttempts: FailedAttempt[],
    public readonly requestConfig: HttpRequestConfig,
  ) {
    super(message)
    this.name = "HttpRequestError"
  }
}

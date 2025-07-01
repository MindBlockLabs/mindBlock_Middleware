export interface RetryConfig {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    backoffMultiplier: number
    retryCondition?: (error: any) => boolean
  }
  
  export interface HttpRequestConfig {
    url: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    headers?: Record<string, string>
    data?: any
    params?: Record<string, any>
    timeout?: number
    retry?: Partial<RetryConfig>
  }
  
  export interface HttpResponse<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
  }
  
  export interface FailedAttempt {
    attemptNumber: number
    error: Error
    timestamp: Date
    nextRetryIn?: number
  }
  
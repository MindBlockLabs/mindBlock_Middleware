export interface EventPayload {
  id: string
  type: string
  timestamp: string
  data: any
  source?: string
  version?: string
}

export interface EventTarget {
  url: string
  method: "POST" | "PUT" | "PATCH"
  headers?: Record<string, string>
  timeout?: number
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export interface EventLog {
  eventId: string
  eventType: string
  target: string
  attempt: number
  status: "success" | "failed" | "retrying"
  timestamp: Date
  error?: string
  responseTime?: number
}

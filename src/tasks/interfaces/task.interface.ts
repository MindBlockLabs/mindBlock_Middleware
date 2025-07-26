export enum TaskType {
  GENERATE_CHALLENGE = "generate-challenge",
  PROCESS_SUBMISSION = "process-submission",
  SEND_NOTIFICATION = "send-notification",
  UPDATE_LEADERBOARD = "update-leaderboard",
  GENERATE_REPORT = "generate-report",
  CLEANUP_DATA = "cleanup-data",
}

export enum TaskStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RETRYING = "RETRYING",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export interface TaskPayload {
  [key: string]: any
}

export interface TaskResult {
  success: boolean
  data?: any
  message?: string
  processingTime?: number
  metadata?: Record<string, any>
}

export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  payload: TaskPayload
  result?: TaskResult
  error?: string
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  retryCount: number
  maxRetries: number
  scheduledFor?: Date
  createdBy: string
  metadata?: Record<string, any>
}

export interface TaskFilter {
  type?: TaskType
  status?: TaskStatus
  priority?: TaskPriority
  createdBy?: string
  createdAfter?: Date
  createdBefore?: Date
}

export interface TaskStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  retrying: number
  cancelled: number
  averageProcessingTime: number
  successRate: number
}

export interface WorkerStatus {
  isRunning: boolean
  currentTask?: string
  processedTasks: number
  failedTasks: number
  startedAt: Date
  lastActivity?: Date
}

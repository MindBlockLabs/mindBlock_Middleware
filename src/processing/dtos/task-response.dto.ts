import type { ProcessingTaskEntity } from "../entities/task.entity"

export class TaskResponseDto {
  id: string
  title: string
  description: string | null
  taskType: string
  status: string
  priority: string
  payload: Record<string, any>
  result: Record<string, any> | null
  metadata: Record<string, any> | null
  error: string | null
  attempts: number
  maxAttempts: number
  assignedTo: string | null
  createdBy: string
  scheduledAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
  estimatedDurationMs: number | null
  actualDurationMs: number | null
  createdAt: Date
  updatedAt: Date
  progressPercentage: number
  canRetry: boolean

  constructor(task: ProcessingTaskEntity) {
    this.id = task.id
    this.title = task.title
    this.description = task.description
    this.taskType = task.taskType
    this.status = task.status
    this.priority = task.priority
    this.payload = task.payload
    this.result = task.result
    this.metadata = task.metadata
    this.error = task.error
    this.attempts = task.attempts
    this.maxAttempts = task.maxAttempts
    this.assignedTo = task.assignedTo
    this.createdBy = task.createdBy
    this.scheduledAt = task.scheduledAt
    this.startedAt = task.startedAt
    this.completedAt = task.completedAt
    this.estimatedDurationMs = task.estimatedDurationMs
    this.actualDurationMs = task.actualDurationMs
    this.createdAt = task.createdAt
    this.updatedAt = task.updatedAt
    this.progressPercentage = task.progressPercentage
    this.canRetry = task.canRetry
  }
}

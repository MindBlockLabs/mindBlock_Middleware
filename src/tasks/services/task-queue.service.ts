import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { Task, TaskFilter, TaskStats } from "../interfaces/task.interface"
import { TaskStatus } from "../interfaces/task.interface"

@Injectable()
export class TaskQueueService {
  private readonly logger = new Logger(TaskQueueService.name)
  private readonly tasks = new Map<string, Task>()
  private readonly maxQueueSize: number

  constructor(private readonly configService: ConfigService) {
    this.maxQueueSize = this.configService.get("MAX_QUEUE_SIZE", 1000)
  }

  async addTask(task: Task): Promise<void> {
    if (this.tasks.size >= this.maxQueueSize) {
      throw new Error(`Queue is full. Maximum size: ${this.maxQueueSize}`)
    }

    this.tasks.set(task.id, task)
    this.logger.debug(`Task ${task.id} added to queue`)
  }

  async getNextTask(): Promise<Task | null> {
    const availableTasks = Array.from(this.tasks.values()).filter((task) => {
      // Task must be pending or retrying
      if (![TaskStatus.PENDING, TaskStatus.RETRYING].includes(task.status)) {
        return false
      }

      // Check if task is scheduled for future execution
      if (task.scheduledFor && task.scheduledFor > new Date()) {
        return false
      }

      return true
    })

    if (availableTasks.length === 0) {
      return null
    }

    // Sort by priority (highest first), then by creation time (oldest first)
    availableTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })

    const nextTask = availableTasks[0]
    nextTask.status = TaskStatus.PROCESSING
    nextTask.startedAt = new Date()
    nextTask.updatedAt = new Date()

    this.tasks.set(nextTask.id, nextTask)
    return nextTask
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const task = this.tasks.get(taskId)
    if (!task) {
      return null
    }

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    }

    this.tasks.set(taskId, updatedTask)
    return updatedTask
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null
  }

  async getTasks(filter?: TaskFilter, limit = 50, offset = 0): Promise<Task[]> {
    let filteredTasks = Array.from(this.tasks.values())

    if (filter) {
      filteredTasks = filteredTasks.filter((task) => {
        if (filter.type && task.type !== filter.type) return false
        if (filter.status && task.status !== filter.status) return false
        if (filter.priority && task.priority !== filter.priority) return false
        if (filter.createdBy && task.createdBy !== filter.createdBy) return false
        if (filter.createdAfter && task.createdAt < filter.createdAfter) return false
        if (filter.createdBefore && task.createdAt > filter.createdBefore) return false
        return true
      })
    }

    // Sort by creation time (newest first)
    filteredTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return filteredTasks.slice(offset, offset + limit)
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const deleted = this.tasks.delete(taskId)
    if (deleted) {
      this.logger.debug(`Task ${taskId} deleted from queue`)
    }
    return deleted
  }

  async getStats(): Promise<TaskStats> {
    const tasks = Array.from(this.tasks.values())
    const total = tasks.length

    const statusCounts = tasks.reduce(
      (acc, task) => {
        acc[task.status.toLowerCase()]++
        return acc
      },
      {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retrying: 0,
        cancelled: 0,
      },
    )

    // Calculate average processing time for completed tasks
    const completedTasks = tasks.filter(
      (task) => task.status === TaskStatus.COMPLETED && task.startedAt && task.completedAt,
    )
    const totalProcessingTime = completedTasks.reduce((sum, task) => {
      return sum + (task.completedAt!.getTime() - task.startedAt!.getTime())
    }, 0)
    const averageProcessingTime = completedTasks.length > 0 ? totalProcessingTime / completedTasks.length : 0

    // Calculate success rate
    const finishedTasks = statusCounts.completed + statusCounts.failed
    const successRate = finishedTasks > 0 ? (statusCounts.completed / finishedTasks) * 100 : 0

    return {
      total,
      ...statusCounts,
      averageProcessingTime: Math.round(averageProcessingTime),
      successRate: Math.round(successRate * 100) / 100,
    }
  }

  async clearCompletedTasks(olderThanHours = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    let deletedCount = 0

    for (const [taskId, task] of this.tasks.entries()) {
      if (
        [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status) &&
        task.updatedAt < cutoffTime
      ) {
        this.tasks.delete(taskId)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleared ${deletedCount} completed tasks older than ${olderThanHours} hours`)
    }

    return deletedCount
  }

  getQueueSize(): number {
    return this.tasks.size
  }

  getMaxQueueSize(): number {
    return this.maxQueueSize
  }
}

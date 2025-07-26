import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { v4 as uuidv4 } from "uuid"
import type { TaskQueueService } from "./task-queue.service"
import type { LoggerService } from "./logger.service"
import type { CreateTaskDto, UpdateTaskDto } from "../dto/create-task.dto"
import type { Task, TaskFilter, TaskStats, TaskResult } from "../interfaces/task.interface"
import { TaskStatus, TaskPriority } from "../interfaces/task.interface"

@Injectable()
export class TaskService {
  constructor(
    private readonly configService: ConfigService,
    private readonly taskQueueService: TaskQueueService,
    private readonly loggerService: LoggerService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      type: createTaskDto.type,
      status: TaskStatus.PENDING,
      priority: createTaskDto.priority || TaskPriority.NORMAL,
      payload: createTaskDto.payload,
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: createTaskDto.maxRetries || 3,
      scheduledFor: createTaskDto.scheduledFor ? new Date(createTaskDto.scheduledFor) : undefined,
      createdBy: createTaskDto.createdBy,
      metadata: createTaskDto.metadata,
    }

    await this.taskQueueService.addTask(task)
    this.loggerService.logTaskCreated(task)

    return task
  }

  async getTask(taskId: string): Promise<Task | null> {
    return this.taskQueueService.getTask(taskId)
  }

  async getTasks(filter?: TaskFilter, limit = 50, offset = 0): Promise<Task[]> {
    return this.taskQueueService.getTasks(filter, limit, offset)
  }

  async updateTask(taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const existingTask = await this.taskQueueService.getTask(taskId)
    if (!existingTask) {
      return null
    }

    // Only allow updates to certain fields for non-processing tasks
    if (existingTask.status === TaskStatus.PROCESSING) {
      throw new Error("Cannot update task while it's being processed")
    }

    const updates: Partial<Task> = {}

    if (updateTaskDto.priority !== undefined) {
      updates.priority = updateTaskDto.priority
    }

    if (updateTaskDto.maxRetries !== undefined) {
      updates.maxRetries = updateTaskDto.maxRetries
    }

    if (updateTaskDto.scheduledFor !== undefined) {
      updates.scheduledFor = new Date(updateTaskDto.scheduledFor)
    }

    if (updateTaskDto.metadata !== undefined) {
      updates.metadata = { ...existingTask.metadata, ...updateTaskDto.metadata }
    }

    const updatedTask = await this.taskQueueService.updateTask(taskId, updates)

    if (updatedTask) {
      this.loggerService.logCustomEvent("Task Updated", {
        taskId: updatedTask.id,
        type: updatedTask.type,
        changes: Object.keys(updates),
      })
    }

    return updatedTask
  }

  async cancelTask(taskId: string, reason?: string): Promise<Task | null> {
    const task = await this.taskQueueService.getTask(taskId)
    if (!task) {
      return null
    }

    if (task.status === TaskStatus.PROCESSING) {
      throw new Error("Cannot cancel task while it's being processed")
    }

    if ([TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status)) {
      throw new Error(`Cannot cancel task with status: ${task.status}`)
    }

    const updatedTask = await this.taskQueueService.updateTask(taskId, {
      status: TaskStatus.CANCELLED,
      error: reason || "Task cancelled by user",
      completedAt: new Date(),
    })

    if (updatedTask) {
      this.loggerService.logTaskCancelled(updatedTask, reason)
    }

    return updatedTask
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = await this.taskQueueService.getTask(taskId)
    if (!task) {
      return false
    }

    if (task.status === TaskStatus.PROCESSING) {
      throw new Error("Cannot delete task while it's being processed")
    }

    const deleted = await this.taskQueueService.deleteTask(taskId)

    if (deleted) {
      this.loggerService.logCustomEvent("Task Deleted", {
        taskId: task.id,
        type: task.type,
        status: task.status,
      })
    }

    return deleted
  }

  async getStats(): Promise<TaskStats> {
    return this.taskQueueService.getStats()
  }

  async retryTask(taskId: string): Promise<Task | null> {
    const task = await this.taskQueueService.getTask(taskId)
    if (!task) {
      return null
    }

    if (task.status !== TaskStatus.FAILED) {
      throw new Error("Only failed tasks can be retried")
    }

    if (task.retryCount >= task.maxRetries) {
      throw new Error("Task has exceeded maximum retry attempts")
    }

    const updatedTask = await this.taskQueueService.updateTask(taskId, {
      status: TaskStatus.RETRYING,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    })

    if (updatedTask) {
      this.loggerService.logCustomEvent("Task Retry Requested", {
        taskId: updatedTask.id,
        type: updatedTask.type,
        retryCount: updatedTask.retryCount,
      })
    }

    return updatedTask
  }

  // Internal method used by worker
  async markTaskCompleted(taskId: string, result: TaskResult, processingTime: number): Promise<Task | null> {
    const updatedTask = await this.taskQueueService.updateTask(taskId, {
      status: TaskStatus.COMPLETED,
      result,
      completedAt: new Date(),
    })

    if (updatedTask) {
      this.loggerService.logTaskCompleted(updatedTask, result, processingTime)
    }

    return updatedTask
  }

  // Internal method used by worker
  async markTaskFailed(taskId: string, error: string, processingTime?: number): Promise<Task | null> {
    const task = await this.taskQueueService.getTask(taskId)
    if (!task) {
      return null
    }

    const shouldRetry = task.retryCount < task.maxRetries
    const newStatus = shouldRetry ? TaskStatus.RETRYING : TaskStatus.FAILED

    const updatedTask = await this.taskQueueService.updateTask(taskId, {
      status: newStatus,
      error,
      retryCount: task.retryCount + 1,
      completedAt: newStatus === TaskStatus.FAILED ? new Date() : undefined,
      startedAt: undefined, // Reset for retry
    })

    if (updatedTask) {
      if (shouldRetry) {
        this.loggerService.logTaskRetrying(updatedTask, error)
      } else {
        this.loggerService.logTaskFailed(updatedTask, error, processingTime)
      }
    }

    return updatedTask
  }

  async cleanupOldTasks(olderThanHours = 24): Promise<number> {
    return this.taskQueueService.clearCompletedTasks(olderThanHours)
  }
}

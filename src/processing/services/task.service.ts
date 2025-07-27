import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import type { TaskRepository } from "../repositories/task.repository"
import type { CreateTaskDto } from "../dtos/create-task.dto"
import type { UpdateTaskStatusDto } from "../dtos/update-task-status.dto"
import type { TaskQueryDto } from "../dtos/task-query.dto"
import { TaskResponseDto } from "../dtos/task-response.dto"
import { TaskStatus } from "../enums/task-status.enum"

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)

  constructor(private readonly taskRepository: TaskRepository) {}

  /**
   * Create a new task
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    try {
      const task = this.taskRepository.create({
        ...createTaskDto,
        scheduledAt: createTaskDto.scheduledAt ? new Date(createTaskDto.scheduledAt) : null,
        status: TaskStatus.PENDING,
      })

      const savedTask = await this.taskRepository.save(task)
      this.logger.log(`Task created: ${savedTask.id} - ${savedTask.title}`)

      return new TaskResponseDto(savedTask)
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`, error.stack)
      throw new BadRequestException("Failed to create task")
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } })

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    return new TaskResponseDto(task)
  }

  /**
   * Get tasks with filtering and pagination
   */
  async getTasks(queryDto: TaskQueryDto): Promise<{
    tasks: TaskResponseDto[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const result = await this.taskRepository.findTasksWithFilters(queryDto)

    return {
      ...result,
      tasks: result.tasks.map((task) => new TaskResponseDto(task)),
    }
  }

  /**
   * Update task status and related fields
   */
  async updateTaskStatus(id: string, updateDto: UpdateTaskStatusDto): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } })

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    // Update task fields
    task.status = updateDto.status
    if (updateDto.result !== undefined) task.result = updateDto.result
    if (updateDto.error !== undefined) task.error = updateDto.error
    if (updateDto.metadata !== undefined) task.metadata = updateDto.metadata
    if (updateDto.assignedTo !== undefined) task.assignedTo = updateDto.assignedTo

    // Update timestamps based on status
    const now = new Date()
    switch (updateDto.status) {
      case TaskStatus.PROCESSING:
        if (!task.startedAt) task.startedAt = now
        break
      case TaskStatus.COMPLETED:
      case TaskStatus.FAILED:
      case TaskStatus.CANCELLED:
        if (!task.completedAt) task.completedAt = now
        if (task.startedAt && !task.actualDurationMs) {
          task.actualDurationMs = now.getTime() - task.startedAt.getTime()
        }
        break
    }

    // Increment attempts for failed tasks
    if (updateDto.status === TaskStatus.FAILED) {
      task.attempts++
    }

    const updatedTask = await this.taskRepository.save(task)
    this.logger.log(`Task ${id} status updated to ${updateDto.status}`)

    return new TaskResponseDto(updatedTask)
  }

  /**
   * Cancel a task
   */
  async cancelTask(id: string): Promise<TaskResponseDto> {
    return this.updateTaskStatus(id, { status: TaskStatus.CANCELLED })
  }

  /**
   * Retry a failed task
   */
  async retryTask(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } })

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    if (!task.canRetry) {
      throw new BadRequestException("Task cannot be retried")
    }

    // Reset task for retry
    task.status = TaskStatus.PENDING
    task.error = null
    task.startedAt = null
    task.completedAt = null
    task.actualDurationMs = null

    const retriedTask = await this.taskRepository.save(task)
    this.logger.log(`Task ${id} queued for retry (attempt ${task.attempts + 1}/${task.maxAttempts})`)

    return new TaskResponseDto(retriedTask)
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`)
    }

    this.logger.log(`Task ${id} deleted`)
  }

  /**
   * Get tasks ready for processing
   */
  async getTasksReadyForProcessing(limit = 10): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findTasksReadyForProcessing(limit)
    return tasks.map((task) => new TaskResponseDto(task))
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics() {
    return this.taskRepository.getTaskStatistics()
  }

  /**
   * Bulk update task statuses
   */
  async bulkUpdateTaskStatus(ids: string[], status: TaskStatus): Promise<number> {
    const result = await this.taskRepository.update(ids, { status })
    this.logger.log(`Bulk updated ${result.affected} tasks to status ${status}`)
    return result.affected || 0
  }
}

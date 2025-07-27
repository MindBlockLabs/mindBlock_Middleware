import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { TaskService } from "../services/task.service"
import type { CreateTaskDto } from "../dtos/create-task.dto"
import type { UpdateTaskStatusDto } from "../dtos/update-task-status.dto"
import type { TaskQueryDto } from "../dtos/task-query.dto"
import type { TaskStatus } from "../enums/task-status.enum"

@Controller("processing/tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create a new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto)
  }

  /**
   * Get all tasks with filtering and pagination
   */
  @Get()
  async getTasks(@Query() queryDto: TaskQueryDto) {
    return this.taskService.getTasks(queryDto)
  }

  /**
   * Get task statistics
   */
  @Get("statistics")
  async getTaskStatistics() {
    return this.taskService.getTaskStatistics()
  }

  /**
   * Get tasks ready for processing
   */
  @Get("ready-for-processing")
  async getTasksReadyForProcessing(@Query("limit") limit?: number) {
    return this.taskService.getTasksReadyForProcessing(limit)
  }

  /**
   * Get task by ID
   */
  @Get(":id")
  async getTaskById(@Param("id", ParseUUIDPipe) id: string) {
    return this.taskService.getTaskById(id)
  }

  /**
   * Update task status
   */
  @Put(":id/status")
  async updateTaskStatus(@Param("id", ParseUUIDPipe) id: string, @Body() updateDto: UpdateTaskStatusDto) {
    return this.taskService.updateTaskStatus(id, updateDto)
  }

  /**
   * Cancel a task
   */
  @Put(":id/cancel")
  async cancelTask(@Param("id", ParseUUIDPipe) id: string) {
    return this.taskService.cancelTask(id)
  }

  /**
   * Retry a failed task
   */
  @Put(":id/retry")
  async retryTask(@Param("id", ParseUUIDPipe) id: string) {
    return this.taskService.retryTask(id)
  }

  /**
   * Delete a task
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param("id", ParseUUIDPipe) id: string) {
    return this.taskService.deleteTask(id)
  }

  /**
   * Bulk update task statuses
   */
  @Put("bulk/status")
  async bulkUpdateTaskStatus(
    @Body() body: { ids: string[]; status: TaskStatus },
  ) {
    return {
      updated: await this.taskService.bulkUpdateTaskStatus(body.ids, body.status),
    }
  }
}

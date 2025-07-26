import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { TaskService } from "../services/task.service"
import type { TaskWorkerService } from "../services/task-worker.service"
import type { LoggerService } from "../services/logger.service"
import type { CreateTaskDto, UpdateTaskDto } from "../dto/create-task.dto"
import type { TaskFilter } from "../interfaces/task.interface"
import type { TaskType, TaskStatus, TaskPriority } from "../interfaces/task.interface"
import { AuthGuard } from "../guards/auth.guard"

@Controller("tasks")
@UseGuards(AuthGuard)
export class TaskController {
  private readonly logger = new Logger(TaskController.name)

  constructor(
    private readonly taskService: TaskService,
    private readonly taskWorkerService: TaskWorkerService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(createTaskDto: CreateTaskDto) {
    this.logger.log(`Creating task: ${createTaskDto.type}`)

    const task = await this.taskService.createTask(createTaskDto)

    this.loggerService.logCustomEvent("Task API Request", {
      taskId: task.id,
      type: task.type,
      action: "CREATE",
      createdBy: createTaskDto.createdBy,
    })

    return {
      success: true,
      data: task,
      message: "Task created successfully",
    }
  }

  @Get()
  async getTasks(
    @Query("type") type?: TaskType,
    @Query("status") status?: TaskStatus,
    @Query("priority") priority?: TaskPriority,
    @Query("createdBy") createdBy?: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    const filter: TaskFilter = {}

    if (type) filter.type = type
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (createdBy) filter.createdBy = createdBy

    const tasks = await this.taskService.getTasks(filter, Number(limit), Number(offset))

    this.loggerService.logCustomEvent("Task List Request", {
      taskId: "N/A",
      type: "API",
      action: "LIST",
      filter,
      resultCount: tasks.length,
    })

    return {
      success: true,
      data: tasks,
      meta: {
        count: tasks.length,
        limit: Number(limit),
        offset: Number(offset),
        filter,
      },
    }
  }

  @Get("stats")
  async getStats() {
    const stats = await this.taskService.getStats()

    this.loggerService.logCustomEvent("Stats Request", {
      taskId: "N/A",
      type: "API",
      action: "STATS",
      stats,
    })

    return {
      success: true,
      data: stats,
    }
  }

  @Get("worker/status")
  async getWorkerStatus() {
    const status = this.taskWorkerService.getStatus()

    return {
      success: true,
      data: status,
    }
  }

  @Post("worker/restart")
  @HttpCode(HttpStatus.OK)
  async restartWorker() {
    this.logger.log("Worker restart requested")

    await this.taskWorkerService.restartWorker()

    return {
      success: true,
      message: "Worker restarted successfully",
    }
  }

  @Get(":id")
  async getTask(@Param("id") id: string) {
    const task = await this.taskService.getTask(id)

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      }
    }

    this.loggerService.logCustomEvent("Task Detail Request", {
      taskId: task.id,
      type: task.type,
      action: "GET",
      status: task.status,
    })

    return {
      success: true,
      data: task,
    }
  }

  @Put(":id")
  async updateTask(@Param("id") id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.taskService.updateTask(id, updateTaskDto)

      if (!task) {
        return {
          success: false,
          message: "Task not found",
        }
      }

      return {
        success: true,
        data: task,
        message: "Task updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelTask(@Param("id") id: string, @Body("reason") reason?: string) {
    try {
      const task = await this.taskService.cancelTask(id, reason)

      if (!task) {
        return {
          success: false,
          message: "Task not found",
        }
      }

      return {
        success: true,
        data: task,
        message: "Task cancelled successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  @Post(":id/retry")
  @HttpCode(HttpStatus.OK)
  async retryTask(@Param("id") id: string) {
    try {
      const task = await this.taskService.retryTask(id)

      if (!task) {
        return {
          success: false,
          message: "Task not found",
        }
      }

      return {
        success: true,
        data: task,
        message: "Task queued for retry",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  @Delete(":id")
  async deleteTask(@Param("id") id: string) {
    try {
      const deleted = await this.taskService.deleteTask(id)

      if (!deleted) {
        return {
          success: false,
          message: "Task not found",
        }
      }

      return {
        success: true,
        message: "Task deleted successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  @Post("cleanup")
  @HttpCode(HttpStatus.OK)
  async cleanupOldTasks(@Body("olderThanHours") olderThanHours = 24) {
    const deletedCount = await this.taskService.cleanupOldTasks(olderThanHours)

    this.loggerService.logCustomEvent("Manual Cleanup", {
      taskId: "N/A",
      type: "CLEANUP",
      action: "MANUAL",
      deletedCount,
      olderThanHours,
    })

    return {
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old tasks`,
    }
  }
}

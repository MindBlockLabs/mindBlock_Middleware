import { Controller, Post, Get, Param, NotFoundException } from "@nestjs/common"
import type { TaskWorkerService } from "./task-worker.service"
import type { TaskEntity } from "./entities/task.entity"

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskWorkerService: TaskWorkerService) {}

  @Post()
  async createTask(payload: Record<string, any>): Promise<TaskEntity> {
    return this.taskWorkerService.createTask(payload)
  }

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<TaskEntity> {
    const task = await this.taskWorkerService['tasksRepository'].findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  @Get()
  async getAllTasks(): Promise<TaskEntity[]> {
    return this.taskWorkerService["tasksRepository"].find()
  }
}

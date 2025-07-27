import { Injectable } from "@nestjs/common"
import { Repository, type DataSource, type SelectQueryBuilder } from "typeorm"
import { ProcessingTaskEntity } from "../entities/task.entity"
import { TaskStatus } from "../enums/task-status.enum"
import type { TaskQueryDto } from "../dtos/task-query.dto"

@Injectable()
export class TaskRepository extends Repository<ProcessingTaskEntity> {
  constructor(private dataSource: DataSource) {
    super(ProcessingTaskEntity, dataSource.createEntityManager())
  }

  /**
   * Find tasks with advanced filtering and pagination
   */
  async findTasksWithFilters(queryDto: TaskQueryDto): Promise<{
    tasks: ProcessingTaskEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC", ...filters } = queryDto

    let queryBuilder: SelectQueryBuilder<ProcessingTaskEntity> = this.createQueryBuilder("task")

    // Apply filters
    if (filters.status) {
      queryBuilder = queryBuilder.andWhere("task.status = :status", { status: filters.status })
    }

    if (filters.taskType) {
      queryBuilder = queryBuilder.andWhere("task.taskType = :taskType", { taskType: filters.taskType })
    }

    if (filters.priority) {
      queryBuilder = queryBuilder.andWhere("task.priority = :priority", { priority: filters.priority })
    }

    if (filters.createdBy) {
      queryBuilder = queryBuilder.andWhere("task.createdBy = :createdBy", { createdBy: filters.createdBy })
    }

    if (filters.assignedTo) {
      queryBuilder = queryBuilder.andWhere("task.assignedTo = :assignedTo", { assignedTo: filters.assignedTo })
    }

    // Get total count
    const total = await queryBuilder.getCount()

    // Apply sorting and pagination
    queryBuilder = queryBuilder
      .orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)

    const tasks = await queryBuilder.getMany()

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Find tasks that are ready for processing
   */
  async findTasksReadyForProcessing(limit = 10): Promise<ProcessingTaskEntity[]> {
    return this.createQueryBuilder("task")
      .where("task.status IN (:...statuses)", { statuses: [TaskStatus.PENDING, TaskStatus.QUEUED] })
      .andWhere("(task.scheduledAt IS NULL OR task.scheduledAt <= :now)", { now: new Date() })
      .orderBy("task.priority", "DESC")
      .addOrderBy("task.createdAt", "ASC")
      .take(limit)
      .getMany()
  }

  /**
   * Find failed tasks that can be retried
   */
  async findRetryableTasks(): Promise<ProcessingTaskEntity[]> {
    return this.createQueryBuilder("task")
      .where("task.status = :status", { status: TaskStatus.FAILED })
      .andWhere("task.attempts < task.maxAttempts")
      .getMany()
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(): Promise<{
    total: number
    byStatus: Record<TaskStatus, number>
    byType: Record<string, number>
  }> {
    const total = await this.count()

    const statusStats = await this.createQueryBuilder("task")
      .select("task.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("task.status")
      .getRawMany()

    const typeStats = await this.createQueryBuilder("task")
      .select("task.taskType", "taskType")
      .addSelect("COUNT(*)", "count")
      .groupBy("task.taskType")
      .getRawMany()

    const byStatus = statusStats.reduce(
      (acc, stat) => {
        acc[stat.status as TaskStatus] = Number.parseInt(stat.count)
        return acc
      },
      {} as Record<TaskStatus, number>,
    )

    const byType = typeStats.reduce(
      (acc, stat) => {
        acc[stat.taskType] = Number.parseInt(stat.count)
        return acc
      },
      {} as Record<string, number>,
    )

    return { total, byStatus, byType }
  }
}

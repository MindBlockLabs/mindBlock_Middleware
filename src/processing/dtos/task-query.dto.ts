import { IsOptional, IsEnum, IsString, IsInt, Min } from "class-validator"
import { TaskStatus } from "../enums/task-status.enum"
import { TaskType } from "../enums/task-type.enum"
import { TaskPriority } from "../enums/task-priority.enum"

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @IsOptional()
  @IsString()
  createdBy?: string

  @IsOptional()
  @IsString()
  assignedTo?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"
}

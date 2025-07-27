import { IsString, IsEnum, IsOptional, IsObject, IsInt, IsDateString, Min, Max } from "class-validator"
import { TaskType } from "../enums/task-type.enum"
import { TaskPriority } from "../enums/task-priority.enum"

export class CreateTaskDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(TaskType)
  taskType: TaskType

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.NORMAL

  @IsObject()
  payload: Record<string, any>

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsString()
  createdBy: string

  @IsOptional()
  @IsString()
  assignedTo?: string

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts?: number = 3

  @IsOptional()
  @IsInt()
  @Min(1000)
  estimatedDurationMs?: number
}

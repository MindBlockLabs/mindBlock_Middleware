import { IsEnum, IsObject, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from "class-validator"
import { TaskType, TaskPriority, type TaskPayload } from "../interfaces/task.interface"

export class CreateTaskDto {
  @IsEnum(TaskType)
  type: TaskType

  @IsObject()
  payload: TaskPayload

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.NORMAL

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number = 3

  @IsOptional()
  @IsDateString()
  scheduledFor?: string

  @IsString()
  createdBy: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number

  @IsOptional()
  @IsDateString()
  scheduledFor?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

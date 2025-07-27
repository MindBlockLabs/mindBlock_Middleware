import { IsEnum, IsOptional, IsObject, IsString } from "class-validator"
import { TaskStatus } from "../enums/task-status.enum"

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus

  @IsOptional()
  @IsObject()
  result?: Record<string, any>

  @IsOptional()
  @IsString()
  error?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsString()
  assignedTo?: string
}

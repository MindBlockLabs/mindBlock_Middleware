import { IsString, IsObject, IsOptional, IsDateString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class WebhookEventDto {
  @IsString()
  id: string

  @IsString()
  type: string

  @IsDateString()
  timestamp: string

  @IsObject()
  data: any

  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsString()
  version?: string
}

export class ChallengeCreatedEventDto {
  @IsString()
  id: string

  @IsString()
  title: string

  @IsString()
  description: string

  @IsString()
  createdBy: string

  @IsDateString()
  createdAt: string

  @IsOptional()
  @IsString()
  difficulty?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class UserUpdatedEventDto {
  @IsString()
  id: string

  @IsString()
  email: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsDateString()
  updatedAt: string

  @IsOptional()
  @IsObject()
  changes?: Record<string, any>
}

export class EventDataDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChallengeCreatedEventDto)
  challengeCreated?: ChallengeCreatedEventDto

  @IsOptional()
  @ValidateNested()
  @Type(() => UserUpdatedEventDto)
  userUpdated?: UserUpdatedEventDto
}

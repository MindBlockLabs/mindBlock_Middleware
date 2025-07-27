import { IsString, IsNotEmpty, IsOptional, IsObject } from "class-validator"

export class ProcessAiContentDto {
  @IsString()
  @IsNotEmpty()
  contentId: string

  @IsString()
  @IsNotEmpty()
  contentType: string // e.g., 'text', 'image', 'video'

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>
}

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  to: string

  @IsString()
  @IsNotEmpty()
  subject: string

  @IsString()
  @IsNotEmpty()
  body: string

  @IsString()
  @IsOptional()
  template?: string
}

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  eventName: string

  @IsString()
  @IsNotEmpty()
  userId: string

  @IsObject()
  @IsOptional()
  properties?: Record<string, any>
}

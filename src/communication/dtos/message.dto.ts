import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id: string
  @ApiProperty()
  payload: any
  @ApiProperty()
  timestamp: number
  @ApiProperty()
  sourceService: string
  @ApiPropertyOptional()
  targetService?: string
  @ApiPropertyOptional()
  eventType?: string // For event-based communication
  @ApiPropertyOptional()
  requestType?: string // For request-response communication
}

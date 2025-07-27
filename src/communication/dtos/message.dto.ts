export class MessageDto {
  id: string
  payload: any
  timestamp: number
  sourceService: string
  targetService?: string
  eventType?: string // For event-based communication
  requestType?: string // For request-response communication
}

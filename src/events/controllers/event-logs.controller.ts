import { Controller, Get, Logger } from "@nestjs/common"
import type { HttpEventService } from "../services/http-event.service"
import type { EventLog } from "../interfaces/event.interface"

@Controller("events/logs")
export class EventLogsController {
  private readonly logger = new Logger(EventLogsController.name)

  constructor(private readonly httpEventService: HttpEventService) {}

  @Get()
  getEventLogs(eventId?: string, eventType?: string): EventLog[] {
    this.logger.log(`Fetching event logs - eventId: ${eventId}, eventType: ${eventType}`)
    return this.httpEventService.getEventLogs(eventId, eventType)
  }

  @Get("failed")
  getFailedEvents(): EventLog[] {
    this.logger.log("Fetching failed events")
    return this.httpEventService.getFailedEvents()
  }
}

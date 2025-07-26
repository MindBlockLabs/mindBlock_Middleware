import { Injectable, Logger } from "@nestjs/common"
import type { HttpService } from "@nestjs/axios"
import { firstValueFrom } from "rxjs"
import type { RetryService } from "./retry.service"
import type { EventPayload, EventTarget, EventLog } from "../interfaces/event.interface"

@Injectable()
export class HttpEventService {
  private readonly logger = new Logger(HttpEventService.name)
  private readonly eventLogs: EventLog[] = []

  constructor(
    private readonly httpService: HttpService,
    private readonly retryService: RetryService,
  ) {}

  async emitEvent(eventPayload: EventPayload, target: EventTarget): Promise<void> {
    const startTime = Date.now()

    try {
      await this.retryService.executeWithRetry(
        () => this.sendHttpRequest(eventPayload, target),
        {
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        (attempt, error) => {
          this.logEvent({
            eventId: eventPayload.id,
            eventType: eventPayload.type,
            target: target.url,
            attempt,
            status: "retrying",
            timestamp: new Date(),
            error: error.message,
          })
        },
      )

      const responseTime = Date.now() - startTime
      this.logEvent({
        eventId: eventPayload.id,
        eventType: eventPayload.type,
        target: target.url,
        attempt: 1,
        status: "success",
        timestamp: new Date(),
        responseTime,
      })

      this.logger.log(`Successfully emitted event ${eventPayload.id} to ${target.url}`)
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.logEvent({
        eventId: eventPayload.id,
        eventType: eventPayload.type,
        target: target.url,
        attempt: 3,
        status: "failed",
        timestamp: new Date(),
        error: error.message,
        responseTime,
      })

      this.logger.error(`Failed to emit event ${eventPayload.id} to ${target.url}:`, error.message)
      throw error
    }
  }

  private async sendHttpRequest(eventPayload: EventPayload, target: EventTarget): Promise<void> {
    const config = {
      method: target.method,
      url: target.url,
      data: eventPayload,
      headers: target.headers || {},
      timeout: target.timeout || 5000,
    }

    try {
      const response = await firstValueFrom(this.httpService.request(config))

      if (response.status >= 200 && response.status < 300) {
        this.logger.debug(`HTTP ${target.method} to ${target.url} succeeded with status ${response.status}`)
      } else {
        throw new Error(`HTTP request failed with status ${response.status}`)
      }
    } catch (error) {
      if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`)
      } else if (error.request) {
        throw new Error(`Network error: ${error.message}`)
      } else {
        throw new Error(`Request setup error: ${error.message}`)
      }
    }
  }

  private logEvent(log: EventLog): void {
    this.eventLogs.push(log)

    // Keep only the last 1000 logs to prevent memory issues
    if (this.eventLogs.length > 1000) {
      this.eventLogs.splice(0, this.eventLogs.length - 1000)
    }

    this.logger.debug(`Event log: ${JSON.stringify(log)}`)
  }

  getEventLogs(eventId?: string, eventType?: string): EventLog[] {
    let logs = this.eventLogs

    if (eventId) {
      logs = logs.filter((log) => log.eventId === eventId)
    }

    if (eventType) {
      logs = logs.filter((log) => log.eventType === eventType)
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getFailedEvents(): EventLog[] {
    return this.eventLogs.filter((log) => log.status === "failed")
  }
}

import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { HttpEventService } from "./http-event.service"
import type { WebhookEventDto } from "../dto/webhook-event.dto"
import type { EventPayload, EventTarget } from "../interfaces/event.interface"

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name)
  private readonly eventTargets: Map<string, EventTarget[]> = new Map()

  constructor(
    private readonly configService: ConfigService,
    private readonly httpEventService: HttpEventService,
  ) {
    this.initializeEventTargets()
  }

  private initializeEventTargets() {
    // Configure event targets based on event types
    this.eventTargets.set("challenge.created", [
      {
        url: this.configService.get("BACKEND_URL", "http://localhost:3001") + "/api/challenges/webhook",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.configService.get("BACKEND_API_KEY", ""),
        },
        timeout: 5000,
      },
      {
        url: this.configService.get("NOTIFICATION_SERVICE_URL", "http://localhost:3002") + "/notifications",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      },
    ])

    this.eventTargets.set("user.updated", [
      {
        url: this.configService.get("USER_SERVICE_URL", "http://localhost:3003") + "/users/sync",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.configService.get("USER_SERVICE_API_KEY", ""),
        },
        timeout: 5000,
      },
    ])

    // Add more event type mappings as needed
    this.eventTargets.set("payment.completed", [
      {
        url: this.configService.get("BILLING_SERVICE_URL", "http://localhost:3004") + "/payments/webhook",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    ])
  }

  async processEvent(webhookEvent: WebhookEventDto): Promise<void> {
    this.logger.log(`Processing event: ${webhookEvent.type} with ID: ${webhookEvent.id}`)

    const eventPayload: EventPayload = {
      id: webhookEvent.id,
      type: webhookEvent.type,
      timestamp: webhookEvent.timestamp,
      data: webhookEvent.data,
      source: webhookEvent.source,
      version: webhookEvent.version,
    }

    const targets = this.eventTargets.get(webhookEvent.type)

    if (!targets || targets.length === 0) {
      this.logger.warn(`No targets configured for event type: ${webhookEvent.type}`)
      return
    }

    // Emit events to all configured targets
    const promises = targets.map((target) => this.httpEventService.emitEvent(eventPayload, target))

    try {
      await Promise.allSettled(promises)
      this.logger.log(`Event ${webhookEvent.id} dispatched to ${targets.length} targets`)
    } catch (error) {
      this.logger.error(`Error dispatching event ${webhookEvent.id}:`, error.stack)
      throw error
    }
  }

  addEventTarget(eventType: string, target: EventTarget): void {
    const existingTargets = this.eventTargets.get(eventType) || []
    existingTargets.push(target)
    this.eventTargets.set(eventType, existingTargets)

    this.logger.log(`Added new target for event type: ${eventType}`)
  }

  removeEventTarget(eventType: string, targetUrl: string): void {
    const targets = this.eventTargets.get(eventType)
    if (targets) {
      const filteredTargets = targets.filter((target) => target.url !== targetUrl)
      this.eventTargets.set(eventType, filteredTargets)

      this.logger.log(`Removed target ${targetUrl} for event type: ${eventType}`)
    }
  }

  getEventTargets(eventType: string): EventTarget[] {
    return this.eventTargets.get(eventType) || []
  }
}

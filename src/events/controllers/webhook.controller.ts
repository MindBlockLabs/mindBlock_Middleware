import { Controller, Post, Headers, Logger, HttpCode, HttpStatus } from "@nestjs/common"
import type { EventDispatcherService } from "../services/event-dispatcher.service"
import type { WebhookEventDto } from "../dto/webhook-event.dto"

@Controller("events")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(private readonly eventDispatcher: EventDispatcherService) {}

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(payload: WebhookEventDto, @Headers() headers: Record<string, string>) {
    this.logger.log(`Received webhook event: ${payload.type}`)

    try {
      // Verify webhook signature if needed
      // await this.verifyWebhookSignature(payload, headers);

      await this.eventDispatcher.processEvent(payload)

      this.logger.log(`Successfully processed event: ${payload.type}`)
      return { success: true, message: "Event processed successfully" }
    } catch (error) {
      this.logger.error(`Failed to process event: ${payload.type}`, error.stack)
      throw error
    }
  }

  private async verifyWebhookSignature(payload: any, headers: Record<string, string>) {
    // Implement webhook signature verification logic here
    // This would typically involve checking HMAC signatures
    const signature = headers["x-webhook-signature"]
    if (!signature) {
      throw new Error("Missing webhook signature")
    }
    // Add your signature verification logic
  }
}

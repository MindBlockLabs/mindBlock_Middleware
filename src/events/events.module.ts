import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { WebhookController } from "./controllers/webhook.controller"
import { EventDispatcherService } from "./services/event-dispatcher.service"
import { HttpEventService } from "./services/http-event.service"
import { RetryService } from "./services/retry.service"

@Module({
  imports: [HttpModule],
  controllers: [WebhookController],
  providers: [EventDispatcherService, HttpEventService, RetryService],
  exports: [EventDispatcherService],
})
export class EventsModule {}

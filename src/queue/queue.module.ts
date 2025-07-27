import { Module } from "@nestjs/common"
import { BullMQModule } from "@nestjs/bullmq"
import { QueueService } from "./queue.service"
import { AiContentProcessor, EmailSendingProcessor, EventTrackingProcessor } from "./queue.processor"
import { QUEUE_NAMES, REDIS_OPTIONS } from "./constants"
import { QueueController } from "./queue.controller"

@Module({
  imports: [
    BullMQModule.forRoot({
      connection: REDIS_OPTIONS, // Centralized Redis connection for all queues
    }),
    BullMQModule.registerQueue(
      { name: QUEUE_NAMES.AI_CONTENT_PROCESSING },
      { name: QUEUE_NAMES.EMAIL_SENDING },
      { name: QUEUE_NAMES.EVENT_TRACKING },
    ),
  ],
  controllers: [QueueController],
  providers: [QueueService, AiContentProcessor, EmailSendingProcessor, EventTrackingProcessor],
  exports: [QueueService], // Export QueueService so other modules can add jobs
})
export class QueueModule {}

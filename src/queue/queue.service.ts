import { Injectable, Logger } from "@nestjs/common"
import { Queue } from "bullmq"
import { QUEUE_NAMES } from "./constants"
import type { ProcessAiContentDto, SendEmailDto, TrackEventDto } from "./dtos/process-ai-content.dto"

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)

  private aiContentQueue: Queue
  private emailSendingQueue: Queue
  private eventTrackingQueue: Queue

  constructor() {
    this.aiContentQueue = new Queue(QUEUE_NAMES.AI_CONTENT_PROCESSING)
    this.emailSendingQueue = new Queue(QUEUE_NAMES.EMAIL_SENDING)
    this.eventTrackingQueue = new Queue(QUEUE_NAMES.EVENT_TRACKING)
  }

  async addAiContentProcessingJob(data: ProcessAiContentDto) {
    this.logger.log(`Adding AI content processing job for contentId: ${data.contentId}`)
    const job = await this.aiContentQueue.add(
      "process-ai-content", // Job name
      data,
      {
        attempts: 3, // Retry up to 3 times on failure
        backoff: {
          type: "exponential", // Exponential backoff strategy
          delay: 1000, // Initial delay of 1 second
        },
        removeOnComplete: true, // Remove job from queue when complete
        removeOnFail: false, // Keep failed jobs for inspection
      },
    )
    this.logger.log(`AI content processing job added with ID: ${job.id}`)
    return job
  }

  async addEmailSendingJob(data: SendEmailDto, delayMs?: number) {
    this.logger.log(`Adding email sending job to: ${data.to}`)
    const job = await this.emailSendingQueue.add("send-email", data, {
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 5000, // Fixed delay of 5 seconds between retries
      },
      delay: delayMs, // Optional delay before the job starts
      removeOnComplete: true,
      removeOnFail: false,
    })
    this.logger.log(`Email sending job added with ID: ${job.id}`)
    return job
  }

  async addEventTrackingJob(data: TrackEventDto) {
    this.logger.log(`Adding event tracking job for event: ${data.eventName}`)
    const job = await this.eventTrackingQueue.add("track-event", data, {
      attempts: 1, // Events might not need retries if they are idempotent
      removeOnComplete: true,
      removeOnFail: true, // Remove failed event tracking jobs
    })
    this.logger.log(`Event tracking job added with ID: ${job.id}`)
    return job
  }
}

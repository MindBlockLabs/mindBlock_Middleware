import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq"
import type { Job } from "bullmq"
import { Logger } from "@nestjs/common"
import { QUEUE_NAMES } from "./constants"
import type { ProcessAiContentDto, SendEmailDto, TrackEventDto } from "./dtos/process-ai-content.dto"

@Processor(QUEUE_NAMES.AI_CONTENT_PROCESSING)
export class AiContentProcessor extends WorkerHost {
  private readonly logger = new Logger(AiContentProcessor.name)

  async process(job: Job<ProcessAiContentDto, any, string>): Promise<any> {
    this.logger.log(`Processing AI content job ${job.id} with data: ${JSON.stringify(job.data)}`)
    try {
      // Simulate AI content processing
      if (job.data.contentId === "fail-me") {
        throw new Error("Simulated AI content processing failure")
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate async work

      const result = {
        processedContentId: job.data.contentId,
        status: "completed",
        processedAt: new Date().toISOString(),
      }
      this.logger.log(`AI content job ${job.id} completed. Result: ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to process AI content job ${job.id}: ${error.message}`)
      throw error // Re-throw to allow BullMQ to handle retries
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} in queue ${job.queue.name} has completed.`)
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} in queue ${job.queue.name} has failed with error: ${err.message}. Attempts made: ${job.attemptsMade}`,
    )
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} of type ${job.name} in queue ${job.queue.name} is now active.`)
  }

  @OnWorkerEvent("stalled")
  onStalled(jobId: string) {
    this.logger.warn(`Job ${jobId} in queue ${this.worker.name} has stalled.`)
  }
}

@Processor(QUEUE_NAMES.EMAIL_SENDING)
export class EmailSendingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSendingProcessor.name)

  async process(job: Job<SendEmailDto, any, string>): Promise<any> {
    this.logger.log(`Processing email sending job ${job.id} to: ${job.data.to}`)
    try {
      // Simulate sending email
      if (job.data.to === "fail@example.com") {
        throw new Error("Simulated email sending failure")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async work

      const result = {
        emailTo: job.data.to,
        status: "sent",
        sentAt: new Date().toISOString(),
      }
      this.logger.log(`Email sending job ${job.id} completed. Result: ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to send email for job ${job.id}: ${error.message}`)
      throw error
    }
  }
}

@Processor(QUEUE_NAMES.EVENT_TRACKING)
export class EventTrackingProcessor extends WorkerHost {
  private readonly logger = new Logger(EventTrackingProcessor.name)

  async process(job: Job<TrackEventDto, any, string>): Promise<any> {
    this.logger.log(`Processing event tracking job ${job.id} for event: ${job.data.eventName}`)
    try {
      // Simulate tracking event
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate async work

      const result = {
        eventName: job.data.eventName,
        userId: job.data.userId,
        status: "tracked",
        trackedAt: new Date().toISOString(),
      }
      this.logger.log(`Event tracking job ${job.id} completed. Result: ${JSON.stringify(result)}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to track event for job ${job.id}: ${error.message}`)
      throw error
    }
  }
}

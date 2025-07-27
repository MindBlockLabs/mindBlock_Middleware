import { Controller, Post, HttpCode, HttpStatus } from "@nestjs/common"
import type { QueueService } from "./queue.service"
import type { ProcessAiContentDto, SendEmailDto, TrackEventDto } from "./dtos/process-ai-content.dto"

@Controller("queue")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post("process-ai-content")
  @HttpCode(HttpStatus.ACCEPTED)
  async processAiContent(data: ProcessAiContentDto) {
    const job = await this.queueService.addAiContentProcessingJob(data)
    return { message: "AI content processing job added", jobId: job.id }
  }

  @Post("send-email")
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(data: SendEmailDto) {
    const job = await this.queueService.addEmailSendingJob(data)
    return { message: "Email sending job added", jobId: job.id }
  }

  @Post("track-event")
  @HttpCode(HttpStatus.ACCEPTED)
  async trackEvent(data: TrackEventDto) {
    const job = await this.queueService.addEventTrackingJob(data)
    return { message: "Event tracking job added", jobId: job.id }
  }

  @Post("send-delayed-email")
  @HttpCode(HttpStatus.ACCEPTED)
  async sendDelayedEmail(data: SendEmailDto & { delayMs: number }) {
    const { delayMs, ...emailData } = data
    const job = await this.queueService.addEmailSendingJob(emailData, delayMs)
    return { message: `Delayed email sending job added, will run in ${delayMs}ms`, jobId: job.id }
  }
}

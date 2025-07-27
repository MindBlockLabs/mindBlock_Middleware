import { Injectable, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import type { ConfigService } from "@nestjs/config"
import type { HttpService } from "@nestjs/axios"
import { firstValueFrom } from "rxjs"
import type { TaskQueueService } from "./task-queue.service"
import type { TaskService } from "./task.service"
import type { LoggerService } from "./logger.service"
import type { Task, TaskResult, WorkerStatus } from "../interfaces/task.interface"
import { TaskType } from "../interfaces/task.interface"

@Injectable()
export class TaskWorkerService implements OnModuleInit, OnModuleDestroy {
  private isRunning = false
  private currentTask?: Task
  private processedTasks = 0
  private failedTasks = 0
  private startedAt: Date
  private lastActivity?: Date
  private workerInterval?: NodeJS.Timeout

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly taskQueueService: TaskQueueService,
    private readonly taskService: TaskService,
    private readonly loggerService: LoggerService,
  ) {}

  async onModuleInit() {
    this.startedAt = new Date()
    this.startWorker()
  }

  async onModuleDestroy() {
    this.stopWorker()
  }

  private startWorker(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.loggerService.logWorkerStarted()

    // Start processing loop
    this.processTasksLoop()
  }

  private stopWorker(): void {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    this.loggerService.logWorkerStopped()

    if (this.workerInterval) {
      clearTimeout(this.workerInterval)
    }
  }

  private async processTasksLoop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    try {
      const task = await this.taskQueueService.getNextTask()

      if (task) {
        await this.processTask(task)
      }

      // Schedule next iteration
      const delay = task ? 100 : 1000 // Process faster when tasks are available
      this.workerInterval = setTimeout(() => this.processTasksLoop(), delay)
    } catch (error) {
      this.loggerService.logWorkerError(`Worker loop error: ${error.message}`)
      // Continue processing after error
      this.workerInterval = setTimeout(() => this.processTasksLoop(), 5000)
    }
  }

  private async processTask(task: Task): Promise<void> {
    this.currentTask = task
    this.lastActivity = new Date()
    const startTime = Date.now()

    this.loggerService.logTaskPickedUp(task)

    try {
      const result = await this.executeTask(task)
      const processingTime = Date.now() - startTime

      await this.taskService.markTaskCompleted(task.id, result, processingTime)
      this.processedTasks++
    } catch (error) {
      const processingTime = Date.now() - startTime
      await this.taskService.markTaskFailed(task.id, error.message, processingTime)
      this.failedTasks++
    } finally {
      this.currentTask = undefined
    }
  }

  private async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now()

    try {
      let result: any

      switch (task.type) {
        case TaskType.GENERATE_CHALLENGE:
          result = await this.executeGenerateChallenge(task)
          break

        case TaskType.PROCESS_SUBMISSION:
          result = await this.executeProcessSubmission(task)
          break

        case TaskType.SEND_NOTIFICATION:
          result = await this.executeSendNotification(task)
          break

        case TaskType.UPDATE_LEADERBOARD:
          result = await this.executeUpdateLeaderboard(task)
          break

        case TaskType.GENERATE_REPORT:
          result = await this.executeGenerateReport(task)
          break

        case TaskType.CLEANUP_DATA:
          result = await this.executeCleanupData(task)
          break

        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      const processingTime = Date.now() - startTime

      return {
        success: true,
        data: result,
        message: `Task completed successfully`,
        processingTime,
        metadata: {
          executedAt: new Date(),
          taskType: task.type,
        },
      }
    } catch (error) {
      const processingTime = Date.now() - startTime

      return {
        success: false,
        message: `Task failed: ${error.message}`,
        processingTime,
        metadata: {
          executedAt: new Date(),
          taskType: task.type,
          error: error.message,
        },
      }
    }
  }

  private async executeGenerateChallenge(task: Task): Promise<any> {
    const { difficulty, category, userId } = task.payload

    // Simulate API call to backend service
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.configService.get("BACKEND_URL")}/api/challenges/generate`,
        {
          difficulty,
          category,
          requestedBy: userId,
        },
        {
          headers: {
            "X-API-Key": this.configService.get("BACKEND_API_KEY"),
          },
          timeout: 30000,
        },
      ),
    )

    return {
      challengeId: response.data.id,
      title: response.data.title,
      description: response.data.description,
      difficulty: response.data.difficulty,
      category: response.data.category,
    }
  }

  private async executeProcessSubmission(task: Task): Promise<any> {
    const { submissionId, challengeId, userId, code } = task.payload

    // Simulate processing submission
    await this.simulateDelay(2000, 5000)

    // Mock evaluation result
    const testResults = [
      { testCase: 1, passed: true, executionTime: 45 },
      { testCase: 2, passed: true, executionTime: 52 },
      { testCase: 3, passed: false, executionTime: 0, error: "Time limit exceeded" },
    ]

    const score = testResults.filter((t) => t.passed).length * 10
    const passed = testResults.every((t) => t.passed)

    return {
      submissionId,
      challengeId,
      userId,
      score,
      passed,
      testResults,
      totalExecutionTime: testResults.reduce((sum, t) => sum + t.executionTime, 0),
    }
  }

  private async executeSendNotification(task: Task): Promise<any> {
    const { userId, type, title, message, data } = task.payload

    // Simulate sending notification
    await this.simulateDelay(500, 1500)

    return {
      notificationId: `notif_${Date.now()}`,
      userId,
      type,
      title,
      message,
      sentAt: new Date(),
      deliveryStatus: "sent",
    }
  }

  private async executeUpdateLeaderboard(task: Task): Promise<any> {
    const { userId, challengeId, score, type } = task.payload

    // Simulate leaderboard update
    await this.simulateDelay(1000, 3000)

    return {
      userId,
      challengeId,
      score,
      leaderboardType: type,
      newRank: Math.floor(Math.random() * 100) + 1,
      previousRank: Math.floor(Math.random() * 100) + 1,
      updatedAt: new Date(),
    }
  }

  private async executeGenerateReport(task: Task): Promise<any> {
    const { reportType, userId, dateRange } = task.payload

    // Simulate report generation
    await this.simulateDelay(5000, 15000)

    return {
      reportId: `report_${Date.now()}`,
      reportType,
      userId,
      dateRange,
      generatedAt: new Date(),
      fileUrl: `https://reports.example.com/report_${Date.now()}.pdf`,
      size: Math.floor(Math.random() * 1000000) + 100000, // Random file size
    }
  }

  private async executeCleanupData(task: Task): Promise<any> {
    const { dataType, olderThanDays } = task.payload

    // Simulate data cleanup
    await this.simulateDelay(2000, 8000)

    const deletedCount = Math.floor(Math.random() * 1000) + 10

    return {
      dataType,
      olderThanDays,
      deletedCount,
      cleanedAt: new Date(),
      spaceSaved: `${(deletedCount * 0.5).toFixed(2)} MB`,
    }
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Cleanup old completed tasks every hour
  @Cron("0 * * * *")
  async cleanupOldTasks(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    try {
      const deletedCount = await this.taskService.cleanupOldTasks(24)
      if (deletedCount > 0) {
        this.loggerService.logCustomEvent("Tasks Cleaned Up", {
          taskId: "N/A",
          type: "CLEANUP",
          deletedCount,
        })
      }
    } catch (error) {
      this.loggerService.logWorkerError(`Cleanup error: ${error.message}`)
    }
  }

  getStatus(): WorkerStatus {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask?.id,
      processedTasks: this.processedTasks,
      failedTasks: this.failedTasks,
      startedAt: this.startedAt,
      lastActivity: this.lastActivity,
    }
  }

  async restartWorker(): Promise<void> {
    this.loggerService.logCustomEvent("Worker Restart", {
      taskId: "N/A",
      type: "SYSTEM",
      processedTasks: this.processedTasks,
      failedTasks: this.failedTasks,
    })

    this.stopWorker()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.startWorker()
  }
}

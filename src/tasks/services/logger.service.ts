import { Injectable, type LoggerService as NestLoggerService } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { Task, TaskResult } from "../interfaces/task.interface"

export interface TaskLogContext {
  taskId: string
  type: string
  status?: string
  result?: TaskResult
  error?: string
  processingTime?: number
  retryCount?: number
  createdBy?: string
  metadata?: Record<string, any>
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly serviceName = "TaskService"
  private readonly enableStructuredLogs: boolean

  constructor(private readonly configService: ConfigService) {
    this.enableStructuredLogs = this.configService.get("ENABLE_STRUCTURED_LOGS", "true") === "true"
  }

  // Task-specific logging methods
  logTaskCreated(task: Task): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      createdBy: task.createdBy,
      metadata: {
        priority: task.priority,
        maxRetries: task.maxRetries,
        scheduledFor: task.scheduledFor,
        ...task.metadata,
      },
    }

    this.logStructured("info", "[Task Created]", context)
  }

  logTaskPickedUp(task: Task): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      retryCount: task.retryCount,
    }

    this.logStructured("info", "[Task Processing]", context)
  }

  logTaskCompleted(task: Task, result: TaskResult, processingTime: number): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      result,
      processingTime,
      retryCount: task.retryCount,
    }

    this.logStructured("info", "[Task Completed]", context)
  }

  logTaskFailed(task: Task, error: string, processingTime?: number): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      error,
      processingTime,
      retryCount: task.retryCount,
    }

    this.logStructured("error", "[Task Failed]", context)
  }

  logTaskRetrying(task: Task, error: string): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      error,
      retryCount: task.retryCount,
    }

    this.logStructured("warn", "[Task Retrying]", context)
  }

  logTaskCancelled(task: Task, reason?: string): void {
    const context: TaskLogContext = {
      taskId: task.id,
      type: task.type,
      status: task.status,
      error: reason,
    }

    this.logStructured("warn", "[Task Cancelled]", context)
  }

  logWorkerStarted(): void {
    this.logStructured("info", "[Worker Started]", {
      taskId: "N/A",
      type: "SYSTEM",
      status: "RUNNING",
    })
  }

  logWorkerStopped(): void {
    this.logStructured("info", "[Worker Stopped]", {
      taskId: "N/A",
      type: "SYSTEM",
      status: "STOPPED",
    })
  }

  logWorkerError(error: string): void {
    this.logStructured("error", "[Worker Error]", {
      taskId: "N/A",
      type: "SYSTEM",
      error,
    })
  }

  // Standard NestJS Logger interface implementation
  log(message: any, context?: string): void {
    this.logStructured("info", message, { taskId: "N/A", type: "GENERAL" }, context)
  }

  error(message: any, trace?: string, context?: string): void {
    this.logStructured("error", message, { taskId: "N/A", type: "GENERAL", error: trace }, context)
  }

  warn(message: any, context?: string): void {
    this.logStructured("warn", message, { taskId: "N/A", type: "GENERAL" }, context)
  }

  debug(message: any, context?: string): void {
    this.logStructured("debug", message, { taskId: "N/A", type: "GENERAL" }, context)
  }

  verbose(message: any, context?: string): void {
    this.logStructured("verbose", message, { taskId: "N/A", type: "GENERAL" }, context)
  }

  private logStructured(
    level: "info" | "error" | "warn" | "debug" | "verbose",
    message: string,
    context: TaskLogContext,
    serviceContext?: string,
  ): void {
    const timestamp = new Date().toISOString()
    const logContext = serviceContext || this.serviceName

    if (this.enableStructuredLogs) {
      // Structured JSON logging
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        service: logContext,
        message,
        ...context,
      }

      console.log(JSON.stringify(logEntry))
    } else {
      // Human-readable logging
      const contextStr = this.formatContextForHuman(context)
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${logContext}] ${message} ${contextStr}`

      switch (level) {
        case "error":
          console.error(logMessage)
          break
        case "warn":
          console.warn(logMessage)
          break
        case "debug":
          console.debug(logMessage)
          break
        case "verbose":
          console.log(logMessage)
          break
        default:
          console.log(logMessage)
      }
    }
  }

  private formatContextForHuman(context: TaskLogContext): string {
    const parts: string[] = []

    if (context.taskId && context.taskId !== "N/A") {
      parts.push(`ID=${context.taskId}`)
    }

    if (context.type) {
      parts.push(`TYPE=${context.type}`)
    }

    if (context.status) {
      parts.push(`STATUS=${context.status}`)
    }

    if (context.result) {
      parts.push(`RESULT=${JSON.stringify(context.result)}`)
    }

    if (context.error) {
      parts.push(`ERROR="${context.error}"`)
    }

    if (context.processingTime) {
      parts.push(`TIME=${context.processingTime}ms`)
    }

    if (context.retryCount !== undefined && context.retryCount > 0) {
      parts.push(`RETRY=${context.retryCount}`)
    }

    if (context.createdBy) {
      parts.push(`BY=${context.createdBy}`)
    }

    return parts.length > 0 ? parts.join(" ") : ""
  }

  // Utility method for custom structured logging
  logCustomEvent(event: string, data: Record<string, any>): void {
    this.logStructured("info", `[${event}]`, {
      taskId: data.taskId || "N/A",
      type: data.type || "CUSTOM",
      ...data,
    })
  }
}

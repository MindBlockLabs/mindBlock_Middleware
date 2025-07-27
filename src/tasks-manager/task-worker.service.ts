import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Interval } from "@nestjs/schedule"
import type { TaskEntity } from "./entities/task.entity"
import { TaskStatus } from "./enums/task-status.enum"
import { LessThan } from "typeorm"

const MAX_RETRIES = 3 // Maximum attempts for a task before marking as FAILED
const POLLING_INTERVAL_MS = 5000 // Poll every 5 seconds

@Injectable()
export class TaskWorkerService {
  private readonly logger = new Logger(TaskWorkerService.name)

  constructor(private tasksRepository: Repository<TaskEntity>) {}

  /**
   * Scheduled method to poll for pending tasks.
   * Runs every POLLING_INTERVAL_MS.
   */
  @Interval(POLLING_INTERVAL_MS)
  async pollForPendingTasks() {
    this.logger.debug(`Polling for PENDING tasks...`)
    try {
      // Find tasks that are PENDING and have not exceeded max retries
      const pendingTasks = await this.tasksRepository.find({
        where: {
          status: TaskStatus.PENDING,
          attempts: LessThan(MAX_RETRIES), // Ensure we don't pick up tasks that have already failed too many times
        },
        order: {
          createdAt: "ASC", // Process older tasks first
        },
        take: 10, // Process a batch of tasks to avoid overwhelming the system
      })

      if (pendingTasks.length === 0) {
        this.logger.debug("No PENDING tasks found.")
        return
      }

      this.logger.log(`Found ${pendingTasks.length} PENDING tasks. Processing...`)

      // Process tasks concurrently
      await Promise.all(pendingTasks.map((task) => this.processTask(task)))
    } catch (error) {
      this.logger.error("Error polling for tasks:", error.stack)
    }
  }

  /**
   * Utility function to process a single task.
   * Contains the core business logic for the background job.
   */
  private async processTask(task: TaskEntity): Promise<void> {
    this.logger.log(`Processing task ${task.id} (Attempt: ${task.attempts + 1})...`)

    // Mark task as PROCESSING to prevent other workers from picking it up
    task.status = TaskStatus.PROCESSING
    await this.tasksRepository.save(task)

    try {
      // --- Mocked Task Processing Logic ---
      // Simulate an asynchronous operation
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 3000 + 500)) // 0.5 to 3.5 seconds

      // Simulate success or failure randomly for demonstration
      const shouldFail = Math.random() < 0.3 // 30% chance of failure

      if (shouldFail && task.attempts < MAX_RETRIES - 1) {
        // Fail but allow retries
        throw new Error(`Simulated transient failure for task ${task.id}`)
      } else if (shouldFail && task.attempts >= MAX_RETRIES - 1) {
        // Fail permanently
        throw new Error(`Simulated permanent failure for task ${task.id}`)
      }

      // If successful
      task.status = TaskStatus.COMPLETED
      task.result = { message: `Task ${task.id} completed successfully!`, processedAt: new Date() }
      task.error = null
      this.logger.log(`Task ${task.id} completed.`)
    } catch (error: any) {
      this.logger.error(`Task ${task.id} failed: ${error.message}`)
      task.attempts++
      task.error = error.message
      task.result = null

      if (task.attempts >= MAX_RETRIES) {
        task.status = TaskStatus.FAILED
        this.logger.error(`Task ${task.id} permanently failed after ${task.attempts} attempts.`)
      } else {
        task.status = TaskStatus.PENDING // Set back to PENDING for retry
        this.logger.warn(`Task ${task.id} will be retried. Attempts: ${task.attempts}/${MAX_RETRIES}`)
      }
    } finally {
      // Save the final state of the task
      await this.tasksRepository.save(task)
    }
  }

  /**
   * Helper method to create a new task.
   * This would typically be called by an HTTP controller or another service.
   */
  async createTask(payload: Record<string, any>): Promise<TaskEntity> {
    const newTask = this.tasksRepository.create({
      payload,
      status: TaskStatus.PENDING,
      attempts: 0,
    })
    return this.tasksRepository.save(newTask)
  }
}

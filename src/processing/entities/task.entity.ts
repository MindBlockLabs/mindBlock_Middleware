import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { TaskStatus } from "../enums/task-status.enum"
import { TaskPriority } from "../enums/task-priority.enum"
import { TaskType } from "../enums/task-type.enum"

@Entity("processing_tasks")
@Index(["status", "priority", "createdAt"])
@Index(["assignedTo", "status"])
@Index(["taskType", "status"])
export class ProcessingTaskEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255, nullable: false })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "enum", enum: TaskType, default: TaskType.CUSTOM })
  taskType: TaskType

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus

  @Column({ type: "enum", enum: TaskPriority, default: TaskPriority.NORMAL })
  priority: TaskPriority

  @Column({ type: "jsonb", nullable: false })
  payload: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  result: Record<string, any> | null

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null

  @Column({ type: "text", nullable: true })
  error: string | null

  @Column({ type: "int", default: 0 })
  attempts: number

  @Column({ type: "int", default: 3 })
  maxAttempts: number

  @Column({ type: "varchar", length: 255, nullable: true })
  assignedTo: string | null // Worker ID or service name

  @Column({ type: "varchar", length: 255, nullable: false })
  createdBy: string // User ID or service that created the task

  @Column({ type: "timestamp with time zone", nullable: true })
  scheduledAt: Date | null

  @Column({ type: "timestamp with time zone", nullable: true })
  startedAt: Date | null

  @Column({ type: "timestamp with time zone", nullable: true })
  completedAt: Date | null

  @Column({ type: "int", nullable: true })
  estimatedDurationMs: number | null

  @Column({ type: "int", nullable: true })
  actualDurationMs: number | null

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date

  // Computed property for progress tracking
  get progressPercentage(): number {
    if (this.status === TaskStatus.COMPLETED) return 100
    if (this.status === TaskStatus.FAILED || this.status === TaskStatus.CANCELLED) return 0
    if (this.status === TaskStatus.PROCESSING) return 50
    return 0
  }

  // Check if task can be retried
  get canRetry(): boolean {
    return this.status === TaskStatus.FAILED && this.attempts < this.maxAttempts
  }
}

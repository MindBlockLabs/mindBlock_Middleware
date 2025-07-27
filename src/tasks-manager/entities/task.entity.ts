import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { TaskStatus } from "../enums/task-status.enum"

@Entity("tasks")
export class TaskEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "jsonb", nullable: false })
  payload: Record<string, any>

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus

  @Column({ type: "int", default: 0 })
  attempts: number

  @Column({ type: "jsonb", nullable: true })
  result: Record<string, any> | null

  @Column({ type: "text", nullable: true })
  error: string | null

  @CreateDateColumn({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date
}

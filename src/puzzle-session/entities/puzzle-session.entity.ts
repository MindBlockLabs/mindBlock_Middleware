import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("puzzle_sessions")
@Index(["sessionId", "puzzleId"], { unique: true })
export class PuzzleSession {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 255 })
  sessionId: string

  @Column({ type: "varchar", length: 255 })
  puzzleId: string

  @Column({ type: "boolean", default: false })
  isComplete: boolean

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date | null

  @Column({ type: "json", nullable: true })
  submissionData: any

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

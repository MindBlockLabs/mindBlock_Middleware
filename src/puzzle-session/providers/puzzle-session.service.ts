import { Injectable, ConflictException } from "@nestjs/common"
import { Repository } from "typeorm"
import { PuzzleSession } from "../entities/puzzle-session.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class PuzzleSessionService {
  constructor(
    @InjectRepository(PuzzleSession)
    private puzzleSessionRepository: Repository<PuzzleSession>,
  ) {}

  async checkSessionCompletion(sessionId: string, puzzleId: string): Promise<boolean> {
    const existingSession = await this.puzzleSessionRepository.findOne({
      where: {
        sessionId,
        puzzleId,
        isComplete: true,
      },
    })

    return !!existingSession
  }

  async createOrUpdateSession(sessionId: string, puzzleId: string, submissionData?: any): Promise<PuzzleSession> {
    const existingSession = await this.puzzleSessionRepository.findOne({
      where: { sessionId, puzzleId },
    })

    if (existingSession?.isComplete) {
      throw new ConflictException(`Puzzle submission already completed for session ${sessionId} and puzzle ${puzzleId}`)
    }

    if (existingSession) {
      // Update existing incomplete session
      existingSession.submissionData = submissionData
      existingSession.isComplete = true
      existingSession.completedAt = new Date()
      return this.puzzleSessionRepository.save(existingSession)
    }

    // Create new session
    const newSession = this.puzzleSessionRepository.create({
      sessionId,
      puzzleId,
      isComplete: true,
      completedAt: new Date(),
      submissionData,
    })

    return this.puzzleSessionRepository.save(newSession)
  }

  async findSessionsBySessionId(sessionId: string): Promise<PuzzleSession[]> {
    return this.puzzleSessionRepository.find({
      where: { sessionId },
      order: { createdAt: "DESC" },
    })
  }

  async findCompletedSessions(sessionId: string): Promise<PuzzleSession[]> {
    return this.puzzleSessionRepository.find({
      where: {
        sessionId,
        isComplete: true,
      },
      order: { completedAt: "DESC" },
    })
  }
}

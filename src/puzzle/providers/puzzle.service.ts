import { Injectable } from "@nestjs/common"
import { PuzzleSessionService } from "src/puzzle-session/providers/puzzle-session.service"

interface PuzzleSubmissionData {
  sessionId: string
  puzzleId: string
  answer: string
  timeSpent?: number
  metadata?: any
}

@Injectable()
export class PuzzleService {
  constructor(private readonly puzzleSessionService: PuzzleSessionService) {}

  async processPuzzleSubmission(submissionData: PuzzleSubmissionData) {
    // Process the puzzle submission logic here
    // This could include answer validation, scoring, etc.

    const isCorrect = this.validateAnswer(submissionData.puzzleId, submissionData.answer)

    const sessionData = {
      answer: submissionData.answer,
      isCorrect,
      timeSpent: submissionData.timeSpent,
      metadata: submissionData.metadata,
      submittedAt: new Date(),
    }

    // Save the completed session
    const session = await this.puzzleSessionService.createOrUpdateSession(
      submissionData.sessionId,
      submissionData.puzzleId,
      sessionData,
    )

    return {
      success: true,
      sessionId: session.sessionId,
      puzzleId: session.puzzleId,
      isCorrect,
      completedAt: session.completedAt,
      message: isCorrect ? "Puzzle solved correctly!" : "Incorrect answer, but submission recorded.",
    }
  }

  async getSessionHistory(sessionId: string) {
    return this.puzzleSessionService.findSessionsBySessionId(sessionId)
  }

  async getCompletedPuzzles(sessionId: string) {
    return this.puzzleSessionService.findCompletedSessions(sessionId)
  }

  private validateAnswer(puzzleId: string, answer: string): boolean {
    // Stub implementation - replace with actual puzzle validation logic
    // This could involve looking up the correct answer from a database,
    // calling an external service, or implementing puzzle-specific logic

    // For now, return a simple validation
    return typeof answer === "string" && answer.trim().length > 0
  }
}

import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ConflictException,
  BadRequestException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { PuzzleSessionService } from "src/puzzle-session/providers/puzzle-session.service"

@Injectable()
export class PuzzleSubmissionGuard implements CanActivate {
  constructor(
    private readonly puzzleSessionService: PuzzleSessionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Extract sessionId and puzzleId from request
    const sessionId = this.extractSessionId(request)
    const puzzleId = this.extractPuzzleId(request)

    if (!sessionId || !puzzleId) {
      throw new BadRequestException("Session ID and Puzzle ID are required")
    }

    // Check if this session has already completed this puzzle
    const isAlreadyComplete = await this.puzzleSessionService.checkSessionCompletion(sessionId, puzzleId)

    if (isAlreadyComplete) {
      throw new ConflictException(
        `Puzzle submission already completed for session ${sessionId} and puzzle ${puzzleId}. Duplicate submissions are not allowed.`,
      )
    }

    // Add sessionId and puzzleId to request for use in controllers
    request.sessionId = sessionId
    request.puzzleId = puzzleId

    return true
  }

  private extractSessionId(request: any): string | null {
    // Try multiple sources for sessionId
    return (
      request.headers["x-session-id"] ||
      request.body?.sessionId ||
      request.query?.sessionId ||
      request.params?.sessionId ||
      null
    )
  }

  private extractPuzzleId(request: any): string | null {
    // Try multiple sources for puzzleId
    return (
      request.headers["x-puzzle-id"] ||
      request.body?.puzzleId ||
      request.query?.puzzleId ||
      request.params?.puzzleId ||
      null
    )
  }
}

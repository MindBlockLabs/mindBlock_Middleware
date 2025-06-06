import { Controller, Post, Body, UseGuards, Req, Get, Param } from "@nestjs/common"
import { PuzzleService } from "../providers/puzzle.service"
import { PuzzleSubmissionGuard } from "src/common/guards/puzzle-submission.guard"
import { PuzzleSubmission } from "src/common/decorators/puzzle-submission.decorator"

interface PuzzleSubmissionDto {
  sessionId: string
  puzzleId: string
  answer: string
  timeSpent?: number
  metadata?: any
}

@Controller("puzzle")
export class PuzzleController {
  constructor(private readonly puzzleService: PuzzleService) {}

  @Post("submit")
  @UseGuards(PuzzleSubmissionGuard)
  @PuzzleSubmission()
  async submitPuzzle(@Req() request: any, @Body() submission: PuzzleSubmissionDto) {
    // The guard ensures this is not a duplicate submission
    return this.puzzleService.processPuzzleSubmission({
      ...submission,
    })
  }

  @Get('sessions/:sessionId')
  async getSessionHistory(@Param('sessionId') sessionId: string) {
    return this.puzzleService.getSessionHistory(sessionId);
  }

  @Get('sessions/:sessionId/completed')
  async getCompletedPuzzles(@Param('sessionId') sessionId: string) {
    return this.puzzleService.getCompletedPuzzles(sessionId);
  }
}

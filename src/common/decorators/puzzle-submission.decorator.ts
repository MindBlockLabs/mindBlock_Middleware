import { SetMetadata } from "@nestjs/common"

export const PUZZLE_SUBMISSION_KEY = "puzzleSubmission"
export const PuzzleSubmission = () => SetMetadata(PUZZLE_SUBMISSION_KEY, true)

import { Module } from "@nestjs/common"
import { PuzzleSessionModule } from "../puzzle-session/puzzle-session.module"
import { PuzzleController } from "./controllers/puzzle.controller"
import { PuzzleService } from "./providers/puzzle.service"

@Module({
  imports: [PuzzleSessionModule],
  controllers: [PuzzleController],
  providers: [PuzzleService],
})
export class PuzzleModule {}

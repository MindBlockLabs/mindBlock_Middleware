import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PuzzleSession } from "./entities/puzzle-session.entity"
import { PuzzleSessionService } from "./providers/puzzle-session.service"

@Module({
  imports: [TypeOrmModule.forFeature([PuzzleSession])],
  providers: [PuzzleSessionService],
  exports: [PuzzleSessionService],
})
export class PuzzleSessionModule {}

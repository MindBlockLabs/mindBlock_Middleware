import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"
import { LeaderboardWorker } from "./workers/leaderboard.worker"
import { LeaderboardService } from "./services/leaderboard.service"
import { LeaderboardRedisService } from "./services/redis.service"
import { BackendApiService } from "./services/backend-api.service"
import { LeaderboardController } from "./controllers/leaderboard.controller"

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [LeaderboardController],
  providers: [LeaderboardWorker, LeaderboardService, LeaderboardRedisService, BackendApiService],
  exports: [LeaderboardService, LeaderboardRedisService],
})
export class LeaderboardModule {}

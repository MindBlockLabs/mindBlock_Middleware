import { Controller, Get, Post, Logger, HttpCode, HttpStatus } from "@nestjs/common"
import type { LeaderboardWorker } from "../workers/leaderboard.worker"
import type { LeaderboardService } from "../services/leaderboard.service"
import type { RedisService } from "../services/redis.service"
import type { ProcessedLeaderboardData, SyncResult, WorkerStatus } from "../interfaces/leaderboard.interface"

@Controller("leaderboard")
export class LeaderboardController {
  private readonly logger = new Logger(LeaderboardController.name)

  constructor(
    private readonly leaderboardWorker: LeaderboardWorker,
    private readonly leaderboardService: LeaderboardService,
    private readonly redisService: RedisService,
  ) {}

  @Get("status")
  async getWorkerStatus(): Promise<WorkerStatus> {
    this.logger.log("Getting leaderboard worker status")
    return this.leaderboardWorker.getWorkerStatus()
  }

  @Post("sync")
  @HttpCode(HttpStatus.OK)
  async triggerManualSync(): Promise<SyncResult> {
    this.logger.log("Manual leaderboard sync triggered via API")
    return this.leaderboardWorker.triggerManualSync()
  }

  @Get("summary")
  async getGlobalSummary() {
    this.logger.log("Getting global leaderboard summary")
    return this.redisService.getGlobalSummary()
  }

  @Get("logs")
  async getSyncLogs() {
    this.logger.log("Getting sync logs")
    return this.redisService.getSyncLogs(20)
  }

  @Get(":type")
  async getLeaderboard(type: string): Promise<ProcessedLeaderboardData | null> {
    this.logger.log(`Getting leaderboard for type: ${type}`)
    return this.redisService.getLeaderboard(type)
  }

  @Get(":type/top/:limit")
  async getTopEntries(type: string, limit: string) {
    const limitNum = Number.parseInt(limit, 10) || 10
    this.logger.log(`Getting top ${limitNum} entries for ${type}`)
    return this.redisService.getTopEntries(type)
  }

  @Get(":type/user/:userId/rank")
  async getUserRank(type: string, userId: string) {
    this.logger.log(`Getting rank for user ${userId} in ${type}`)
    const rank = await this.redisService.getUserRank(type, userId)
    return { userId, type, rank }
  }
}

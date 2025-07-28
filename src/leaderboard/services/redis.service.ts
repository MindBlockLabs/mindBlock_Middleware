import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { ProcessedLeaderboardData, LeaderboardEntry, SyncLog } from "../interfaces/leaderboard.interface"
import { RedisService } from "../../redis/redis.service"

@Injectable()
export class LeaderboardRedisService implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardRedisService.name)
  private readonly keyPrefix: string

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {
    this.keyPrefix = this.configService.get("REDIS_KEY_PREFIX", "leaderboard:")
  }

  async onModuleInit() {
    // Verify Redis connection
    const isHealthy = await this.redisService.healthCheck()
    if (!isHealthy) {
      this.logger.error("Redis connection is not healthy")
      throw new Error("Redis connection failed")
    }
    this.logger.log("LeaderboardRedisService initialized successfully")
  }

  async setLeaderboard(type: string, data: ProcessedLeaderboardData): Promise<void> {
    const key = this.getLeaderboardKey(type)
    const ttl = this.configService.get("LEADERBOARD_TTL", 3600) // 1 hour default

    try {
      // Store full leaderboard data
      await this.redisService.setJson(key, data, ttl)

      // Store in sorted set for quick range queries
      const sortedSetKey = this.getSortedSetKey(type)
      for (const entry of data.entries) {
        await this.redisService.zadd(sortedSetKey, entry.score, entry.userId)
      }
      await this.redisService.expire(sortedSetKey, ttl)

      this.logger.debug(`Stored leaderboard ${type} with ${data.entries.length} entries`)
    } catch (error) {
      this.logger.error(`Failed to store leaderboard ${type}:`, error.message)
      throw error
    }
  }

  async getLeaderboard(type: string): Promise<ProcessedLeaderboardData | null> {
    const key = this.getLeaderboardKey(type)

    try {
      return await this.redisService.getJson<ProcessedLeaderboardData>(key)
    } catch (error) {
      this.logger.error(`Failed to get leaderboard ${type}:`, error.message)
      return null
    }
  }

  async setTopEntries(type: string, entries: LeaderboardEntry[]): Promise<void> {
    const key = this.getTopEntriesKey(type)
    const ttl = this.configService.get("TOP_ENTRIES_TTL", 1800) // 30 minutes default

    try {
      await this.redisService.setJson(key, entries, ttl)
      this.logger.debug(`Stored top ${entries.length} entries for ${type}`)
    } catch (error) {
      this.logger.error(`Failed to store top entries for ${type}:`, error.message)
      throw error
    }
  }

  async getTopEntries(type: string): Promise<LeaderboardEntry[]> {
    const key = this.getTopEntriesKey(type)

    try {
      return await this.redisService.getJson<LeaderboardEntry[]>(key) || []
    } catch (error) {
      this.logger.error(`Failed to get top entries for ${type}:`, error.message)
      return []
    }
  }

  async setUserRankings(type: string, entries: LeaderboardEntry[]): Promise<void> {
    const key = this.getUserRankingsKey(type)
    const ttl = this.configService.get("USER_RANKINGS_TTL", 3600) // 1 hour default

    try {
      // Store user ID to rank mapping
      for (const entry of entries) {
        await this.redisService.hset(key, entry.userId, entry.rank.toString())
      }
      await this.redisService.expire(key, ttl)

      this.logger.debug(`Stored user rankings for ${entries.length} users in ${type}`)
    } catch (error) {
      this.logger.error(`Failed to store user rankings for ${type}:`, error.message)
      throw error
    }
  }

  async getUserRank(type: string, userId: string): Promise<number | null> {
    const key = this.getUserRankingsKey(type)

    try {
      const rank = await this.redisService.hget(key, userId)
      return rank ? Number.parseInt(rank, 10) : null
    } catch (error) {
      this.logger.error(`Failed to get user rank for ${userId} in ${type}:`, error.message)
      return null
    }
  }

  async setGlobalSummary(summary: any): Promise<void> {
    const key = this.getGlobalSummaryKey()
    const ttl = this.configService.get("GLOBAL_SUMMARY_TTL", 1800) // 30 minutes default

    try {
      await this.redisService.setJson(key, summary, ttl)
      this.logger.debug("Stored global leaderboard summary")
    } catch (error) {
      this.logger.error("Failed to store global summary:", error.message)
      throw error
    }
  }

  async getGlobalSummary(): Promise<any> {
    const key = this.getGlobalSummaryKey()

    try {
      return await this.redisService.getJson(key)
    } catch (error) {
      this.logger.error("Failed to get global summary:", error.message)
      return null
    }
  }

  async addSyncLog(logEntry: SyncLog): Promise<void> {
    const key = this.getSyncLogsKey()
    const maxLogs = this.configService.get("MAX_SYNC_LOGS", 100)

    try {
      await this.redisService.lpush(key, JSON.stringify(logEntry))
      await this.redisService.ltrim(key, 0, maxLogs - 1)
      this.logger.debug("Added sync log entry")
    } catch (error) {
      this.logger.error("Failed to add sync log:", error.message)
    }
  }

  async getSyncLogs(limit = 10): Promise<SyncLog[]> {
    const key = this.getSyncLogsKey()

    try {
      const logs = await this.redisService.lrange(key, 0, limit - 1)
      return logs.map((log) => JSON.parse(log))
    } catch (error) {
      this.logger.error("Failed to get sync logs:", error.message)
      return []
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const logs = await this.getSyncLogs(1)
      return logs.length > 0 ? new Date(logs[0].timestamp) : null
    } catch (error) {
      this.logger.error("Failed to get last sync time:", error.message)
      return null
    }
  }

  // Key generation methods
  private getLeaderboardKey(type: string): string {
    return `${this.keyPrefix}data:${type}`
  }

  private getSortedSetKey(type: string): string {
    return `${this.keyPrefix}sorted:${type}`
  }

  private getTopEntriesKey(type: string): string {
    return `${this.keyPrefix}top:${type}`
  }

  private getUserRankingsKey(type: string): string {
    return `${this.keyPrefix}ranks:${type}`
  }

  private getGlobalSummaryKey(): string {
    return `${this.keyPrefix}summary:global`
  }

  private getSyncLogsKey(): string {
    return `${this.keyPrefix}logs:sync`
  }
}

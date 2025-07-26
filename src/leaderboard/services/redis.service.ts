import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { ProcessedLeaderboardData, LeaderboardEntry, SyncLog } from "../interfaces/leaderboard.interface"

// Mock Redis client for demonstration - replace with actual Redis client
interface RedisClient {
  set(key: string, value: string, options?: any): Promise<string>
  get(key: string): Promise<string | null>
  hset(key: string, field: string, value: string): Promise<number>
  hget(key: string, field: string): Promise<string | null>
  hgetall(key: string): Promise<Record<string, string>>
  zadd(key: string, score: number, member: string): Promise<number>
  zrevrange(key: string, start: number, stop: number, withScores?: boolean): Promise<string[]>
  lpush(key: string, ...values: string[]): Promise<number>
  ltrim(key: string, start: number, stop: number): Promise<string>
  lrange(key: string, start: number, stop: number): Promise<string[]>
  expire(key: string, seconds: number): Promise<number>
}

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name)
  private client: RedisClient
  private readonly keyPrefix: string

  constructor(private readonly configService: ConfigService) {
    this.keyPrefix = this.configService.get("REDIS_KEY_PREFIX", "leaderboard:")
  }

  async onModuleInit() {
    await this.initializeRedisClient()
  }

  private async initializeRedisClient() {
    // Mock Redis client - replace with actual Redis connection
    this.client = {
      set: async (key: string, value: string, options?: any) => {
        this.logger.debug(`Redis SET: ${key}`)
        return "OK"
      },
      get: async (key: string) => {
        this.logger.debug(`Redis GET: ${key}`)
        return null
      },
      hset: async (key: string, field: string, value: string) => {
        this.logger.debug(`Redis HSET: ${key} ${field}`)
        return 1
      },
      hget: async (key: string, field: string) => {
        this.logger.debug(`Redis HGET: ${key} ${field}`)
        return null
      },
      hgetall: async (key: string) => {
        this.logger.debug(`Redis HGETALL: ${key}`)
        return {}
      },
      zadd: async (key: string, score: number, member: string) => {
        this.logger.debug(`Redis ZADD: ${key} ${score} ${member}`)
        return 1
      },
      zrevrange: async (key: string, start: number, stop: number, withScores?: boolean) => {
        this.logger.debug(`Redis ZREVRANGE: ${key} ${start} ${stop}`)
        return []
      },
      lpush: async (key: string, ...values: string[]) => {
        this.logger.debug(`Redis LPUSH: ${key}`)
        return values.length
      },
      ltrim: async (key: string, start: number, stop: number) => {
        this.logger.debug(`Redis LTRIM: ${key} ${start} ${stop}`)
        return "OK"
      },
      lrange: async (key: string, start: number, stop: number) => {
        this.logger.debug(`Redis LRANGE: ${key} ${start} ${stop}`)
        return []
      },
      expire: async (key: string, seconds: number) => {
        this.logger.debug(`Redis EXPIRE: ${key} ${seconds}`)
        return 1
      },
    }

    this.logger.log("Redis client initialized (mock)")
  }

  async setLeaderboard(type: string, data: ProcessedLeaderboardData): Promise<void> {
    const key = this.getLeaderboardKey(type)
    const ttl = this.configService.get("LEADERBOARD_TTL", 3600) // 1 hour default

    try {
      // Store full leaderboard data
      await this.client.set(key, JSON.stringify(data), { EX: ttl })

      // Store in sorted set for quick range queries
      const sortedSetKey = this.getSortedSetKey(type)
      for (const entry of data.entries) {
        await this.client.zadd(sortedSetKey, entry.score, entry.userId)
      }
      await this.client.expire(sortedSetKey, ttl)

      this.logger.debug(`Stored leaderboard ${type} with ${data.entries.length} entries`)
    } catch (error) {
      this.logger.error(`Failed to store leaderboard ${type}:`, error.message)
      throw error
    }
  }

  async getLeaderboard(type: string): Promise<ProcessedLeaderboardData | null> {
    const key = this.getLeaderboardKey(type)

    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      this.logger.error(`Failed to get leaderboard ${type}:`, error.message)
      return null
    }
  }

  async setTopEntries(type: string, entries: LeaderboardEntry[]): Promise<void> {
    const key = this.getTopEntriesKey(type)
    const ttl = this.configService.get("TOP_ENTRIES_TTL", 1800) // 30 minutes default

    try {
      await this.client.set(key, JSON.stringify(entries), { EX: ttl })
      this.logger.debug(`Stored top ${entries.length} entries for ${type}`)
    } catch (error) {
      this.logger.error(`Failed to store top entries for ${type}:`, error.message)
      throw error
    }
  }

  async getTopEntries(type: string): Promise<LeaderboardEntry[]> {
    const key = this.getTopEntriesKey(type)

    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : []
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
        await this.client.hset(key, entry.userId, entry.rank.toString())
      }
      await this.client.expire(key, ttl)

      this.logger.debug(`Stored user rankings for ${entries.length} users in ${type}`)
    } catch (error) {
      this.logger.error(`Failed to store user rankings for ${type}:`, error.message)
      throw error
    }
  }

  async getUserRank(type: string, userId: string): Promise<number | null> {
    const key = this.getUserRankingsKey(type)

    try {
      const rank = await this.client.hget(key, userId)
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
      await this.client.set(key, JSON.stringify(summary), { EX: ttl })
      this.logger.debug("Stored global leaderboard summary")
    } catch (error) {
      this.logger.error("Failed to store global summary:", error.message)
      throw error
    }
  }

  async getGlobalSummary(): Promise<any> {
    const key = this.getGlobalSummaryKey()

    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      this.logger.error("Failed to get global summary:", error.message)
      return null
    }
  }

  async addSyncLog(logEntry: SyncLog): Promise<void> {
    const key = this.getSyncLogsKey()
    const maxLogs = this.configService.get("MAX_SYNC_LOGS", 100)

    try {
      await this.client.lpush(key, JSON.stringify(logEntry))
      await this.client.ltrim(key, 0, maxLogs - 1)
      this.logger.debug("Added sync log entry")
    } catch (error) {
      this.logger.error("Failed to add sync log:", error.message)
    }
  }

  async getSyncLogs(limit = 10): Promise<SyncLog[]> {
    const key = this.getSyncLogsKey()

    try {
      const logs = await this.client.lrange(key, 0, limit - 1)
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

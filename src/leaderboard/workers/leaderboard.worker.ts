import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import type { ConfigService } from "@nestjs/config"
import type { LeaderboardService } from "../services/leaderboard.service"
import type { BackendApiService } from "../services/backend-api.service"
import type { RedisService } from "../services/redis.service"
import type { SyncResult } from "../interfaces/leaderboard.interface"

@Injectable()
export class LeaderboardWorker {
  private readonly logger = new Logger(LeaderboardWorker.name)
  private readonly syncInterval: string
  private isRunning = false

  constructor(
    private readonly configService: ConfigService,
    private readonly leaderboardService: LeaderboardService,
    private readonly backendApiService: BackendApiService,
    private readonly redisService: RedisService,
  ) {
    this.syncInterval = this.configService.get("LEADERBOARD_SYNC_INTERVAL", "*/5 * * * *") // Default: every 5 minutes
  }

  // Dynamic cron job based on configuration
  @Cron("*/5 * * * *") // Every 5 minutes - can be overridden by environment
  async syncLeaderboards() {
    if (this.isRunning) {
      this.logger.warn("Leaderboard sync already in progress, skipping...")
      return
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      this.logger.log("Starting leaderboard sync process...")

      const syncResult = await this.performSync()
      const duration = Date.now() - startTime

      await this.logSyncResult(syncResult, duration)

      this.logger.log(
        `Leaderboard sync completed successfully in ${duration}ms. ` +
          `Synced ${syncResult.totalSynced} leaderboards, ${syncResult.errors.length} errors`,
      )
    } catch (error) {
      const duration = Date.now() - startTime
      this.logger.error(`Leaderboard sync failed after ${duration}ms:`, error.stack)

      await this.logSyncResult(
        {
          success: false,
          totalSynced: 0,
          errors: [{ type: "SYNC_FAILURE", message: error.message, timestamp: new Date() }],
          syncedLeaderboards: [],
        },
        duration,
      )
    } finally {
      this.isRunning = false
    }
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<SyncResult> {
    this.logger.log("Manual leaderboard sync triggered")
    return this.performSync()
  }

  private async performSync(): Promise<SyncResult> {
    const syncResult: SyncResult = {
      success: true,
      totalSynced: 0,
      errors: [],
      syncedLeaderboards: [],
    }

    try {
      // Get list of leaderboard types to sync
      const leaderboardTypes = await this.getLeaderboardTypes()

      for (const type of leaderboardTypes) {
        try {
          await this.syncLeaderboardType(type, syncResult)
        } catch (error) {
          this.logger.error(`Failed to sync leaderboard type ${type}:`, error.message)
          syncResult.errors.push({
            type: "LEADERBOARD_SYNC_ERROR",
            message: `Failed to sync ${type}: ${error.message}`,
            timestamp: new Date(),
            leaderboardType: type,
          })
        }
      }

      // Update global leaderboard summary
      await this.updateGlobalSummary(syncResult.syncedLeaderboards)

      syncResult.success = syncResult.errors.length === 0
    } catch (error) {
      syncResult.success = false
      syncResult.errors.push({
        type: "GENERAL_SYNC_ERROR",
        message: error.message,
        timestamp: new Date(),
      })
    }

    return syncResult
  }

  private async syncLeaderboardType(type: string, syncResult: SyncResult): Promise<void> {
    this.logger.debug(`Syncing leaderboard type: ${type}`)

    // Fetch leaderboard data from backend
    const leaderboardData = await this.backendApiService.fetchLeaderboard(type)

    if (!leaderboardData || !leaderboardData.entries) {
      throw new Error(`Invalid leaderboard data received for type: ${type}`)
    }

    // Process and validate data
    const processedData = await this.leaderboardService.processLeaderboardData(leaderboardData)

    // Store in Redis with different cache strategies
    await Promise.all([
      // Store full leaderboard
      this.redisService.setLeaderboard(type, processedData),
      // Store top 10 for quick access
      this.redisService.setTopEntries(type, processedData.entries.slice(0, 10)),
      // Store user rankings for quick lookup
      this.redisService.setUserRankings(type, processedData.entries),
    ])

    syncResult.totalSynced++
    syncResult.syncedLeaderboards.push({
      type,
      entriesCount: processedData.entries.length,
      lastUpdated: processedData.lastUpdated,
      topScore: processedData.entries[0]?.score || 0,
    })

    this.logger.debug(`Successfully synced ${processedData.entries.length} entries for ${type}`)
  }

  private async getLeaderboardTypes(): Promise<string[]> {
    // Get leaderboard types from configuration or backend
    const configTypes = this.configService.get("LEADERBOARD_TYPES", "global,weekly,monthly").split(",")

    try {
      // Optionally fetch dynamic types from backend
      const dynamicTypes = await this.backendApiService.getAvailableLeaderboardTypes()
      return [...new Set([...configTypes, ...dynamicTypes])]
    } catch (error) {
      this.logger.warn("Failed to fetch dynamic leaderboard types, using config types:", error.message)
      return configTypes
    }
  }

  private async updateGlobalSummary(syncedLeaderboards: any[]): Promise<void> {
    const summary = {
      lastSyncTime: new Date(),
      totalLeaderboards: syncedLeaderboards.length,
      leaderboards: syncedLeaderboards.reduce((acc, lb) => {
        acc[lb.type] = {
          entriesCount: lb.entriesCount,
          topScore: lb.topScore,
          lastUpdated: lb.lastUpdated,
        }
        return acc
      }, {}),
    }

    await this.redisService.setGlobalSummary(summary)
    this.logger.debug("Updated global leaderboard summary")
  }

  private async logSyncResult(result: SyncResult, duration: number): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      duration,
      success: result.success,
      totalSynced: result.totalSynced,
      errorCount: result.errors.length,
      errors: result.errors,
      syncedLeaderboards: result.syncedLeaderboards,
    }

    // Store sync log in Redis for monitoring
    await this.redisService.addSyncLog(logEntry)

    // Log to application logs
    if (result.success) {
      this.logger.log(`Sync completed: ${JSON.stringify(logEntry)}`)
    } else {
      this.logger.error(`Sync failed: ${JSON.stringify(logEntry)}`)
    }
  }

  // Health check method
  async getWorkerStatus() {
    return {
      isRunning: this.isRunning,
      syncInterval: this.syncInterval,
      lastSyncTime: await this.redisService.getLastSyncTime(),
      nextSyncTime: this.getNextSyncTime(),
    }
  }

  private getNextSyncTime(): Date {
    // Calculate next sync time based on cron expression
    // This is a simplified calculation - in production, use a proper cron parser
    const now = new Date()
    const nextSync = new Date(now.getTime() + 5 * 60 * 1000) // Add 5 minutes
    return nextSync
  }
}

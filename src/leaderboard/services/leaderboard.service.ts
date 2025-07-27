import { Injectable, Logger } from "@nestjs/common"
import type { LeaderboardData, LeaderboardEntry, ProcessedLeaderboardData } from "../interfaces/leaderboard.interface"

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name)

  async processLeaderboardData(rawData: LeaderboardData): Promise<ProcessedLeaderboardData> {
    this.logger.debug(`Processing leaderboard data with ${rawData.entries?.length || 0} entries`)

    if (!rawData.entries || !Array.isArray(rawData.entries)) {
      throw new Error("Invalid leaderboard data: entries must be an array")
    }

    // Sort entries by score (descending) and assign ranks
    const sortedEntries = rawData.entries
      .filter((entry) => this.isValidEntry(entry))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        percentile: this.calculatePercentile(index, rawData.entries.length),
      }))

    // Calculate statistics
    const stats = this.calculateStats(sortedEntries)

    const processedData: ProcessedLeaderboardData = {
      type: rawData.type,
      entries: sortedEntries,
      lastUpdated: new Date(),
      totalEntries: sortedEntries.length,
      stats,
      metadata: {
        syncedAt: new Date(),
        source: "backend-api",
        version: "1.0",
        ...rawData.metadata,
      },
    }

    this.logger.debug(`Processed leaderboard: ${processedData.totalEntries} valid entries`)
    return processedData
  }

  private isValidEntry(entry: any): entry is LeaderboardEntry {
    return (
      entry &&
      typeof entry.userId === "string" &&
      typeof entry.score === "number" &&
      entry.score >= 0 &&
      entry.username &&
      typeof entry.username === "string"
    )
  }

  private calculatePercentile(rank: number, total: number): number {
    if (total <= 1) return 100
    return Math.round(((total - rank) / (total - 1)) * 100)
  }

  private calculateStats(entries: LeaderboardEntry[]) {
    if (entries.length === 0) {
      return {
        averageScore: 0,
        medianScore: 0,
        topScore: 0,
        bottomScore: 0,
        scoreRange: 0,
      }
    }

    const scores = entries.map((e) => e.score)
    const sum = scores.reduce((a, b) => a + b, 0)
    const sortedScores = [...scores].sort((a, b) => a - b)

    return {
      averageScore: Math.round(sum / scores.length),
      medianScore: this.getMedian(sortedScores),
      topScore: Math.max(...scores),
      bottomScore: Math.min(...scores),
      scoreRange: Math.max(...scores) - Math.min(...scores),
    }
  }

  private getMedian(sortedArray: number[]): number {
    const mid = Math.floor(sortedArray.length / 2)
    return sortedArray.length % 2 !== 0 ? sortedArray[mid] : Math.round((sortedArray[mid - 1] + sortedArray[mid]) / 2)
  }

  async getUserRank(leaderboardType: string, userId: string): Promise<number | null> {
    // This would typically query Redis or the processed data
    // Implementation depends on your caching strategy
    return null
  }

  async getTopEntries(leaderboardType: string, limit = 10): Promise<LeaderboardEntry[]> {
    // This would typically query Redis for cached top entries
    // Implementation depends on your caching strategy
    return []
  }
}

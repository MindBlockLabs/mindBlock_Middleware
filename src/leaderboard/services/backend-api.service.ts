import { Injectable, Logger } from "@nestjs/common"
import type { HttpService } from "@nestjs/axios"
import type { ConfigService } from "@nestjs/config"
import { firstValueFrom } from "rxjs"
import type { LeaderboardData } from "../interfaces/leaderboard.interface"

@Injectable()
export class BackendApiService {
  private readonly logger = new Logger(BackendApiService.name)
  private readonly backendUrl: string
  private readonly apiKey: string
  private readonly timeout: number

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get("BACKEND_URL", "http://localhost:3001")
    this.apiKey = this.configService.get("BACKEND_API_KEY", "")
    this.timeout = this.configService.get("BACKEND_TIMEOUT", 10000)
  }

  async fetchLeaderboard(type: string): Promise<LeaderboardData> {
    const url = `${this.backendUrl}/api/leaderboard/${type}`

    this.logger.debug(`Fetching leaderboard from: ${url}`)

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { "X-API-Key": this.apiKey }),
          },
          timeout: this.timeout,
        }),
      )

      if (response.status !== 200) {
        throw new Error(`Backend API returned status ${response.status}`)
      }

      const leaderboardData: LeaderboardData = {
        type,
        entries: response.data.entries || [],
        lastUpdated: response.data.lastUpdated ? new Date(response.data.lastUpdated) : new Date(),
        metadata: response.data.metadata || {},
      }

      this.logger.debug(`Fetched ${leaderboardData.entries.length} entries for ${type}`)
      return leaderboardData
    } catch (error) {
      this.logger.error(`Failed to fetch leaderboard ${type}:`, error.message)

      if (error.response) {
        throw new Error(`Backend API error: ${error.response.status} - ${error.response.statusText}`)
      } else if (error.request) {
        throw new Error(`Network error: Unable to reach backend API at ${url}`)
      } else {
        throw new Error(`Request setup error: ${error.message}`)
      }
    }
  }

  async getAvailableLeaderboardTypes(): Promise<string[]> {
    const url = `${this.backendUrl}/api/leaderboard/types`

    this.logger.debug(`Fetching available leaderboard types from: ${url}`)

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey && { "X-API-Key": this.apiKey }),
          },
          timeout: this.timeout,
        }),
      )

      const types = response.data.types || []
      this.logger.debug(`Found ${types.length} available leaderboard types`)
      return types
    } catch (error) {
      this.logger.warn(`Failed to fetch leaderboard types: ${error.message}`)
      return []
    }
  }

  async validateConnection(): Promise<boolean> {
    const url = `${this.backendUrl}/api/health`

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            ...(this.apiKey && { "X-API-Key": this.apiKey }),
          },
          timeout: 5000,
        }),
      )

      return response.status === 200
    } catch (error) {
      this.logger.error(`Backend API connection validation failed: ${error.message}`)
      return false
    }
  }
}

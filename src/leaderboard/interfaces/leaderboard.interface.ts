export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  rank: number
  percentile?: number
  avatar?: string
  lastActive?: Date
  metadata?: Record<string, any>
}

export interface LeaderboardData {
  type: string
  entries: LeaderboardEntry[]
  lastUpdated: Date
  metadata?: Record<string, any>
}

export interface ProcessedLeaderboardData extends LeaderboardData {
  totalEntries: number
  stats: LeaderboardStats
  metadata: {
    syncedAt: Date
    source: string
    version: string
    [key: string]: any
  }
}

export interface LeaderboardStats {
  averageScore: number
  medianScore: number
  topScore: number
  bottomScore: number
  scoreRange: number
}

export interface SyncError {
  type: string
  message: string
  timestamp: Date
  leaderboardType?: string
}

export interface SyncResult {
  success: boolean
  totalSynced: number
  errors: SyncError[]
  syncedLeaderboards: {
    type: string
    entriesCount: number
    lastUpdated: Date
    topScore: number
  }[]
}

export interface SyncLog {
  timestamp: Date
  duration: number
  success: boolean
  totalSynced: number
  errorCount: number
  errors: SyncError[]
  syncedLeaderboards: any[]
}

export interface WorkerStatus {
  isRunning: boolean
  syncInterval: string
  lastSyncTime: Date | null
  nextSyncTime: Date
}

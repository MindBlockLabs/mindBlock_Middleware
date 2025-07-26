import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsBoolean,
  IsDate,
  IsEnum,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Leaderboard type
 */
export enum LeaderboardType {
  GLOBAL = 'global',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CATEGORY = 'category',
  CHALLENGE = 'challenge',
}

/**
 * Leaderboard period
 */
export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ALL_TIME = 'all_time',
}

/**
 * Base Leaderboard Entry DTO
 */
export class LeaderboardEntryDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @Min(0)
  totalScore: number;

  @IsNumber()
  @Min(0)
  totalChallenges: number;

  @IsNumber()
  @Min(0)
  completedChallenges: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  successRate: number;

  @IsNumber()
  @Min(1)
  rank: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivity?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}

/**
 * DTO for creating a leaderboard entry
 */
export class CreateLeaderboardEntryDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @Min(0)
  totalScore: number;

  @IsNumber()
  @Min(0)
  totalChallenges: number;

  @IsNumber()
  @Min(0)
  completedChallenges: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  successRate: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;
}

/**
 * DTO for updating a leaderboard entry
 */
export class UpdateLeaderboardEntryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalChallenges?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completedChallenges?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivity?: Date;
}

/**
 * DTO for leaderboard update
 */
export class LeaderboardUpdateDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @Min(0)
  scoreChange: number;

  @IsNumber()
  @Min(0)
  challengesCompleted: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  challengeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  challengeCategory?: string;
}

/**
 * DTO for leaderboard response
 */
export class LeaderboardResponseDto {
  @IsEnum(LeaderboardType)
  type: LeaderboardType;

  @IsEnum(LeaderboardPeriod)
  period: LeaderboardPeriod;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  totalEntries: number;

  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;

  @ValidateNested({ each: true })
  @Type(() => LeaderboardEntryDto)
  @IsArray()
  entries: LeaderboardEntryDto[];
}

/**
 * DTO for leaderboard list response
 */
export class LeaderboardListDto {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsNumber()
  totalScore: number;

  @IsNumber()
  totalChallenges: number;

  @IsNumber()
  completedChallenges: number;

  @IsNumber()
  successRate: number;

  @IsNumber()
  rank: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivity?: Date;
}

/**
 * DTO for leaderboard statistics
 */
export class LeaderboardStatsDto {
  @IsNumber()
  totalUsers: number;

  @IsNumber()
  totalScore: number;

  @IsNumber()
  averageScore: number;

  @IsNumber()
  highestScore: number;

  @IsNumber()
  averageSuccessRate: number;

  @IsDate()
  @Type(() => Date)
  lastUpdated: Date;
}

/**
 * DTO for user ranking
 */
export class UserRankingDto {
  @IsNumber()
  userId: number;

  @IsString()
  username: string;

  @IsNumber()
  rank: number;

  @IsNumber()
  totalScore: number;

  @IsNumber()
  totalChallenges: number;

  @IsNumber()
  completedChallenges: number;

  @IsNumber()
  successRate: number;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastActivity?: Date;
} 
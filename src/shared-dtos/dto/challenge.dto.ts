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
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Challenge difficulty levels
 */
export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Challenge categories
 */
export enum ChallengeCategory {
  PUZZLE = 'puzzle',
  LOGIC = 'logic',
  MATH = 'math',
  WORD = 'word',
  VISUAL = 'visual',
  AUDIO = 'audio',
}

/**
 * Challenge status
 */
export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

/**
 * Base Challenge DTO
 */
export class ChallengeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsEnum(ChallengeCategory)
  category: ChallengeCategory;

  @IsEnum(ChallengeStatus)
  status: ChallengeStatus;

  @IsNumber()
  @Min(1)
  @Max(1000)
  points: number;

  @IsNumber()
  @Min(1)
  @Max(3600)
  timeLimit: number; // in seconds

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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
 * DTO for creating a new challenge
 */
export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsEnum(ChallengeCategory)
  category: ChallengeCategory;

  @IsNumber()
  @Min(1)
  @Max(1000)
  points: number;

  @IsNumber()
  @Min(1)
  @Max(3600)
  timeLimit: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  solution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  testCases?: string;
}

/**
 * DTO for updating a challenge
 */
export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @IsOptional()
  @IsEnum(ChallengeCategory)
  category?: ChallengeCategory;

  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  points?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3600)
  timeLimit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  solution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  testCases?: string;
}

/**
 * DTO for challenge response
 */
export class ChallengeResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsEnum(ChallengeCategory)
  category: ChallengeCategory;

  @IsEnum(ChallengeStatus)
  status: ChallengeStatus;

  @IsNumber()
  points: number;

  @IsNumber()
  timeLimit: number;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  attemptsCount: number;

  @IsNumber()
  successRate: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

/**
 * DTO for challenge list response
 */
export class ChallengeListDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @IsEnum(ChallengeCategory)
  category: ChallengeCategory;

  @IsNumber()
  points: number;

  @IsNumber()
  timeLimit: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNumber()
  attemptsCount: number;

  @IsNumber()
  successRate: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;
} 
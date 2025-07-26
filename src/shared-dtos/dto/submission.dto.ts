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
import { Type, Transform } from 'class-transformer';

/**
 * Submission status
 */
export enum SubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  TIMEOUT = 'timeout',
  ERROR = 'error',
}

/**
 * Submission type
 */
export enum SubmissionType {
  PUZZLE = 'puzzle',
  CHALLENGE = 'challenge',
  QUIZ = 'quiz',
}

/**
 * Base Submission DTO
 */
export class SubmissionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  answer: string;

  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @IsEnum(SubmissionType)
  type: SubmissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number; // in seconds

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  score?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metadata?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  submittedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processedAt?: Date;

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
 * DTO for creating a new submission
 */
export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  answer: string;

  @IsEnum(SubmissionType)
  type: SubmissionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metadata?: string[];
}

/**
 * DTO for puzzle submission (specific to puzzle type)
 */
export class PuzzleSubmissionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  puzzleId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  answer: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  metadata?: any;
}

/**
 * DTO for updating submission status
 */
export class UpdateSubmissionDto {
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  score?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processedAt?: Date;
}

/**
 * DTO for submission response
 */
export class SubmissionResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  sessionId: string;

  @IsString()
  challengeId: string;

  @IsNumber()
  userId: number;

  @IsString()
  answer: string;

  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @IsEnum(SubmissionType)
  type: SubmissionType;

  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metadata?: string[];

  @IsDate()
  @Type(() => Date)
  submittedAt: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processedAt?: Date;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

/**
 * DTO for submission statistics
 */
export class SubmissionStatsDto {
  @IsNumber()
  totalSubmissions: number;

  @IsNumber()
  correctSubmissions: number;

  @IsNumber()
  incorrectSubmissions: number;

  @IsNumber()
  averageTimeSpent: number;

  @IsNumber()
  averageScore: number;

  @IsNumber()
  successRate: number;
}

/**
 * DTO for batch submission processing
 */
export class BatchSubmissionDto {
  @ValidateNested({ each: true })
  @Type(() => CreateSubmissionDto)
  @IsArray()
  submissions: CreateSubmissionDto[];
} 
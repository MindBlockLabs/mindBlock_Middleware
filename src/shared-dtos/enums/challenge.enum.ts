/**
 * Challenge-related enums
 */

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
  PROGRAMMING = 'programming',
  CRYPTOGRAPHY = 'cryptography',
  GAME = 'game',
  QUIZ = 'quiz',
}

/**
 * Challenge status
 */
export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  MAINTENANCE = 'maintenance',
}

/**
 * Challenge type
 */
export enum ChallengeType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
  CODE_SUBMISSION = 'code_submission',
  FILE_UPLOAD = 'file_upload',
  INTERACTIVE = 'interactive',
}

/**
 * Challenge visibility
 */
export enum ChallengeVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PREMIUM = 'premium',
}

/**
 * Challenge scoring method
 */
export enum ChallengeScoringMethod {
  BINARY = 'binary', // Correct/Incorrect
  PARTIAL = 'partial', // Partial credit
  TIME_BASED = 'time_based', // Based on completion time
  ATTEMPT_BASED = 'attempt_based', // Based on number of attempts
  CUSTOM = 'custom', // Custom scoring algorithm
}

/**
 * Challenge time limit type
 */
export enum ChallengeTimeLimitType {
  NONE = 'none',
  SOFT = 'soft', // Warning but allows completion
  HARD = 'hard', // Strict cutoff
  GRADUAL = 'gradual', // Decreasing points over time
} 
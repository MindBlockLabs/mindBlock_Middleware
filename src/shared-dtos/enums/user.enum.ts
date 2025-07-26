/**
 * User-related enums
 */

/**
 * User roles
 */
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING = 'pending',
  VERIFIED = 'verified',
}

/**
 * User verification status
 */
export enum UserVerificationStatus {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  FULLY_VERIFIED = 'fully_verified',
}

/**
 * User subscription tier
 */
export enum UserSubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * User privacy settings
 */
export enum UserPrivacyLevel {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private',
  CUSTOM = 'custom',
}

/**
 * User notification preferences
 */
export enum UserNotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
  NONE = 'none',
}

/**
 * User achievement types
 */
export enum UserAchievementType {
  FIRST_CHALLENGE = 'first_challenge',
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_30_DAYS = 'streak_30_days',
  STREAK_100_DAYS = 'streak_100_days',
  CHALLENGES_10 = 'challenges_10',
  CHALLENGES_50 = 'challenges_50',
  CHALLENGES_100 = 'challenges_100',
  PERFECT_SCORE = 'perfect_score',
  SPEED_DEMON = 'speed_demon',
  PROBLEM_SOLVER = 'problem_solver',
  CATEGORY_MASTER = 'category_master',
  SOCIAL_BUTTERFLY = 'social_butterfly',
}

/**
 * User activity types
 */
export enum UserActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CHALLENGE_STARTED = 'challenge_started',
  CHALLENGE_COMPLETED = 'challenge_completed',
  CHALLENGE_FAILED = 'challenge_failed',
  PROFILE_UPDATED = 'profile_updated',
  SETTINGS_CHANGED = 'settings_changed',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  LEADERBOARD_ENTRY = 'leaderboard_entry',
  FRIEND_ADDED = 'friend_added',
  COMMENT_POSTED = 'comment_posted',
  RATING_GIVEN = 'rating_given',
}

/**
 * User preference categories
 */
export enum UserPreferenceCategory {
  NOTIFICATIONS = 'notifications',
  PRIVACY = 'privacy',
  APPEARANCE = 'appearance',
  ACCESSIBILITY = 'accessibility',
  GAMEPLAY = 'gameplay',
  SOCIAL = 'social',
  LANGUAGE = 'language',
  TIMEZONE = 'timezone',
} 
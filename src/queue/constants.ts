export const QUEUE_NAMES = {
  AI_CONTENT_PROCESSING: "ai-content-processing",
  EMAIL_SENDING: "email-sending",
  EVENT_TRACKING: "event-tracking",
}

// Redis options are now managed by the centralized RedisService
// This file is kept for backward compatibility but should be deprecated
export const REDIS_OPTIONS = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Recommended for ioredis
}

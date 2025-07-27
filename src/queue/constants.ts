export const QUEUE_NAMES = {
  AI_CONTENT_PROCESSING: "ai-content-processing",
  EMAIL_SENDING: "email-sending",
  EVENT_TRACKING: "event-tracking",
}

export const REDIS_OPTIONS = {
  host: "localhost", // Replace with your Redis host
  port: 6379, // Replace with your Redis port
  password: process.env.REDIS_PASSWORD, // If your Redis requires authentication
  maxRetriesPerRequest: null, // Recommended for ioredis
}

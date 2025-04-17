
export const THROTTLING_CONFIG = {
  MAX_CONCURRENT_REQUESTS: 1, // Reduced from 2 to 1 for stricter control
  MIN_REQUEST_INTERVAL: 1000, // Increased from 750ms to 1000ms (1 second)
  BATCH_SIZE: 5,
  BATCH_INTERVAL: 2000, // 2 seconds between batches
  DEFAULT_RETRY_AFTER: 300, // 5 minutes default retry time
  MAX_RETRIES: 3
} as const;

export type ThrottlingConfig = typeof THROTTLING_CONFIG;

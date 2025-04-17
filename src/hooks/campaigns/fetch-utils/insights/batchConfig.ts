
export const BATCH_CONFIG = {
  MIN_REQUEST_INTERVAL: 750, // ms between requests (increased from 500ms)
  BATCH_SIZE: 2, // campaigns per batch (reduced from original size)
  BATCH_INTERVAL: 3500, // ms between batches (increased to allow API cooldown)
} as const;

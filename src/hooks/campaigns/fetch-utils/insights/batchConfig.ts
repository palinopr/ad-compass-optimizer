
export const BATCH_CONFIG = {
  MIN_REQUEST_INTERVAL: 750, // ms between requests
  BATCH_SIZE: 2, // campaigns per batch
  BATCH_INTERVAL: 3500, // ms between batches
} as const;

// Helper functions for delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track already requested campaign IDs to prevent duplicates in the same session
export const requestedCampaignIds = new Set<string>();

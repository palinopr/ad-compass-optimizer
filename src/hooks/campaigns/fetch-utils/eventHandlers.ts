
import { MetaCampaign } from '@/services/api/MetaCampaignService';

/**
 * Utility functions for handling campaign-related events
 */

export type CampaignRefreshEvent = CustomEvent<{ force?: boolean }>;

/**
 * Dispatches an event to trigger campaign data refresh
 */
export const triggerCampaignRefresh = (force: boolean = false): void => {
  const event = new CustomEvent('campaign-data-refresh', { 
    detail: { force } 
  });
  window.dispatchEvent(event);
  console.log('Dispatched campaign-data-refresh event', { force });
};

/**
 * Dispatches an event to trigger display refresh without fetching new data
 */
export const triggerDisplayRefresh = (): void => {
  const event = new CustomEvent('campaign-display-refresh');
  window.dispatchEvent(event);
  console.log('Dispatched campaign-display-refresh event');
};

/**
 * Notifies the system about an ad account change
 */
export const notifyAdAccountChange = (): void => {
  const event = new CustomEvent('ad-account-changed');
  window.dispatchEvent(event);
  console.log('Dispatched ad-account-changed event');
};

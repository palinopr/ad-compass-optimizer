
import { FunnelData } from '../types/funnelTypes';

const generateRandomStats = () => ({
  spend: `$${(Math.random() * 1000).toFixed(2)}`,
  results: (Math.random() * 100).toFixed(0),
  cpa: `$${(Math.random() * 50).toFixed(2)}`,
  roas: (Math.random() * 5).toFixed(2) + 'x',
  impressions: (Math.random() * 10000).toFixed(0),
  clicks: (Math.random() * 500).toFixed(0),
  ctr: (Math.random() * 5).toFixed(2) + '%'
});

const generateMockDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockFunnelData: FunnelData = {
  campaigns: Array.from({ length: 8 }, (_, i) => ({
    id: `mock_campaign_${i}`,
    name: `Mock Campaign ${i + 1}`,
    objective: ['CONVERSIONS', 'REACH', 'LINK_CLICKS'][i % 3],
    status: ['ACTIVE', 'PAUSED', 'ARCHIVED'][i % 3],
    spend: generateRandomStats().spend,
    results: generateRandomStats().results,
    cost_per_result: generateRandomStats().cpa,
    budget: `$${(Math.random() * 5000).toFixed(2)}`,
    daily_budget: `$${(Math.random() * 100).toFixed(2)}`,
    lifetime_budget: `$${(Math.random() * 10000).toFixed(2)}`,
    start_time: generateMockDate(30 - i),
    end_time: i % 3 === 0 ? null : generateMockDate(-10),
    created_time: generateMockDate(45 - i),
    updated_time: generateMockDate(2 - i),
    insights: {
      cpa: generateRandomStats().cpa,
      roas: generateRandomStats().roas,
      impressions: generateRandomStats().impressions,
      clicks: generateRandomStats().clicks
    }
  })),
  adsets: Array.from({ length: 24 }, (_, i) => ({
    id: `mock_adset_${i}`,
    campaign_id: `mock_campaign_${Math.floor(i / 3)}`,
    name: `Mock Ad Set ${i + 1}`,
    status: ['ACTIVE', 'PAUSED', 'ARCHIVED'][i % 3],
    spend: generateRandomStats().spend,
    results: generateRandomStats().results,
    daily_budget: `${(Math.random() * 100).toFixed(2)}`,
    insights: {
      ctr: generateRandomStats().ctr,
      cpc: generateRandomStats().cpa,
      frequency: (Math.random() * 3 + 1).toFixed(2)
    }
  })),
  ads: Array.from({ length: 72 }, (_, i) => ({
    id: `mock_ad_${i}`,
    adset_id: `mock_adset_${Math.floor(i / 3)}`,
    name: `Mock Ad ${i + 1}`,
    status: ['ACTIVE', 'PAUSED'][i % 2],
    creative: {
      id: `mock_creative_${i}`,
      title: `Mock Creative ${i + 1}`,
      image_url: `https://picsum.photos/400/300?random=${i}`
    },
    insights: {
      ctr: generateRandomStats().ctr,
      engagement_rate: `${(Math.random() * 10).toFixed(2)}%`,
      reach: (Math.random() * 5000).toFixed(0)
    }
  }))
};

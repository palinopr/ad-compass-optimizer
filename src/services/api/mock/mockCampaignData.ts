
import { FunnelData } from '../types/funnelTypes';
import { MetaCampaign } from '../MetaCampaignService';

// Generate a realistic date within the past year
const getRecentDate = (daysAgo = 60) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate a collection of realistic campaigns with varied statuses and properties
const generateCampaigns = (count = 10): MetaCampaign[] => {
  const objectives = ['CONVERSIONS', 'AWARENESS', 'TRAFFIC', 'REACH', 'APP_INSTALLS'];
  const statuses = ['ACTIVE', 'PAUSED', 'ARCHIVED'];
  const statusWeights = [0.6, 0.3, 0.1]; // 60% active, 30% paused, 10% archived
  
  return Array.from({ length: count }).map((_, idx) => {
    const campaignId = `23${idx.toString().padStart(8, '0')}`;
    const objective = objectives[idx % objectives.length];
    
    // Weighted random status selection
    const statusRand = Math.random();
    let cumulativeWeight = 0;
    let status = statuses[0];
    
    for (let i = 0; i < statuses.length; i++) {
      cumulativeWeight += statusWeights[i];
      if (statusRand <= cumulativeWeight) {
        status = statuses[i];
        break;
      }
    }
    
    // Generate random budget between $5-100 daily or $100-2000 lifetime
    const isDaily = Math.random() > 0.3;
    const dailyBudget = isDaily ? ((Math.random() * 95 + 5) * 100).toString() : undefined;
    const lifetimeBudget = !isDaily ? ((Math.random() * 1900 + 100) * 100).toString() : undefined;
    
    // Format budget for display
    const budget = isDaily ? 
      `$${(parseInt(dailyBudget || "0") / 100).toFixed(2)}/day` : 
      `$${(parseInt(lifetimeBudget || "0") / 100).toFixed(2)} total`;
    
    // Generate random performance metrics
    const spend = `$${(Math.random() * 200 + 10).toFixed(2)}`;
    const impressions = (Math.random() * 10000 + 1000).toFixed(0);
    const clicks = (Math.random() * 500 + 50).toFixed(0);
    const results = (Math.random() * 50 + 5).toFixed(0);

    // Generate cost per action and actions arrays to match MetaCampaign interface
    const cost_per_action_type = [
      {
        action_type: 'purchase',
        value: `$${(Math.random() * 20 + 2).toFixed(2)}`
      }
    ];
    
    const actions = [
      {
        action_type: 'purchase',
        value: results
      },
      {
        action_type: 'lead',
        value: (parseInt(results) * 1.5).toFixed(0)
      }
    ];
    
    return {
      id: campaignId,
      name: `Campaign ${idx + 1} - ${objective.toLowerCase()}`,
      objective,
      status,
      daily_budget: dailyBudget,
      lifetime_budget: lifetimeBudget,
      budget,
      spend,
      results,
      created_time: getRecentDate(90),
      updated_time: getRecentDate(15),
      start_time: getRecentDate(90),
      end_time: Math.random() > 0.7 ? getRecentDate(30) : undefined,
      insights: {
        impressions,
        clicks,
        spend,
        cpa: `$${(Math.random() * 20 + 2).toFixed(2)}`,
        roas: (Math.random() * 3 + 1).toFixed(2),
        cost_per_action_type,
        actions
      }
    };
  });
};

// Generate ad sets for each campaign
const generateAdSets = (campaigns: MetaCampaign[], adSetsPerCampaign = 3) => {
  return campaigns.flatMap(campaign => {
    return Array.from({ length: adSetsPerCampaign }).map((_, idx) => {
      const adSetId = `4${campaign.id.substring(1, 5)}${idx.toString().padStart(4, '0')}`;
      // Match parent campaign status with some variations
      let status = campaign.status;
      if (status === 'ACTIVE' && Math.random() > 0.7) {
        status = 'PAUSED';
      } else if (status === 'PAUSED' && Math.random() > 0.8) {
        status = 'ACTIVE';
      }
      
      return {
        id: adSetId,
        name: `Ad Set ${idx + 1} for ${campaign.name}`,
        campaign_id: campaign.id,
        status
      };
    });
  });
};

// Generate ads for each ad set
const generateAds = (adSets: any[], adsPerAdSet = 3) => {
  return adSets.flatMap(adSet => {
    return Array.from({ length: adsPerAdSet }).map((_, idx) => {
      const adId = `5${adSet.id.substring(1, 5)}${idx.toString().padStart(4, '0')}`;
      // Match parent ad set status with some variations
      let status = adSet.status;
      if (status === 'ACTIVE' && Math.random() > 0.6) {
        status = 'PAUSED';
      } else if (status === 'PAUSED' && Math.random() > 0.7) {
        status = 'ACTIVE';
      }
      
      return {
        id: adId,
        name: `Ad ${idx + 1} for ${adSet.name}`,
        adset_id: adSet.id,
        status
      };
    });
  });
};

// Generate the complete funnel data
const generateMockFunnelData = (): FunnelData => {
  const campaigns = generateCampaigns(10);
  const adSets = generateAdSets(campaigns);
  const ads = generateAds(adSets);
  
  return {
    campaigns,
    adsets: adSets,
    ads
  };
};

// Export the generated mock data
export const mockFunnelData = generateMockFunnelData();

// Export a function to regenerate data on demand
export const regenerateMockData = () => {
  const newData = generateMockFunnelData();
  Object.assign(mockFunnelData, newData);
  return mockFunnelData;
};

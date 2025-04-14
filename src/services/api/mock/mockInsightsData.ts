
import { InsightsResponse } from "../insights/types";

/**
 * Generate realistic mock insights data for any object ID
 */
export const generateMockInsights = (objectId: string): InsightsResponse => {
  // Use object ID as seed for deterministic but varied results
  const seed = parseInt(objectId.replace(/\D/g, '').slice(-5)) || 1;
  
  // Helper to generate realistic but varied values based on seed
  const generateValue = (base: number, variance: number): number => {
    return base + (seed % variance) - (variance / 2);
  };
  
  // Generate a random date within the last week
  const getRecentDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    return date.toISOString();
  };
  
  // Base and variation values for different metrics
  const baseImpressions = 1500;
  const baseClicks = 50;
  const baseSpend = 120;
  const baseConversions = 6;
  
  // Generate value with some randomness but tied to the object ID
  const impressions = Math.max(100, Math.round(generateValue(baseImpressions, 2000)));
  const clicks = Math.max(5, Math.round(generateValue(baseClicks, 100)));
  const spend = Math.max(10, Math.round(generateValue(baseSpend, 200) * 100) / 100);
  const conversions = Math.max(1, Math.round(generateValue(baseConversions, 12)));
  
  // Calculate derived metrics
  const ctr = (clicks / impressions) * 100;
  const cpc = spend / clicks;
  const cpa = spend / conversions;
  const roas = (conversions * 25) / spend; // Assuming $25 per conversion value
  
  // Format as currency or percentage as needed
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  
  return {
    data: [
      {
        date_start: getRecentDate().split('T')[0],
        date_stop: new Date().toISOString().split('T')[0],
        impressions: impressions.toString(),
        clicks: clicks.toString(),
        spend: formatCurrency(spend),
        ctr: formatPercentage(ctr),
        cpc: formatCurrency(cpc),
        actions: [
          {
            action_type: "purchase",
            value: conversions.toString()
          },
          {
            action_type: "lead",
            value: Math.floor(conversions * 1.5).toString()
          },
          {
            action_type: "page_view",
            value: Math.floor(clicks * 3).toString()
          }
        ],
        cost_per_action_type: [
          {
            action_type: "purchase",
            value: formatCurrency(cpa)
          }
        ],
        action_values: [
          {
            action_type: "purchase",
            value: formatCurrency(conversions * 25)
          }
        ],
        purchase_roas: [
          {
            action_type: "purchase",
            value: roas.toFixed(2)
          }
        ],
        website_purchase_roas: [
          {
            action_type: "purchase",
            value: roas.toFixed(2)
          }
        ],
        // Include demographic data if requested
        age: objectId.includes('demographic') ? [
          { age: "18-24", impressions: Math.floor(impressions * 0.2).toString() },
          { age: "25-34", impressions: Math.floor(impressions * 0.4).toString() },
          { age: "35-44", impressions: Math.floor(impressions * 0.25).toString() },
          { age: "45-54", impressions: Math.floor(impressions * 0.1).toString() },
          { age: "55+", impressions: Math.floor(impressions * 0.05).toString() }
        ] : undefined,
        // Include geographic data if requested
        country: objectId.includes('geographic') ? [
          { country: "US", impressions: Math.floor(impressions * 0.6).toString() },
          { country: "CA", impressions: Math.floor(impressions * 0.15).toString() },
          { country: "GB", impressions: Math.floor(impressions * 0.15).toString() },
          { country: "AU", impressions: Math.floor(impressions * 0.1).toString() }
        ] : undefined,
        objective: objectId.includes('CONVERSIONS') ? "CONVERSIONS" : 
                  objectId.includes('TRAFFIC') ? "TRAFFIC" : 
                  "AWARENESS"
      }
    ]
  };
};

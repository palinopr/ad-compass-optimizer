
export const buildInsightsUrl = (
  campaignId: string,
  token: string,
  datePreset: string,
  fields: string = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend'
): string => {
  if (['today', 'yesterday'].includes(datePreset)) {
    const date = datePreset === 'today' 
      ? new Date() 
      : new Date(Date.now() - 86400000);
    
    const formattedDate = date.toISOString().split('T')[0];
    return `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&time_range={"since":"${formattedDate}","until":"${formattedDate}"}&time_increment=1&access_token=${token}`;
  }
  
  return `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&time_increment=1&access_token=${token}`;
};

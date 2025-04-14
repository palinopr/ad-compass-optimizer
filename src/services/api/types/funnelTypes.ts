
import { MetaCampaign } from '../MetaCampaignService';

export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
}

export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  status: string;
}

export interface FunnelData {
  campaigns: MetaCampaign[];
  adsets: AdSet[];
  ads: Ad[];
}


import { toast } from '@/hooks/use-toast';
import { CampaignQueryBuilder } from '../campaign/fetching/campaignQueryBuilder';

export class FunnelDateService {
  // Valid date presets according to Meta API - strictly enforced from documentation
  private static validDatePresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  static validateDatePreset(preset: string = 'maximum'): string {
    // Direct check against valid presets
    if (this.validDatePresets.includes(preset)) {
      return preset;
    }
    
    // Explicit mapping for legacy values
    const mapping: Record<string, string> = {
      'last30days': 'last_30d',
      'last_28d': 'maximum',
      'last28d': 'maximum',
      'last7days': 'last_7d'
    };
    
    if (mapping[preset]) {
      console.log(`[META FUNNEL] Mapped legacy preset '${preset}' to '${mapping[preset]}'`);
      return mapping[preset];
    }
    
    // Default to maximum
    console.warn(`[META FUNNEL] Invalid preset '${preset}', using default 'maximum'`);
    return 'maximum';
  }

  static getInitialBuildVersion(): string {
    const version = CampaignQueryBuilder.getVersion();
    const timestamp = CampaignQueryBuilder.getBuildTimestamp();
    const versionString = `${version} (${timestamp})`;
    
    console.log(`[FUNNEL] Running on build version: ${versionString}`);
    return version;
  }

  static getDatePresetFromQuery(): string {
    const queryWithDatePreset = CampaignQueryBuilder.buildCampaignQuery();
    const extractedDatePreset = queryWithDatePreset.match(/date_preset\(([^)]+)\)/)?.[1] || 'unknown';
    
    console.log(`[FUNNEL] Using date preset: ${extractedDatePreset}`);
    return extractedDatePreset;
  }

  static notifyUserOfVersion(version: string, datePreset: string): void {
    toast({
      title: "Build Version",
      description: `Running ${version} with ${datePreset} date preset`,
      duration: 5000
    });
  }
}

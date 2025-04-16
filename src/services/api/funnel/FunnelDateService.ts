
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
  
  static validateDatePreset(preset: string = 'last_30d'): string {
    // Direct check against valid presets
    if (this.validDatePresets.includes(preset)) {
      return preset;
    }
    
    // Explicit mapping for legacy values
    const mapping: Record<string, string> = {
      'last30days': 'last_30d',
      'last_28d': 'last_30d',
      'last28d': 'last_30d',
      'last7days': 'last_7d'
    };
    
    if (mapping[preset]) {
      console.log(`[META FUNNEL] Mapped legacy preset '${preset}' to '${mapping[preset]}'`);
      return mapping[preset];
    }
    
    // Always display a warning toast when falling back
    toast({
      title: "Date preset warning",
      description: `Invalid preset '${preset}', using default 'last_30d'`,
      duration: 5000,
      variant: "warning"
    });
    
    // Default to last_30d
    console.warn(`[META FUNNEL] Invalid preset '${preset}', using default 'last_30d'`);
    return 'last_30d';
  }

  static getInitialBuildVersion(): string {
    const version = CampaignQueryBuilder.getVersion();
    const timestamp = CampaignQueryBuilder.getBuildTimestamp();
    const versionString = `${version} (${timestamp})`;
    
    console.log(`[FUNNEL] Running on build version: ${versionString}`);
    return version;
  }

  static getDatePresetFromQuery(): string {
    try {
      const queryWithDatePreset = CampaignQueryBuilder.buildCampaignQuery();
      const extractedDatePreset = queryWithDatePreset.match(/date_preset\(([^)]+)\)/)?.[1] || 'last_30d';
      
      console.log(`[FUNNEL] Using date preset: ${extractedDatePreset}`);
      return extractedDatePreset;
    } catch (error) {
      console.error('[FUNNEL] Error getting date preset from query:', error);
      return 'last_30d'; // Failsafe default
    }
  }

  static notifyUserOfVersion(version: string, datePreset: string): void {
    toast({
      title: "Build Version",
      description: `Running ${version} with ${datePreset} date preset`,
      duration: 5000
    });
  }
}

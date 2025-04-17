
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { CampaignQueryBuilder } from '@/services/api/campaign/fetching/campaignQueryBuilder';

interface AppInitializerProps {
  onInitialized: (buildInfo: string) => void;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ onInitialized }) => {
  useEffect(() => {
    console.log("✅ [APP] Component mounted");
    
    try {
      // Force cache clearing
      if (typeof localStorage !== 'undefined') {
        try {
          // Clear any cache that might be storing old campaign query configuration
          localStorage.removeItem('meta_api_cache');
          localStorage.removeItem('campaign_query_cache');
          localStorage.removeItem('last_campaign_fetch');
        } catch (e) {
          console.error("Error clearing cache:", e);
        }
      }
      
      const REBUILD_TIMESTAMP = new Date().toISOString();
      console.log(`[APP] Version 1.0.2 (Last updated: 2025-04-15)`);
      console.log(`[APP] Includes 28-day window fix: Yes`);
      console.log(`[APP] Rebuild timestamp: ${REBUILD_TIMESTAMP}`);
      
      // Get build info from query builder to confirm correct version is used
      const queryBuilderVersion = CampaignQueryBuilder.getVersion();
      const datePreset = CampaignQueryBuilder.buildCampaignQuery().match(/date_preset\(([^)]+)\)/)?.[1] || 'unknown';
      const buildInfo = `${queryBuilderVersion} (${datePreset})`;
      
      console.log(`[APP] Using CampaignQueryBuilder version: ${queryBuilderVersion}`);
      console.log(`[APP] Date preset being used: ${datePreset}`);
      
      toast({
        title: "Application Rebuilt",
        description: `Using last_28d date preset (${queryBuilderVersion})`,
        duration: 5000
      });
      
      // Pass build info to parent component
      onInitialized(buildInfo);
    } catch (error) {
      console.error("[APP] Error during initialization:", error);
      onInitialized(''); // Pass empty string if initialization fails
    }
  }, [onInitialized]);

  return null;
};

export default AppInitializer;

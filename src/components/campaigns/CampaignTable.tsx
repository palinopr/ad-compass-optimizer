
import React, { useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import CampaignTableRow from './CampaignTableRow';
import type { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { metaPermissionsInvalid } from '@/hooks/campaigns/useCampaigns';

interface CampaignTableProps {
  campaigns: MetaCampaign[];
  status?: 'active' | 'draft' | 'archived';
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
}

const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns, status = 'active', campaignsFetchStatus }) => {
  // Log render information to help debug
  useEffect(() => {
    console.log(`🔍 [CAMPAIGN TABLE] Rendering campaign table with ${campaigns?.length || 0} campaigns`);
    
    if (!campaigns || campaigns.length === 0) {
      console.warn("Campaign data is empty at CampaignTable");
    }
    
    // Add debug log to show all campaigns at render
    if (campaigns && campaigns.length > 0) {
      console.log("🧾 Campaign list at render:", campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        insightsStatus: c.insightsStatus || 'unknown',
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    } else {
      console.warn('[CAMPAIGN TABLE] ⚠️ No campaigns to render in table');
    }
  }, [campaigns]);

  // Make sure we have valid campaign data
  if (!campaigns) {
    console.error('[CAMPAIGN TABLE] Campaigns is null or undefined');
    return (
      <CardContent className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Campaign Data</AlertTitle>
          <AlertDescription>
            Unable to load campaign data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }
  
  console.log("[UI DEBUG] Campaigns received in CampaignTable:", campaigns);
  
  if (!campaigns.length) {
    return (
      <CardContent className="p-4">
        <div style={{ padding: "1rem", fontWeight: "bold" }}>⚠️ No campaigns found</div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <div style={{ fontWeight: "bold", marginBottom: "1rem", background: "#fff7cc", padding: "1rem", borderRadius: "6px" }}>
        ✅ Rendering fallback active — Campaigns loaded: {campaigns.length}
      </div>
      {campaigns.map((c, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "0.5rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#f0f0f0",
            fontFamily: "monospace",
          }}
        >
          🔍 Render test: <strong>{c?.name || "Unnamed Campaign"}</strong> — ID: <code>{c?.id || "N/A"}</code>
        </div>
      ))}
    </CardContent>
  );
};

export default CampaignTable;

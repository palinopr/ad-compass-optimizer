
export const parseDatePreset = (queryParams?: string): string | undefined => {
  if (!queryParams) return undefined;
  
  // First try to extract from insights.date_preset(xxx) format
  const insightsMatch = queryParams.match(/insights\.date_preset\(([^)]+)\)/);
  if (insightsMatch) {
    return insightsMatch[1];
  }
  
  // Try to extract from direct date_preset(xxx) format
  const directMatch = queryParams.match(/date_preset\(([^)]+)\)/);
  if (directMatch) {
    return directMatch[1];
  }
  
  // Try to extract from URL parameter date_preset=xxx format
  const urlParamMatch = queryParams.match(/[?&]date_preset=([^&]+)/);
  if (urlParamMatch) {
    return urlParamMatch[1];
  }
  
  return undefined;
};

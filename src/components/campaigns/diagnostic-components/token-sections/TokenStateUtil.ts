
export const parseErrorMessage = (fetchErrorRaw: string | null): string | null => {
  if (!fetchErrorRaw) return null;
  
  try {
    const errorObj = JSON.parse(fetchErrorRaw);
    return errorObj.message || 'Unknown error';
  } catch (e) {
    return fetchErrorRaw || 'Error parsing error details';
  }
};

export const checkDataInconsistency = (
  lastFetchSuccess: boolean,
  campaignCount: number,
  tokenAnalysis?: any
): boolean => {
  return lastFetchSuccess && 
    campaignCount > 0 && 
    tokenAnalysis?.cors?.hasCorsIssues;
};

export const checkUIDisplayIssue = (
  campaignCount: number,
  pathname: string,
  tokenAnalysis?: any
): boolean => {
  return campaignCount > 0 && (
    // Either user is on campaigns page but no data shows
    pathname.includes('campaign') || 
    // Or we have explicit CORS issues
    tokenAnalysis?.cors?.hasCorsIssues || 
    // Or there's a mismatch between data fetched and displayed
    localStorage.getItem('display_issue_detected') === 'true'
  );
};

export const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) return 'Unknown';
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch (e) {
    return 'Invalid timestamp';
  }
};

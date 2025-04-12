
export const runTokenDiagnostic = () => {
  // Get token from localStorage
  const token = localStorage.getItem('meta_access_token');
  
  console.log('=== META TOKEN DIAGNOSTIC ===');
  console.log('Token exists:', !!token);
  
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    console.log('Token contains whitespace:', /\s/.test(token));
    console.log('Token contains invalid chars:', /[^a-zA-Z0-9_\-\.]/.test(token));
  }
  
  // Get permissions
  const permissionsStr = localStorage.getItem('meta_permissions');
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
  
  console.log('Permissions:', permissions);
  console.log('Has ads_management:', permissions.includes('ads_management'));
  console.log('Has ads_read:', permissions.includes('ads_read'));
  
  // Get token timestamp
  const timestamp = localStorage.getItem('meta_token_timestamp');
  if (timestamp) {
    const tokenAge = Math.floor((Date.now() - parseInt(timestamp)) / (24 * 60 * 60 * 1000));
    console.log('Token age (days):', tokenAge);
  }
  
  console.log('=== END DIAGNOSTIC ===');
  
  return {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    hasWhitespace: token ? /\s/.test(token) : false,
    hasInvalidChars: token ? /[^a-zA-Z0-9_\-\.]/.test(token) : false,
    permissions,
    hasAdsManagement: permissions.includes('ads_management'),
    hasAdsRead: permissions.includes('ads_read')
  };
};

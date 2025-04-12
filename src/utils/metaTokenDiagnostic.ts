
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
    hasAdsRead: permissions.includes('ads_read'),
    tokenAge: timestamp ? Math.floor((Date.now() - parseInt(timestamp)) / (24 * 60 * 60 * 1000)) : null
  };
};

// Comprehensive diagnosis - analyzes token issues and suggests solutions
export const analyzeDiagnosticResults = (results) => {
  const issues = [];
  const recommendations = [];
  
  if (!results.hasToken) {
    issues.push('No Meta access token found in storage');
    recommendations.push('Connect your Meta account or manually enter a valid token');
  } else {
    // Check token validity issues
    if (results.hasWhitespace) {
      issues.push('Token contains whitespace characters');
      recommendations.push('Remove all whitespace from the token');
    }
    
    if (results.hasInvalidChars) {
      issues.push('Token contains invalid characters');
      recommendations.push('Ensure token only contains alphanumeric characters, underscores, hyphens, and periods');
    }
    
    if (results.tokenLength < 20) {
      issues.push('Token appears to be too short');
      recommendations.push('Verify you have the complete token');
    }
    
    // Check token age
    if (results.tokenAge !== null) {
      if (results.tokenAge > 50) {
        issues.push(`Token is ${results.tokenAge} days old and may expire soon`);
        recommendations.push('Generate a new token before it expires (standard expiry is 60 days)');
      } else if (results.tokenAge > 60) {
        issues.push(`Token is ${results.tokenAge} days old and likely expired`);
        recommendations.push('Generate a new token as yours has likely expired');
      }
    }
    
    // Permission issues
    if (!results.hasAdsManagement || !results.hasAdsRead) {
      const missingPermissions = [];
      if (!results.hasAdsManagement) missingPermissions.push('ads_management');
      if (!results.hasAdsRead) missingPermissions.push('ads_read');
      
      issues.push(`Missing required permissions: ${missingPermissions.join(', ')}`);
      recommendations.push('Generate a new token with the required permissions');
    }
  }
  
  return {
    issues: issues.length > 0 ? issues : ['No token issues detected'],
    recommendations: recommendations.length > 0 ? recommendations : ['Token appears to be valid'],
    severity: issues.length === 0 ? 'ok' : (issues.length > 2 ? 'high' : 'medium')
  };
};

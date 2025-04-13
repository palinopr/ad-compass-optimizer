
export const runTokenDiagnostic = () => {
  // Get token from localStorage
  const token = localStorage.getItem('meta_access_token');
  const source = localStorage.getItem('meta_token_source') || 'unknown';
  
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
  let tokenAge = null;
  if (timestamp) {
    tokenAge = Math.floor((Date.now() - parseInt(timestamp)) / (24 * 60 * 60 * 1000));
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
    tokenAge,
    source
  };
};

// Comprehensive diagnosis - analyzes token issues and suggests solutions
export const analyzeDiagnosticResults = (results) => {
  const issues = [];
  const recommendations = [];
  let isValid = false;
  let severity = 'high'; // high, medium, low
  
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
      recommendations.push('Ensure token only contains letters, numbers, underscores, hyphens and periods');
    }
    
    if (results.tokenLength < 50) {
      issues.push('Token appears to be too short to be valid');
      recommendations.push('Ensure you have copied the entire token correctly');
    }
    
    // Check permissions
    const missingPermissions = [];
    if (!results.hasAdsRead) missingPermissions.push('ads_read');
    if (!results.hasAdsManagement) missingPermissions.push('ads_management');
    
    if (missingPermissions.length > 0) {
      issues.push(`Token is missing required permissions: ${missingPermissions.join(', ')}`);
      recommendations.push('Generate a new token with the required permissions');
    }
    
    // Check token age
    if (results.tokenAge !== null) {
      if (results.tokenAge > 60) {
        issues.push(`Token is ${results.tokenAge} days old and likely expired`);
        recommendations.push('Generate a new token as the current one appears to be expired');
      } else if (results.tokenAge > 50) {
        issues.push(`Token is ${results.tokenAge} days old and will expire soon`);
        severity = 'medium';
        recommendations.push('Consider generating a new token soon as this one will expire');
      }
    } else {
      issues.push('Could not determine token age');
      severity = 'medium';
      recommendations.push('Check token timestamp in browser storage');
    }
    
    // Determine overall validity
    isValid = !results.hasWhitespace && 
              !results.hasInvalidChars && 
              results.tokenLength >= 50 && 
              (results.hasAdsRead || results.hasAdsManagement) &&
              (results.tokenAge === null || results.tokenAge <= 60);
  }
  
  return {
    isValid,
    severity,
    issues,
    recommendations,
    message: issues.length > 0 ? issues[0] : 'Token is valid' // Add message property to match interface
  };
};

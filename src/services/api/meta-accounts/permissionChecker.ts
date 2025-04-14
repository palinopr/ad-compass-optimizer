
import { META_API_CONFIG } from '@/config/socialAuth';
import { metaAuthService } from '@/services/MetaAuthService';

export const validateAdAccountPermissions = () => {
  const requiredPermissions = META_API_CONFIG.adPermissions;
  const storedPermissions = metaAuthService.getPermissions();
  
  const missingPermissions = requiredPermissions.filter(
    perm => !storedPermissions.includes(perm)
  );
  
  if (missingPermissions.length > 0) {
    console.warn(`Token lacks required permissions: ${missingPermissions.join(', ')}`);
    throw new Error(
      `Your token lacks the required permissions (${missingPermissions.join(', ')}) to access ad accounts. ` +
      `Please reconnect with the necessary permissions or use a System User Token.`
    );
  }
};

export const validateBusinessPermissions = () => {
  if (!metaAuthService.hasBusinessManagerPermissions()) {
    throw new Error(
      `Your token lacks the required permission (business_management) to access business manager data. ` +
      `Please reconnect with the necessary permissions or use a System User Token.`
    );
  }
};


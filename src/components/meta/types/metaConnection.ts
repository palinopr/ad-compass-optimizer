
export interface MetaConnectionContextType {
  isAuthenticated: boolean;
  userData: any | null;
  hasPermissions: boolean;
  checkAuth: () => void;
  showConnectionDialog: () => void;
}

export const initialMetaConnectionContext: MetaConnectionContextType = {
  isAuthenticated: false,
  userData: null,
  hasPermissions: false,
  checkAuth: () => {},
  showConnectionDialog: () => {},
};


export enum ConnectionStep {
  LOGIN,
  SELECT_BUSINESS,
  SELECT_ACCOUNTS,
  CONNECTED
}

export interface MetaConnectionFlowProps {
  onComplete?: () => void;
}

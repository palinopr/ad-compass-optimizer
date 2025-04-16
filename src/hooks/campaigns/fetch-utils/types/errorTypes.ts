
export interface ErrorDetails {
  code?: number;
  subcode?: number;
  type?: string;
  message?: string;
  fbtrace_id?: string;
  status?: number;
  general?: string;
  isPermissionError?: boolean;
  [key: string]: any;
}

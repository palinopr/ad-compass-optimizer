
export interface MetaApiError {
  code?: number;
  type?: string;
  message?: string;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface ErrorResponse {
  error: string;
  errorDetails: any;
}

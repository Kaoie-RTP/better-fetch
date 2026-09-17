export type ParseType =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
  | false;

export interface FetchOptions extends Omit<RequestInit, 'headers' | 'body'> {
  base?: string | URL;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  parse?: ParseType;
  throwOnError?: boolean;
  fetch?: typeof fetch;
  beforeRequest?: (init: RequestInit) => void | Promise<void>;
  afterResponse?: (
    response: Response,
  ) => Response | void | Promise<Response | void>;
}

export interface HttpClient {
  get<T = any>(url?: string, options?: FetchOptions): Promise<T>;
  post<T = any, B = any>(
    url?: string,
    payload?: B,
    options?: FetchOptions,
  ): Promise<T>;
  put<T = any, B = any>(
    url?: string,
    payload?: B,
    options?: FetchOptions,
  ): Promise<T>;
  patch<T = any, B = any>(
    url?: string,
    payload?: B,
    options?: FetchOptions,
  ): Promise<T>;
  delete<T = any>(url?: string, options?: FetchOptions): Promise<T>;
  raw<T = any, B = any>(
    method: string,
    url?: string,
    payload?: B,
    options?: FetchOptions,
  ): Promise<T>;
}

export interface Fetcher {
  (defaultOptions?: FetchOptions): HttpClient;
}

declare const fetcher: Fetcher;
export default fetcher;

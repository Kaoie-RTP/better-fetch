//#region src/index.d.ts
export type ParseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | false;
export type QueryParams = Record<string, string | number | boolean | null | undefined>;
export interface FetchOptions extends Omit<RequestInit, 'headers' | 'body'> {
  base?: string | URL;
  query?: QueryParams;
  headers?: HeadersInit;
  parse?: ParseType;
  throwOnError?: boolean;
  fetch?: typeof fetch;
  beforeRequest?: (init: RequestInit) => void | Promise<void>;
  afterResponse?: (response: Response) => Response | void | Promise<Response | void>;
}
export interface HttpClient {
  get<T = unknown>(url?: string, options?: FetchOptions): Promise<T>;
  post<T = unknown, B = unknown>(url?: string, payload?: B, options?: FetchOptions): Promise<T>;
  put<T = unknown, B = unknown>(url?: string, payload?: B, options?: FetchOptions): Promise<T>;
  patch<T = unknown, B = unknown>(url?: string, payload?: B, options?: FetchOptions): Promise<T>;
  delete<T = unknown>(url?: string, options?: FetchOptions): Promise<T>;
  raw<T = unknown, B = unknown>(method: string, url?: string, payload?: B, options?: FetchOptions): Promise<T>;
}
declare const fetcher: (defaultOptions?: FetchOptions) => HttpClient;
//#endregion
export { fetcher as default };
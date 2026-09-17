import { expect, describe, it, beforeEach, vi } from 'vitest';
import fetcher from './index.js';

describe('Fetcher Unit Tests', () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock global fetch API
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ success: true }),
      text: async () => 'hello world',
    });
  });

  describe('URL & Query Resolution', () => {
    it('should combine base URL and relative path correctly', async () => {
      const api = fetcher({
        base: 'https://api.example.com/v1',
        fetch: mockFetch,
      });
      await api.get('/users');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/users',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('should ignore base URL if relative path contains protocol', async () => {
      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });
      await api.get('https://other-domain.com/data');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://other-domain.com/data',
        expect.anything(),
      );
    });

    it('should append query parameters safely', async () => {
      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });
      await api.get('/search', {
        query: { q: 'vitest', page: 1, filter: null },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/search?q=vitest&page=1',
        expect.anything(),
      );
    });
  });

  describe('Payload & Headers Encoding', () => {
    it('should stringify object payload and set application/json content-type', async () => {
      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });
      const payload = { name: 'John Doe', age: 30 };

      await api.post('/users', payload);

      const [url, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify(payload));
      expect(init.headers.get('content-type')).toBe('application/json');
    });

    it('should merge global headers with per-request headers', async () => {
      const api = fetcher({
        base: 'https://api.example.com',
        headers: { Authorization: 'Bearer token-123' },
        fetch: mockFetch,
      });

      await api.get('/profile', {
        headers: { 'X-Custom-Header': 'CustomValue' },
      });

      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get('authorization')).toBe('Bearer token-123');
      expect(init.headers.get('x-custom-header')).toBe('CustomValue');
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should trigger beforeRequest hook before executing fetch', async () => {
      const beforeRequest = vi.fn(init => {
        init.headers.set('X-Added-Hook', 'true');
      });

      const api = fetcher({
        base: 'https://api.example.com',
        beforeRequest,
        fetch: mockFetch,
      });

      await api.get('/test');

      expect(beforeRequest).toHaveBeenCalled();
      const [, init] = mockFetch.mock.calls[0];
      expect(init.headers.get('x-added-hook')).toBe('true');
    });

    it('should allow afterResponse hook to modify the response', async () => {
      const afterResponse = vi.fn(async res => {
        return {
          ...res,
          json: async () => ({ intercepted: true }),
        };
      });

      const api = fetcher({
        base: 'https://api.example.com',
        afterResponse,
        fetch: mockFetch,
      });

      const result = await api.get('/test');
      expect(afterResponse).toHaveBeenCalled();
      expect(result).toEqual({ intercepted: true });
    });
  });

  describe('Error Handling & Parsing Options', () => {
    it('should throw an error when response is not ok (4xx/5xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });

      await expect(api.get('/not-found')).rejects.toThrow('Not Found');
    });

    it('should not throw error if throwOnError is set to false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid Input' }),
      });

      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });
      const res = await api.get('/bad-request', { throwOnError: false });

      expect(res).toEqual({ error: 'Invalid Input' });
    });

    it('should return raw response when parse option is false', async () => {
      const rawResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
      };
      mockFetch.mockResolvedValueOnce(rawResponse);

      const api = fetcher({
        base: 'https://api.example.com',
        fetch: mockFetch,
      });
      const res = await api.get('/raw', { parse: false });

      expect(res).toBe(rawResponse);
    });
  });
});
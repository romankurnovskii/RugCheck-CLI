import { describe, expect, it, vi } from 'vitest';
import { createRugCheckClient, RugCheckClient, RugCheckErrorClass } from '../src/client';

const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('RugCheckClient', () => {
  describe('constructor and factory', () => {
    it('creates client with default options', () => {
      const client = new RugCheckClient();
      expect(client).toBeInstanceOf(RugCheckClient);
    });

    it('creates client with custom options', () => {
      const client = new RugCheckClient({
        apiKey: 'custom-key',
        baseUrl: 'https://custom.example.com',
        timeout: 10000,
      });
      expect(client).toBeInstanceOf(RugCheckClient);
    });

    it('creates client via factory function', () => {
      const client = createRugCheckClient({ apiKey: 'factory-key' });
      expect(client).toBeInstanceOf(RugCheckClient);
    });
  });

  describe('ping', () => {
    it('returns pong message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'pong' }),
      });

      const client = new RugCheckClient();
      const result = await client.ping();
      expect(result).toEqual({ message: 'pong' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/ping',
        expect.any(Object),
      );
    });
  });

  describe('search', () => {
    it('searches tokens with query', async () => {
      const mockResults = [
        { mint: 'abc', name: 'Test', symbol: 'TST', verified: true, score: 100 },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults),
      });

      const client = new RugCheckClient({ apiKey: 'test-api-key' });
      const result = await client.search('test', 20, 0, 0);
      expect(result).toEqual(mockResults);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/search?limit=20&page=0&maxScore=0&q=test',
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-API-KEY': 'test-api-key' }),
        }),
      );
    });

    it('searches trending tokens without query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const client = new RugCheckClient();
      await client.search();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/search?limit=20&page=0&maxScore=0',
        expect.any(Object),
      );
    });

    it('caps limit at 50', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const client = new RugCheckClient();
      await client.search('test', 100);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object),
      );
    });
  });

  describe('tokenSummary', () => {
    it('returns token summary', async () => {
      const mockSummary = {
        mint: 'abc',
        score: 250,
        score_normalised: 75,
        risks: [],
        lpLockedPct: 45.5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSummary),
      });

      const client = new RugCheckClient();
      const result = await client.tokenSummary('abc');
      expect(result).toEqual(mockSummary);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/abc/report/summary',
        expect.any(Object),
      );
    });

    it('appends cacheOnly param when true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = new RugCheckClient();
      await client.tokenSummary('abc', true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cacheOnly=true'),
        expect.any(Object),
      );
    });
  });

  describe('tokenReport', () => {
    it('returns full token report', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = new RugCheckClient();
      await client.tokenReport('abc');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/abc/report',
        expect.any(Object),
      );
    });

    it('adds refresh query param when true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = new RugCheckClient();
      await client.tokenReport('abc', true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('refresh=true'),
        expect.any(Object),
      );
    });
  });

  describe('verifiedTokens', () => {
    it('returns verified tokens with default options', async () => {
      const mockResponse = {
        tokens: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = new RugCheckClient();
      const result = await client.verifiedTokens();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/verified?limit=20',
        expect.any(Object),
      );
    });

    it('includes cursor when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tokens: [], nextCursor: 'abc' }),
      });

      const client = new RugCheckClient();
      await client.verifiedTokens(20, 'abc');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cursor=abc'),
        expect.any(Object),
      );
    });

    it('caps limit between 1 and 100', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tokens: [] }),
      });

      const client = new RugCheckClient();
      await client.verifiedTokens(200);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100'),
        expect.any(Object),
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tokens: [] }),
      });

      await client.verifiedTokens(0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=1'),
        expect.any(Object),
      );
    });
  });

  describe('vote', () => {
    it('submits vote with upvote', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ up: 10, down: 0, userVoted: true }),
      });

      const client = new RugCheckClient({ apiKey: 'test-api-key' });
      const result = await client.vote({ mint: 'abc', side: true });
      expect(result).toEqual({ up: 10, down: 0, userVoted: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/abc/vote',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ mint: 'abc', side: true }),
        }),
      );
    });

    it('submits vote with downvote', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ up: 10, down: 1, userVoted: true }),
      });

      const client = new RugCheckClient();
      await client.vote({ mint: 'abc', side: false });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/vote'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ mint: 'abc', side: false }),
        }),
      );
    });
  });

  describe('bulkSummary', () => {
    it('returns bulk summaries', async () => {
      const mockSummaries = [
        { mint: 'abc', score: 100, score_normalised: 50, risks: [], lpLockedPct: 50 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSummaries),
      });

      const client = new RugCheckClient({ apiKey: 'test-api-key' });
      const result = await client.bulkSummary({ tokens: ['abc', 'def'] });
      expect(result).toEqual(mockSummaries);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/bulk/tokens/summary',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ tokens: ['abc', 'def'] }),
        }),
      );
    });
  });

  describe('lockers', () => {
    it('returns lockers info', async () => {
      const mockLockers = {
        lockers: {},
        total: { pct: 75, totalUSDC: 50000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLockers),
      });

      const client = new RugCheckClient({ apiKey: 'test-api-key' });
      const result = await client.lockers('abc');
      expect(result).toEqual(mockLockers);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rugcheck.xyz/v1/tokens/abc/lockers',
        expect.any(Object),
      );
    });
  });

  describe('error handling', () => {
    it('throws RugCheckError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const client = new RugCheckClient();
      try {
        await client.tokenSummary('abc');
      } catch (error) {
        expect(error).toBeInstanceOf(RugCheckErrorClass);
        expect((error as Error).message).toBe('Unauthorized');
      }
    });

    it('throws RugCheckError on rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limited' }),
      });

      const client = new RugCheckClient();
      await expect(client.tokenSummary('abc')).rejects.toThrow(RugCheckErrorClass);
    });

    it('throws on network timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockImplementationOnce(() => {
        const controller = new AbortController();
        controller.abort();
        return Promise.reject(abortError);
      });

      const client = new RugCheckClient({ timeout: 100 });
      await expect(client.tokenSummary('abc')).rejects.toThrow('Request timeout');
    });
  });
});

import type {
  TokenSummary,
  TokenSearchResult,
  VerifiedToken,
  VerifiedTokensResponse,
  TokenValidation,
  VoteStats,
  LockersResponse,
  EligibilityResponse,
  VerificationTransactionRequest,
  VerificationTransactionResponse,
  VerificationSubmitRequest,
  VerificationSubmitResponse,
  BulkReportRequest,
  BulkSummaryRequest,
  VoteRequest,
  VoteResponse,
  LeaderboardEntry,
  DomainEntry,
  DomainLookupResponse,
  StatsNewToken,
  StatsRecent,
  StatsTrending,
  MaintenanceResponse,
  PingResponse,
  RugCheckError,
} from './types.js';

export interface RugCheckClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class RugCheckErrorClass extends Error {
  public status: number;
  public body: unknown;

  constructor(status: number, body: unknown) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as RugCheckError).error)
        : `HTTP ${status}`;
    super(message);
    this.name = 'RugCheckError';
    this.status = status;
    this.body = body;
  }
}

export class RugCheckClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: RugCheckClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? 'https://api.rugcheck.xyz').replace(/\/+$/, '');
    this.timeout = options.timeout ?? 30000;
  }

  private async request<T>(
    path: string,
    init?: RequestInit & { responseType?: 'json' | 'text' },
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      ...((init?.headers as Record<string, string>) ?? {}),
    };

    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey;
    }

    if (!(init?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new RugCheckErrorClass(response.status, body);
      }

      if (init?.responseType === 'text') {
        return (await response.text()) as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof RugCheckErrorClass) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  // System
  ping(): Promise<PingResponse> {
    return this.request<PingResponse>('/ping');
  }

  maintenance(): Promise<MaintenanceResponse> {
    return this.request<MaintenanceResponse>('/v1/maintenance');
  }

  leaderboard(page = 0, limit = 50): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 100)),
    });
    return this.request<LeaderboardEntry[]>(`/v1/leaderboard?${params}`);
  }

  // Search
  search(
    query?: string,
    limit = 20,
    page = 0,
    maxScore = 0,
  ): Promise<TokenSearchResult[]> {
    const params = new URLSearchParams({
      limit: String(Math.min(limit, 50)),
      page: String(page),
      maxScore: String(maxScore),
    });
    if (query && query.trim()) {
      params.set('q', query.trim());
    }
    return this.request<TokenSearchResult[]>(`/v1/search?${params}`);
  }

  // Token Analysis
  tokenReport(mint: string, refresh = false): Promise<unknown> {
    const params = refresh ? '?refresh=true' : '';
    return this.request(`/v1/tokens/${encodeURIComponent(mint)}/report${params}`);
  }

  tokenSummary(
    mint: string,
    cacheOnly?: boolean,
    refresh = false,
  ): Promise<TokenSummary> {
    const params = new URLSearchParams();
    if (cacheOnly) params.set('cacheOnly', 'true');
    if (refresh) params.set('refresh', 'true');
    const qs = params.toString();
    const suffix = qs ? `?${qs}` : '';
    return this.request<TokenSummary>(
      `/v1/tokens/${encodeURIComponent(mint)}/report/summary${suffix}`,
    );
  }

  reportToken(mint: string): Promise<{ ok: boolean }> {
    return this.request(`/v1/tokens/${encodeURIComponent(mint)}/report`, {
      method: 'POST',
    });
  }

  insidersGraph(mint: string): Promise<unknown> {
    return this.request(`/v1/tokens/${encodeURIComponent(mint)}/insiders/graph`);
  }

  // Bulk
  bulkReport(request: BulkReportRequest): Promise<unknown[]> {
    return this.request('/v1/bulk/tokens/report', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  bulkSummary(request: BulkSummaryRequest): Promise<TokenSummary[]> {
    return this.request<TokenSummary[]>('/v1/bulk/tokens/summary', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Verification
  verifiedTokens(limit = 20, cursor?: string): Promise<VerifiedTokensResponse> {
    const params = new URLSearchParams({
      limit: String(Math.min(Math.max(limit, 1), 100)),
    });
    if (cursor) params.set('cursor', cursor);
    return this.request<VerifiedTokensResponse>(`/v1/tokens/verified?${params}`);
  }

  tokenValidation(mint: string): Promise<TokenValidation> {
    return this.request<TokenValidation>(
      `/v1/tokens/${encodeURIComponent(mint)}/validation`,
    );
  }

  verifyEligible(mint: string): Promise<EligibilityResponse> {
    return this.request<EligibilityResponse>('/v1/tokens/verify/eligible', {
      method: 'POST',
      body: JSON.stringify({ mint }),
    });
  }

  verifyTransaction(
    request: VerificationTransactionRequest,
  ): Promise<VerificationTransactionResponse> {
    return this.request<VerificationTransactionResponse>(
      '/v1/tokens/verify/transaction',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  }

  verify(request: VerificationSubmitRequest): Promise<VerificationSubmitResponse> {
    return this.request<VerificationSubmitResponse>('/v1/tokens/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Stats
  statsNewTokens(): Promise<StatsNewToken[]> {
    return this.request<StatsNewToken[]>('/v1/stats/new_tokens');
  }

  statsRecent(): Promise<StatsRecent[]> {
    return this.request<StatsRecent[]>('/v1/stats/recent');
  }

  statsTrending(): Promise<StatsTrending[]> {
    return this.request<StatsTrending[]>('/v1/stats/trending');
  }

  statsVerified(): Promise<VerifiedToken[]> {
    return this.request<VerifiedToken[]>('/v1/stats/verified');
  }

  // Domains
  domains(page = 0, limit = 10, verified = true): Promise<DomainEntry[]> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      verified: String(verified),
    });
    return this.request<DomainEntry[]>(`/v1/domains?${params}`);
  }

  domainLookup(domain: string): Promise<DomainLookupResponse> {
    return this.request<DomainLookupResponse>(
      `/v1/domains/lookup/${encodeURIComponent(domain)}`,
    );
  }

  // Vaults
  lockers(mint: string): Promise<LockersResponse> {
    return this.request<LockersResponse>(
      `/v1/tokens/${encodeURIComponent(mint)}/lockers`,
    );
  }

  fluxLockers(mint: string): Promise<LockersResponse> {
    return this.request<LockersResponse>(
      `/v1/tokens/${encodeURIComponent(mint)}/lockers/flux`,
    );
  }

  // Voting
  vote(request: VoteRequest): Promise<VoteResponse> {
    return this.request<VoteResponse>(
      `/v1/tokens/${encodeURIComponent(request.mint)}/vote`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    );
  }

  votes(mint: string): Promise<VoteStats> {
    return this.request<VoteStats>(`/v1/tokens/${encodeURIComponent(mint)}/votes`);
  }
}

export function createRugCheckClient(options?: RugCheckClientOptions): RugCheckClient {
  return new RugCheckClient(options);
}

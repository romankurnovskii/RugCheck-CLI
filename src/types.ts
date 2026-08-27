export interface TokenSummary {
  mint: string;
  score: number;
  score_normalised: number;
  risks: Risk[];
  lpLockedPct: number;
  tokenType?: string;
  tokenProgram?: string;
}

export interface Risk {
  name: string;
  level: string;
  score: number;
  description: string;
  value?: string;
}

export interface TokenSearchResult {
  mint: string;
  name: string;
  symbol: string;
  verified: boolean;
  score: number;
  mcap?: number;
  holders?: number;
}

export interface VerifiedToken {
  mint: string;
  payer: string;
  name: string;
  symbol: string;
  description: string;
  jup_verified: boolean;
  jup_strict: boolean;
  validated: boolean;
  links: { provider: string; value: string }[];
}

export interface VerifiedTokensResponse {
  tokens: VerifiedToken[];
  nextCursor?: string;
}

export interface TokenValidation {
  mint: string;
  validated: boolean;
  website?: string;
  socials?: Record<string, string>;
}

export interface VoteStats {
  up: number;
  down: number;
  userVoted: boolean;
}

export interface LockerInfo {
  type: string;
  usdcLocked: number;
  unlockDate: number;
  uri: string;
}

export interface LockersResponse {
  lockers: Record<string, LockerInfo>;
  total: {
    pct: number;
    totalUSDC: number;
  };
}

export interface EligibilityResponse {
  eligible: boolean;
  mint: string;
  criteria: {
    exists: boolean;
    created_recently: boolean;
    duplicate: boolean;
    freeze_authority_set: boolean;
    mint_authority_set: boolean;
    liquidity_unlocked: boolean;
    metadata_missing: boolean;
    risk_score: number;
  };
}

export interface VerificationTransactionRequest {
  mint: string;
  payer: string;
  priority_fee?: number;
  data: {
    solDomain?: string;
    description?: string;
    termsAccepted: boolean;
    dataIntegrityAccepted: boolean;
    links?: Record<string, string>;
  };
}

export interface VerificationTransactionResponse {
  transaction: string;
}

export interface VerificationSubmitRequest {
  mint: string;
  payer: string;
  signature: string;
  data: {
    solDomain?: string;
    description?: string;
    termsAccepted: boolean;
    dataIntegrityAccepted: boolean;
    links?: Record<string, string>;
  };
}

export interface VerificationSubmitResponse {
  ok: boolean;
}

export interface BulkReportRequest {
  tokens: string[];
  cacheOnly?: boolean;
}

export interface BulkSummaryRequest {
  tokens: string[];
  cacheOnly?: boolean;
}

export interface VoteRequest {
  mint: string;
  side: boolean;
}

export interface VoteResponse {
  up: number;
  down: number;
  userVoted: boolean;
}

export interface LeaderboardEntry {
  address: string;
  votes: number;
  wins: number;
  weight: number;
}

export interface DomainEntry {
  domain: string;
  mint: string;
  verified: boolean;
}

export interface DomainLookupResponse {
  mint: string;
}

export interface StatsNewToken {
  mint: string;
  name: string;
  symbol: string;
  score: number;
}

export interface StatsRecent {
  mint: string;
  score: number;
  visits: number;
  user_visits: number;
}

export interface StatsTrending {
  mint: string;
  vote_count: number;
  up_count: number;
}

export interface MaintenanceResponse {
  message: string;
}

export interface PingResponse {
  message: string;
}

export interface RugCheckError {
  error: string;
}

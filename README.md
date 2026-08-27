<div align="center">
		<img src="https://rugcheck.xyz/favicon.jpg">
  <h1 align="center">@etemaro/rugcheck</h1>
  <p align="center">
    <strong>SDK for the RugCheck Token Security API</strong>
    <br/>
    https://fluxrpc.com/docs/rugcheck 
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@etemaro/rugcheck">
      <img src="https://img.shields.io/npm/v/@etemaro/rugcheck?style=flat-square&color=blue" alt="NPM Version">
    </a>
    <a href="https://github.com/romankurnovskii/RugCheck-CLI/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/romankurnovskii/RugCheck-CLI?style=flat-square&color=green" alt="License">
    </a>
    <a href="https://github.com/romankurnovskii/RugCheck-CLI/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/romankurnovskii/RugCheck-CLI/ci.yml?style=flat-square&label=CI" alt="Build Status">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript" alt="TypeScript">
    </a>
  </p>
</div>

---

## 🚀 Features

- **Full API Coverage**: All RugCheck API endpoints implemented with TypeScript types
- **Type Safety**: Complete TypeScript definitions for all requests and responses
- **Error Handling**: Structured `RugCheckError` class with status codes and error bodies
- **Timeout Support**: Configurable request timeouts with AbortController
- **CLI Included**: Ready-to-use command-line interface
- **Zero Dependencies** (runtime): Uses native `fetch` API, no extra HTTP client
- **Production Ready**: Comprehensive tests, linting, and type checking

## 🛠️ Installation

```bash
npm install @etemaro/rugcheck
```

## 📖 Usage

### SDK Usage

```typescript
import { RugCheckClient, createRugCheckClient } from "@etemaro/rugcheck";

// Using the class
const client = new RugCheckClient({
  apiKey: process.env.RUGCHECK_API_KEY,
  baseUrl: "https://api.rugcheck.xyz",
  timeout: 30000,
});

// Or use the factory function
const client = createRugCheckClient({
  apiKey: process.env.RUGCHECK_API_KEY,
});

// Quick token summary (public)
const summary = await client.tokenSummary("TokenMintAddress");
console.log(`Risk Score: ${summary.score_normalised}/100`);
console.log(`LP Locked: ${summary.lpLockedPct}%`);

// Search tokens
const results = await client.search("bonk", 20);
console.log(results);

// Get full report
const report = await client.tokenReport("TokenMintAddress", true);

// Bulk analysis (requires auth)
const bulkResults = await client.bulkSummary({
  tokens: ["mint1", "mint2", "mint3"],
  cacheOnly: false,
});

// Get verified tokens (requires paid API key)
const verified = await client.verifiedTokens(20);
```

### CLI Usage

```bash
# Install globally
npm install -g @etemaro/rugcheck

# Or use via npx
npx @etemaro/rugcheck --help

# Common commands
npx rugcheck summary TokenMintAddress
npx rugcheck search bonk --limit 10
npx rugcheck trending
npx rugcheck verified --limit 20
npx rugcheck lockers TokenMintAddress
```

### With API Key

```bash
# Set via environment variable
export RUGCHECK_API_KEY=your-api-key
npx rugcheck summary TokenMintAddress

# Or pass directly
npx rugcheck --api-key your-api-key summary TokenMintAddress
```

## 📚 API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `undefined` | RugCheck API key for authenticated endpoints |
| `baseUrl` | `string` | `https://api.rugcheck.xyz` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

### Token Analysis

#### `tokenSummary(mint, cacheOnly?, refresh?)`

Get quick risk summary for a token.

```typescript
const summary = await client.tokenSummary("TokenMintAddress");
// Returns: TokenSummary
```

#### `tokenReport(mint, refresh?)`

Get full token risk report.

```typescript
const report = await client.tokenReport("TokenMintAddress", true);
// Returns: Full report object
```

#### `search(query?, limit?, page?, maxScore?)`

Search tokens by name, symbol, or mint address.

```typescript
const results = await client.search("bonk", 20, 0, 0);
// Returns: TokenSearchResult[]
```

#### `insidersGraph(mint)`

Get insider network analysis.

```typescript
const graph = await client.insidersGraph("TokenMintAddress");
// Returns: Network graph data
```

### Bulk Operations

#### `bulkSummary(request)`

Get summaries for multiple tokens (requires auth).

```typescript
const summaries = await client.bulkSummary({
  tokens: ["mint1", "mint2", "mint3"],
  cacheOnly: false,
});
// Returns: TokenSummary[]
```

#### `bulkReport(request)`

Get detailed reports for multiple tokens (requires auth).

```typescript
const reports = await client.bulkReport({
  tokens: ["mint1", "mint2"],
  cacheOnly: false,
});
// Returns: unknown[]
```

### Token Verification

#### `verifiedTokens(limit?, cursor?)`

List RugCheck-verified tokens (requires paid API key).

```typescript
const { tokens, nextCursor } = await client.verifiedTokens(20, "cursor");
// Returns: VerifiedTokensResponse
```

#### `tokenValidation(mint)`

Read token verification state.

```typescript
const validation = await client.tokenValidation("TokenMintAddress");
// Returns: { mint, validated, website, socials }
```

#### `verifyEligible(mint)`

Check if token is eligible for verification.

```typescript
const eligibility = await client.verifyEligible("TokenMintAddress");
// Returns: EligibilityResponse
```

### Statistics

#### `statsTrending()`, `statsRecent()`, `statsNewTokens()`, `statsVerified()`

Get various token statistics.

```typescript
const trending = await client.statsTrending();
const recent = await client.statsRecent();
const newTokens = await client.statsNewTokens();
const verified = await client.statsVerified();
```

### Voting

#### `vote(request)`

Submit vote for a token (requires auth).

```typescript
await client.vote({ mint: "TokenMintAddress", side: true });
// side: true = upvote, false = downvote
// Returns: { up, down, userVoted }
```

#### `votes(mint)`

Get voting statistics.

```typescript
const stats = await client.votes("TokenMintAddress");
// Returns: { up, down, userVoted }
```

### Domains

#### `domains(page?, limit?, verified?)`

Get registered .token domains.

```typescript
const domains = await client.domains(0, 10, true);
// Returns: DomainEntry[]
```

#### `domainLookup(domain)`

Lookup token address for domain.

```typescript
const result = await client.domainLookup("mytoken.token");
// Returns: { mint: string }
```

### Vaults

#### `lockers(mint)`, `fluxLockers(mint)`

Get LP vault information (requires auth).

```typescript
const lockers = await client.lockers("TokenMintAddress");
// Returns: { lockers: Record<string, LockerInfo>, total: { pct, totalUSDC } }
```

### System

#### `ping()`, `maintenance()`, `leaderboard(page?, limit?)`

System endpoints.

```typescript
const pong = await client.ping();
const status = await client.maintenance();
const leaderboard = await client.leaderboard(0, 50);
```

## 🔴 Error Handling

```typescript
import { RugCheckClient, RugCheckErrorClass } from "@etemaro/rugcheck";

const client = new RugCheckClient({ apiKey: process.env.RUGCHECK_API_KEY });

try {
  const summary = await client.tokenSummary("TokenMintAddress");
} catch (error) {
  if (error instanceof RugCheckErrorClass) {
    console.error(`HTTP ${error.status}: ${error.message}`);
    // Handle specific status codes
    if (error.status === 429) {
      // Rate limited - retry with backoff
    }
  } else {
    console.error("Network error:", error);
  }
}
```

## 🧪 Development

### Setup

```bash
# Clone the repository
git clone https://github.com/romankurnovskii/RugCheck-CLI.git
cd rugcheck

# Install dependencies
npm install
```

### Scripts

- `npm run build` - Build for production
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code with Biome
- `npm run lint:fix` - Fix lint issues with Biome
- `npm run start` - Run CLI in development mode

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT © [Etemaro](https://github.com/etemaro)

## 🔗 Links

- [RugCheck Dashboard](https://rugcheck.xyz)
- [RugCheck API Docs](https://api.rugcheck.xyz/swagger/index.html)
- [FluxRPC](https://fluxrpc.com)

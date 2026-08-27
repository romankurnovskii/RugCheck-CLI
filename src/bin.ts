#!/usr/bin/env node
import { Command } from 'commander';
import { RugCheckClient } from './index.js';

const program = new Command();

program
  .name('rugcheck')
  .description('CLI for the RugCheck Token Security API')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'RugCheck API key')
  .option('--base-url <url>', 'Override API base URL')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000');

program
  .command('ping')
  .description('Health check')
  .action(async (options) => {
    const client = new RugCheckClient({
      apiKey: options.parent.apiKey,
      baseUrl: options.parent.baseUrl,
      timeout: Number(options.parent.timeout),
    });
    const result = await client.ping();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('search <query>')
  .description('Search tokens by name, symbol, or mint')
  .option('-l, --limit <n>', 'Max results', '20')
  .option('-p, --page <n>', 'Page number', '0')
  .option('--max-score <n>', 'Max risk score filter', '0')
  .action(async (query, options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.search(
      query,
      Number(options.limit),
      Number(options.page),
      Number(options.maxScore),
    );
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('summary <mint>')
  .description('Get quick token risk summary')
  .option('--refresh', 'Force fresh report (paid only)')
  .action(async (mint, options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.tokenSummary(mint, undefined, options.refresh);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('report <mint>')
  .description('Get full token risk report')
  .option('--refresh', 'Force fresh report (paid only)')
  .action(async (mint, options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.tokenReport(mint, options.refresh);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('verified')
  .description('List RugCheck-verified tokens')
  .option('-l, --limit <n>', 'Results per page', '20')
  .option('-c, --cursor <cursor>', 'Pagination cursor')
  .action(async (options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.verifiedTokens(Number(options.limit), options.cursor);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('trending')
  .description('Most voted tokens in the past 24 hours')
  .action(async () => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.statsTrending();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('recent')
  .description('Most viewed tokens in the past 24 hours')
  .action(async () => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.statsRecent();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('new-tokens')
  .description('Recently detected tokens')
  .action(async () => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.statsNewTokens();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('lockers <mint>')
  .description('Get LP vault information (requires auth)')
  .action(async (mint) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.lockers(mint);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('votes <mint>')
  .description('Get voting statistics for a token')
  .action(async (mint) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.votes(mint);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('vote <mint>')
  .description('Vote for a token')
  .option('--up', 'Upvote (default)')
  .option('--down', 'Downvote')
  .action(async (mint, options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.vote({ mint, side: !options.down });
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('validation <mint>')
  .description('Read token verification state')
  .action(async (mint) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.tokenValidation(mint);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('maintenance')
  .description('Check service status')
  .action(async () => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.maintenance();
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('leaderboard')
  .description('Get user rankings')
  .option('-l, --limit <n>', 'Results per page', '50')
  .option('-p, --page <n>', 'Page number', '0')
  .action(async (options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.leaderboard(Number(options.page), Number(options.limit));
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('domains')
  .description('List registered .token domains')
  .option('-l, --limit <n>', 'Results per page', '10')
  .option('-p, --page <n>', 'Page number', '0')
  .option('--verified-only', 'Only verified domains', true)
  .action(async (options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.domains(
      Number(options.page),
      Number(options.limit),
      options.verifiedOnly,
    );
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('domain-lookup <domain>')
  .description('Lookup token address for domain')
  .action(async (domain) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.domainLookup(domain);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('verify-eligible <mint>')
  .description('Check if token is eligible for verification')
  .action(async (mint) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.verifyEligible(mint);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('insiders <mint>')
  .description('Get insider network graph for token')
  .action(async (mint) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.insidersGraph(mint);
    console.log(JSON.stringify(result, null, 2));
  });

program
  .command('bulk-summary')
  .description('Get summaries for multiple tokens')
  .requiredOption('-t, --tokens <tokens...>', 'Token mint addresses')
  .option('--cache-only', 'Only return cached reports')
  .action(async (options) => {
    const client = new RugCheckClient({
      apiKey: program.opts().apiKey,
      baseUrl: program.opts().baseUrl,
      timeout: Number(program.opts().timeout),
    });
    const result = await client.bulkSummary({
      tokens: options.tokens,
      cacheOnly: options.cacheOnly,
    });
    console.log(JSON.stringify(result, null, 2));
  });

program.parse();

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PING Analytics Dashboard is a Next.js application that displays real-time analytics for the PING token on the Base blockchain. It fetches data from an Envio indexer via GraphQL and displays token statistics, pool information, swap/transfer activity, and holder rankings.

**Stack:** Next.js 16, TypeScript, Tailwind CSS, Recharts, graphql-request
**Package Manager:** pnpm
**Node Version:** 18+

## Common Commands

```bash
# Install dependencies
pnpm install

# Development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

## Architecture

### Data Flow

1. **GraphQL Client** (`src/lib/graphql.ts`): Singleton GraphQL client with exponential backoff retry logic for rate limiting and server errors
2. **Queries** (`src/lib/queries.ts`): All GraphQL queries for tokens, pools, swaps, transfers, accounts, and daily activity
3. **Hooks** (`src/hooks/`): Custom React hooks that fetch data and implement polling with visibility detection
4. **Components**: Page components consume hooks and display data in tabs

### Key Patterns

**Polling Strategy**: All data-fetching hooks (e.g., `useToken`, `useSwaps`, `useTransfers`) implement:
- Configurable poll intervals (typically 10 seconds)
- Visibility detection: polling pauses when tab is hidden, resumes on focus
- Smart merging: new items are prepended to existing lists to maintain live updates
- Initial fetch vs. subsequent polls handled differently to avoid UI jumps

**Live Updates**: The Pulse tab (`src/components/pulse/pulse-tab.tsx`) demonstrates the prepend pattern:
- Initial load fetches the latest N items
- Subsequent polls check for new items by timestamp
- New items are prepended to the front of the list
- Maximum list size is enforced to prevent memory issues

**Error Handling**: `fetchGraphQL` in `src/lib/graphql.ts` retries:
- 5xx errors, 429 rate limits, network errors, timeouts
- Exponential backoff: starts at 1s, caps at 30s
- Max 5 retries before throwing

### Directory Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components organized by feature
│   ├── charts/      # Recharts visualizations
│   ├── pulse/       # Live activity feed
│   ├── shared/      # Header, footer, loading states
│   ├── stats/       # Stats cards and tab content
│   └── ui/          # Radix UI components (shadcn/ui)
├── hooks/           # Custom hooks for data fetching
├── lib/             # Utilities, GraphQL client, queries
└── types/           # TypeScript type definitions
```

### Constants & Configuration

All blockchain constants are centralized in `src/types/index.ts`:
- Chain ID, token addresses, decimals
- Special address labels (e.g., Uniswap V4 Pool Manager)
- GraphQL endpoint: `https://indexer.hyperindex.xyz/1c6c77c/v1/graphql`

**Path alias**: `@/` maps to `src/`

### Utilities (`src/lib/utils.ts`)

- `shortenAddress`: Truncates Ethereum addresses
- `formatTokenAmount`, `formatUSD`, `formatNumber`: Number formatting with K/M suffixes
- `getTimeAgo`: Relative timestamps (e.g., "5m ago")
- `getBlockExplorerUrl`: Base chain explorer URL helpers
- `fetchTokenInfo`: Fetches ERC20 metadata via RPC with caching

### Styling

- Tailwind CSS v4 with custom animations
- Dark mode via `next-themes`
- Responsive design: mobile-first with breakpoints (sm, lg)
- Framer Motion for animations

## Uniswap V3 vs V4 Support

The dashboard supports both Uniswap V3 and V4 pools:

### Key Differences

**V3 Pools:**
- Fixed fee tiers (e.g., 0.05%, 0.3%, 1%)
- Each pool has its own contract address
- Uses `token0`/`token1` nomenclature
- No hooks support

**V4 Pools:**
- Dynamic fees (can vary per swap)
- Singleton PoolManager architecture (all pools managed by one contract)
- Uses `currency0`/`currency1` (supports native ETH)
- Hooks support for custom logic
- Identified by `poolId` (bytes32 hash) instead of address

### Implementation

**Data Layer:**
- V3 queries: `ALL_POOLS_QUERY`, `RECENT_SWAPS_QUERY`
- V4 queries: `ALL_POOLSV4_QUERY`, `RECENT_SWAPSV4_QUERY`
- Hooks: `usePools()` for V3, `usePoolsV4()` for V4, `useSwapsV4()` for V4 swaps

**Display Layer:**
- `UnifiedPool` type normalizes V3/V4 pools for consistent display
- `normalizePoolForDisplay()` utility converts both types to unified format
- `formatFeeTier()` handles different fee structures
- `hasHooks()` checks if V4 pool has custom hooks
- Version badges distinguish V3 (green) from V4 (purple) in UI

**Pools Tab:**
- Fetches both V3 and V4 pools simultaneously
- Combines and sorts by total volume
- Shows version badge, pool ID, fee tier, and hooks (V4 only)
- Details modal supports both versions (daily charts V3 only for now)

### Constants

```typescript
UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"
UNISWAP_V4_POOL_MANAGER = "0x498581fF718922c3f8e6A244956aF099B2652b2b"
```

## Development Notes

**Adding a new data view:**
1. Define GraphQL query in `src/lib/queries.ts`
2. Add TypeScript types to `src/types/index.ts`
3. Create hook in `src/hooks/` with polling logic
4. Build component in appropriate `src/components/` subdirectory
5. Add tab to main page (`src/app/page.tsx`)

**Adding V4 support to a feature:**
1. Create parallel V4 hook (e.g., `usePoolsV4.ts`)
2. Add V4 GraphQL queries with appropriate entity names (`PoolV4`, `SwapV4`)
3. Use `UnifiedPool` or `UnifiedSwap` types for combined display
4. Apply `normalizePoolForDisplay()` to merge both versions
5. Add version indicators in UI (badges, different colors)

**Modifying polling behavior:** Adjust `pollInterval` parameter in hook usage (default 10000ms). Set to `null` to disable polling.

**Block explorer links:** Use `getBlockExplorerTxUrl` or `getBlockExplorerAddressUrl` from `src/lib/utils.ts` for all external links. For V4 pools, use `getPoolExplorerUrl(poolId, 'v4')` which links to the PoolManager contract.

## Related Repositories

Indexer repository: [ping-envio-indexing](https://github.com/kevinslin/ping-envio-indexing)

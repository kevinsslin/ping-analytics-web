// ============ Core Entities ============

export interface Token {
  id: string // chainId_tokenAddress
  chainId: string
  address: string
  symbol: string
  name: string
  decimals: string
  totalSupply: string
  totalTransfers: string
  totalVolume: string
  holderCount: string
}

export interface Account {
  id: string // chainId_accountAddress
  chainId: string
  address: string
  balance: string
  totalSent: string
  totalReceived: string
  transferCount: string
  firstTransferAt: string
  lastTransferAt: string
  lastTransferHash: string
  lastBuyAt?: string | null
  lastBuyHash?: string | null
  lastSellAt?: string | null
  lastSellHash?: string | null
  totalBuys: string
  totalSells: string
  totalBuyVolume: string
  totalSellVolume: string
}

export interface Transfer {
  id: string // chainId_blockNumber_logIndex
  chainId: string
  transactionHash: string
  timestamp: string
  blockNumber: string
  logIndex: string
  from: Account
  to: Account
  value: string
  isPoolRelated: boolean
  poolRelatedType: string // "FROM_POOL", "TO_POOL", or "NONE"
}

export interface Pool {
  id: string // chainId_poolAddress
  chainId: string
  address: string
  token0: string // Token address
  token1: string // Token address
  feeTier: string
  tickSpacing: string
  liquidity: string
  sqrtPriceX96: string
  tick: string
  isActive: boolean
  volumeToken0: string
  volumeToken1: string
  txCount: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
  createdAt: string
  createdAtBlock: string
  lastSwapAt: string
}

export interface Swap {
  id: string // chainId_blockNumber_logIndex
  chainId: string
  transactionHash: string
  timestamp: string
  blockNumber: string
  logIndex: string
  pool: Pool
  sender: string
  recipient: string
  amount0: string // Can be negative in V3
  amount1: string // Can be negative in V3
  sqrtPriceX96: string
  liquidity: string
  tick: string
}

export interface DailyTokenActivity {
  id: string // chainId_date (YYYY-MM-DD)
  chainId: string
  date: string // YYYY-MM-DD format
  timestamp: string // Start of day timestamp
  dailyTransfers: string
  dailyVolume: string
  dailyActiveAccounts: string // Unique addresses
  newAccounts: string // New first-time receivers
}

export interface DailyPoolActivity {
  id: string // chainId_poolAddress_date
  chainId: string
  pool: string // Pool address
  date: string // YYYY-MM-DD format
  timestamp: string // Start of day timestamp
  dailySwaps: string
  dailyVolumeToken0: string
  dailyVolumeToken1: string
  liquidityStart: string // Start of day
  liquidityEnd: string // End of day
  sqrtPriceX96Start: string
  sqrtPriceX96End: string
}

// ============ Constants ============

export const CHAIN_ID = "8453" // Base
export const CHAIN_NAME = "Base"

export const POOL_ADDRESS = "0xBc51DB8aEC659027AE0B0E468C0735418161A780" // PING-USDC
export const TOKEN_ADDRESS = "0xd85c31854c2B0Fb40aaA9E2Fc4Da23C21f829d46" // PING
export const TOKEN_SYMBOL = "PING"
export const TOKEN_NAME = "Ping"

export const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
export const USDC_SYMBOL = "USDC"
export const USDC_DECIMALS = 6

export const PING_DECIMALS = 18

// Max Total Supply (hard-coded since indexer doesn't track it)
export const MAX_TOTAL_SUPPLY = 1000000000 // 1 billion PING

// Special Address Labels
export const SPECIAL_ADDRESSES: Record<string, { label: string; color: string; bgColor: string }> = {
  '0x49850da61c4f0fce27dfc89aefecf87c293f639d': {
    label: 'Uniswap V4: Pool Manager',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  '0x498581ff718922c3f8e6a244956af099b2652b2b': {
    label: 'Uniswap V4: Pool Manager',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  }
}

// ============ UI Types ============

export interface TokenStats {
  totalSupply: string
  holderCount: string
  totalTransfers: string
  totalVolume: string
}

export interface PoolStats {
  liquidity: string
  volumeToken0: string
  volumeToken1: string
  txCount: string
  tvlToken0: string
  tvlToken1: string
}

export interface AccountRanking {
  address: string
  balance: string
  percentage: string
  firstTransferAt: string
  lastTransferAt: string
}

export interface DailyStats {
  date: string
  transfers: string
  volume: string
  activeAccounts: string
  newAccounts: string
}

export interface Tab {
  id: string
  label: string
  href: string
}

// ============ GraphQL Response Types ============

export interface TokenQueryResponse {
  Token: Token[]
}

export interface AccountQueryResponse {
  Account: Account[]
}

export interface TransferQueryResponse {
  Transfer: Transfer[]
}

export interface PoolQueryResponse {
  Pool: Pool[]
}

export interface SwapQueryResponse {
  Swap: Swap[]
}

export interface DailyTokenActivityQueryResponse {
  DailyTokenActivity: DailyTokenActivity[]
}

export interface DailyPoolActivityQueryResponse {
  DailyPoolActivity: DailyPoolActivity[]
}

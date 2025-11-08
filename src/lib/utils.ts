import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  // Defensive checks
  if (!address || typeof address !== 'string') return '0x...'
  if (address.length < 42) return address // Return as-is if too short

  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}

export function formatUSD(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`
  } else {
    return `$${num.toFixed(2)}`
  }
}

export function formatTokenAmount(value: number | string, decimals = 2): string {
  // Handle null/undefined early
  if (value === null || value === undefined) return '0.00'

  const num = typeof value === 'string' ? parseFloat(value) : value

  // Handle NaN and Infinity
  if (!isFinite(num) || isNaN(num)) return '0.00'

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`
  } else {
    return num.toFixed(decimals)
  }
}

export function formatNumber(value: number | string): string {
  // Handle null/undefined early
  if (value === null || value === undefined) return '0'

  const num = typeof value === 'string' ? parseFloat(value) : value

  // Handle NaN and Infinity
  if (!isFinite(num) || isNaN(num)) return '0'

  return new Intl.NumberFormat('en-US').format(num)
}

export function getBlockExplorerUrl(chainId: string = "8453"): string {
  // Base chain explorer
  return "https://basescan.org"
}

export function getBlockExplorerTxUrl(txHash: string, chainId: string = "8453"): string {
  return `${getBlockExplorerUrl(chainId)}/tx/${txHash}`
}

export function getBlockExplorerAddressUrl(address: string, chainId: string = "8453"): string {
  return `${getBlockExplorerUrl(chainId)}/address/${address}`
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

export function formatTimestamp(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const date = new Date(ts * 1000)
  return date.toLocaleString()
}

export function getTimeAgo(timestamp: number | string): string {
  // Defensive checks
  if (timestamp === null || timestamp === undefined) return 'Unknown'

  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp

  // Handle NaN or invalid timestamps
  if (isNaN(ts) || !isFinite(ts)) return 'Unknown'

  const now = Date.now()
  const diff = now - ts * 1000

  // Handle negative diff (timestamp in future)
  if (diff < 0) return 'Just now'

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

// ERC20 Token Info via RPC
const BASE_RPC_URL = 'https://mainnet.base.org'

// Simple in-memory cache for token info
const tokenInfoCache: Record<string, { symbol: string; name: string; decimals: number }> = {}

export async function fetchTokenInfo(address: string): Promise<{ symbol: string; name: string; decimals: number } | null> {
  // Check cache first
  if (tokenInfoCache[address.toLowerCase()]) {
    return tokenInfoCache[address.toLowerCase()]
  }

  try {
    // ERC20 function selectors
    const symbolSelector = '0x95d89b41' // symbol()
    const nameSelector = '0x06fdde03' // name()
    const decimalsSelector = '0x313ce567' // decimals()

    const [symbolResult, nameResult, decimalsResult] = await Promise.all([
      fetch(BASE_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: address, data: symbolSelector }, 'latest'],
          id: 1
        })
      }).then(r => r.json()),
      fetch(BASE_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: address, data: nameSelector }, 'latest'],
          id: 2
        })
      }).then(r => r.json()),
      fetch(BASE_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: address, data: decimalsSelector }, 'latest'],
          id: 3
        })
      }).then(r => r.json())
    ])

    // Decode results (simple ABI decoding for string and uint8)
    const symbol = decodeString(symbolResult.result)
    const name = decodeString(nameResult.result)
    const decimals = parseInt(decimalsResult.result, 16)

    const info = { symbol, name, decimals }
    tokenInfoCache[address.toLowerCase()] = info
    return info
  } catch (error) {
    console.error(`Failed to fetch token info for ${address}:`, error)
    return null
  }
}

// Simple ABI decoding for strings
function decodeString(hex: string): string {
  if (!hex || hex === '0x') return ''
  try {
    // Remove 0x prefix
    const data = hex.slice(2)
    // Skip first 64 chars (offset) and next 64 chars (length)
    const stringData = data.slice(128)
    // Convert hex to string
    let result = ''
    for (let i = 0; i < stringData.length; i += 2) {
      const byte = parseInt(stringData.substr(i, 2), 16)
      if (byte === 0) break
      result += String.fromCharCode(byte)
    }
    return result
  } catch {
    return ''
  }
}

// ============ V4 Utilities ============

import type { Pool, PoolV4, PoolVersion, UnifiedPool, Swap, SwapV4, UnifiedSwap } from '@/types'
import { UNISWAP_V4_POOL_MANAGER } from '@/types'

// Format fee display based on version
export function formatFeeTier(fee: string, version: PoolVersion): string {
  const feeNum = parseFloat(fee)

  if (version === 'v3') {
    // V3 uses basis points: 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
    return `${(feeNum / 10000).toFixed(2)}%`
  } else {
    // V4 uses hundredths of bps: fee is in hundredths of basis points
    // Max is 1,000,000 = 100%
    return `${(feeNum / 10000).toFixed(4)}%`
  }
}

// Check if hooks address is meaningful (not zero address)
export function hasHooks(hooks: string): boolean {
  return hooks !== '0x0000000000000000000000000000000000000000' && hooks !== '0x0'
}

// Normalize pool data for unified display
export function normalizePoolForDisplay(pool: Pool | PoolV4): UnifiedPool {
  if ('address' in pool) {
    // V3 Pool
    return {
      version: 'v3',
      id: pool.id,
      identifier: pool.address,
      asset0Address: pool.token0,
      asset1Address: pool.token1,
      asset0Symbol: pool.token0Symbol || 'UNKNOWN',
      asset1Symbol: pool.token1Symbol || 'UNKNOWN',
      asset0Name: pool.token0Name || 'Unknown',
      asset1Name: pool.token1Name || 'Unknown',
      asset0Decimals: pool.token0Decimals || '18',
      asset1Decimals: pool.token1Decimals || '18',
      fee: pool.feeTier,
      liquidity: pool.liquidity,
      volume0: pool.volumeToken0,
      volume1: pool.volumeToken1,
      tvl0: pool.totalValueLockedToken0,
      tvl1: pool.totalValueLockedToken1,
      txCount: pool.txCount,
      lastSwapAt: pool.lastSwapAt,
      isActive: pool.isActive,
    }
  } else {
    // V4 Pool
    return {
      version: 'v4',
      id: pool.id,
      identifier: pool.poolId,
      asset0Address: pool.currency0,
      asset1Address: pool.currency1,
      asset0Symbol: pool.currency0Symbol || 'UNKNOWN',
      asset1Symbol: pool.currency1Symbol || 'UNKNOWN',
      asset0Name: pool.currency0Name || 'Unknown',
      asset1Name: pool.currency1Name || 'Unknown',
      asset0Decimals: pool.currency0Decimals || '18',
      asset1Decimals: pool.currency1Decimals || '18',
      fee: pool.fee,
      liquidity: pool.liquidity,
      volume0: pool.volumeCurrency0,
      volume1: pool.volumeCurrency1,
      tvl0: pool.totalValueLockedCurrency0,
      tvl1: pool.totalValueLockedCurrency1,
      txCount: pool.txCount,
      lastSwapAt: pool.lastSwapAt,
      hooks: pool.hooks,
      isActive: pool.isActive,
    }
  }
}

// Normalize swap data for unified display
export function normalizeSwapForDisplay(swap: Swap | SwapV4): UnifiedSwap {
  if ('recipient' in swap) {
    // V3 Swap
    return {
      version: 'v3',
      id: swap.id,
      chainId: swap.chainId,
      transactionHash: swap.transactionHash,
      timestamp: swap.timestamp,
      blockNumber: swap.blockNumber,
      poolIdentifier: swap.pool?.address || 'Unknown',
      sender: swap.sender,
      recipient: swap.recipient,
      amount0: swap.amount0,
      amount1: swap.amount1,
    }
  } else {
    // V4 Swap
    return {
      version: 'v4',
      id: swap.id,
      chainId: swap.chainId,
      transactionHash: swap.transactionHash,
      timestamp: swap.timestamp,
      blockNumber: swap.blockNumber,
      poolIdentifier: swap.poolId,
      sender: swap.sender,
      amount0: swap.amount0,
      amount1: swap.amount1,
      swapFee: swap.swapFee,
    }
  }
}

// Get pool explorer URL based on version
export function getPoolExplorerUrl(identifier: string, version: PoolVersion, chainId: string = "8453"): string {
  const baseUrl = getBlockExplorerUrl(chainId)

  if (version === 'v3') {
    // V3 pools have their own contract address
    return `${baseUrl}/address/${identifier}`
  } else {
    // V4 pools are managed by the singleton PoolManager
    return `${baseUrl}/address/${UNISWAP_V4_POOL_MANAGER}`
  }
}

// Shorten poolId (32 bytes) for display
export function shortenPoolId(poolId: string, chars = 6): string {
  if (!poolId || typeof poolId !== 'string') return '0x...'
  if (poolId.length < 66) return poolId // Full 32 bytes = 0x + 64 hex chars

  return `${poolId.substring(0, chars + 2)}...${poolId.substring(66 - chars)}`
}

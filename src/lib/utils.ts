import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
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
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`
  } else {
    return num.toFixed(decimals)
  }
}

export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
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
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp
  const now = Date.now()
  const diff = now - ts * 1000

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

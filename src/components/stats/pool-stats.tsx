'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePools } from '@/hooks/usePools'
import { usePoolsV4 } from '@/hooks/usePoolsV4'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber, getTimeAgo } from '@/lib/utils'
import { TOKEN_SYMBOL, USDC_SYMBOL, TOKEN_ADDRESS, USDC_ADDRESS, Pool, PoolV4 } from '@/types'
import { Droplets, Users, DollarSign, Activity } from 'lucide-react'

// Helper function to get volume for a specific token from a V3 pool
function getTokenVolume(pool: Pool, tokenAddress: string): number {
  if (!pool.token0 || !pool.token1) return 0

  const addr = tokenAddress.toLowerCase()
  if (pool.token0.toLowerCase() === addr) {
    return parseFloat(pool.volumeToken0) || 0
  } else if (pool.token1.toLowerCase() === addr) {
    return parseFloat(pool.volumeToken1) || 0
  }
  return 0
}

// Helper function to get volume for a specific token from a V4 pool
function getTokenVolumeV4(pool: PoolV4, tokenAddress: string): number {
  if (!pool.currency0 || !pool.currency1) return 0

  const addr = tokenAddress.toLowerCase()
  if (pool.currency0.toLowerCase() === addr) {
    return parseFloat(pool.volumeCurrency0) || 0
  } else if (pool.currency1.toLowerCase() === addr) {
    return parseFloat(pool.volumeCurrency1) || 0
  }
  return 0
}

export function PoolStats() {
  const { pools: poolsV3, loading: loadingV3, error: errorV3 } = usePools()
  const { pools: poolsV4, loading: loadingV4, error: errorV4 } = usePoolsV4()

  const loading = loadingV3 || loadingV4
  const error = errorV3 || errorV4

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error || 'Failed to load pool data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Aggregate PING volume across ALL pools containing PING
  const totalPingVolume =
    poolsV3.reduce((sum, pool) => sum + getTokenVolume(pool, TOKEN_ADDRESS), 0) +
    poolsV4.reduce((sum, pool) => sum + getTokenVolumeV4(pool, TOKEN_ADDRESS), 0)

  // Aggregate USDC volume across USDC-paired pools only
  const totalUsdcVolume =
    poolsV3.reduce((sum, pool) => sum + getTokenVolume(pool, USDC_ADDRESS), 0) +
    poolsV4.reduce((sum, pool) => sum + getTokenVolumeV4(pool, USDC_ADDRESS), 0)

  // Aggregate total swaps across all pools
  const totalSwaps =
    poolsV3.reduce((sum, pool) => sum + parseInt(pool.txCount || '0'), 0) +
    poolsV4.reduce((sum, pool) => sum + parseInt(pool.txCount || '0'), 0)

  // Count total active pools
  const totalPools = poolsV3.length + poolsV4.length

  // Find most recent swap across all pools
  const allLastSwaps = [
    ...poolsV3.map(p => parseInt(p.lastSwapAt || '0')),
    ...poolsV4.map(p => parseInt(p.lastSwapAt || '0'))
  ]
  const mostRecentSwap = allLastSwaps.length > 0 ? Math.max(...allLastSwaps) : 0

  const stats = [
    {
      icon: Users,
      label: 'Active Pools',
      value: totalPools.toString(),
      subtext: `${poolsV3.length} V3, ${poolsV4.length} V4`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: DollarSign,
      label: `Volume ${USDC_SYMBOL}`,
      value: formatTokenAmount(totalUsdcVolume, 2),
      subtext: 'All-time (USDC pools)',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: Droplets,
      label: `Volume ${TOKEN_SYMBOL}`,
      value: formatTokenAmount(totalPingVolume, 0),
      subtext: 'All-time (all PING pools)',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Activity,
      label: 'Total Swaps',
      value: formatNumber(totalSwaps.toString()),
      subtext: mostRecentSwap > 0 ? getTimeAgo(mostRecentSwap.toString()) : 'No swaps',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Total Pool Statistics
        </CardTitle>
        <CardDescription>
          Uniswap V3 & V4 Pools • {totalPools} pools tracked ({poolsV3.length} V3, {poolsV4.length} V4) • Last swap {mostRecentSwap > 0 ? getTimeAgo(mostRecentSwap.toString()) : 'never'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

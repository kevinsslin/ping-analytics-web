'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePool } from '@/hooks/usePool'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber } from '@/lib/utils'
import { TOKEN_SYMBOL, USDC_SYMBOL, PING_DECIMALS, USDC_DECIMALS } from '@/types'
import { Droplets, TrendingUp, Activity, Info, DollarSign, Coins } from 'lucide-react'

export function TVLTab() {
  const { pool, loading, error } = usePool()

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }

  if (error || !pool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Value Locked</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error || 'Failed to load TVL data'}</p>
        </CardContent>
      </Card>
    )
  }

  // Note: Envio already converts to decimal format
  const tvlToken0 = parseFloat(pool.totalValueLockedToken0)
  const tvlToken1 = parseFloat(pool.totalValueLockedToken1)
  const volumeToken0 = parseFloat(pool.volumeToken0)
  const volumeToken1 = parseFloat(pool.volumeToken1)

  // Note: TVL fields are not tracked by the indexer, showing volume instead
  const totalVolumeUSD = volumeToken0

  const stats = [
    {
      icon: Droplets,
      label: 'Pool Liquidity',
      value: formatNumber(pool.liquidity),
      subtext: `${TOKEN_SYMBOL}-${USDC_SYMBOL} pool`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      icon: DollarSign,
      label: 'Total Volume',
      value: `$${formatTokenAmount(totalVolumeUSD, 2)}`,
      subtext: `${formatNumber(pool.txCount)} total swaps`,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: Activity,
      label: 'Swap Count',
      value: formatNumber(pool.txCount),
      subtext: 'All-time swaps',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Pool Info */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Pool Information
          </CardTitle>
          <CardDescription>Current pool state and metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">Current Tick</p>
              <p className="text-2xl font-bold font-mono tracking-tight">{formatNumber(pool.tick)}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">Fee Tier</p>
              <p className="text-2xl font-bold tracking-tight">{(parseFloat(pool.feeTier) / 10000).toFixed(2)}%</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Swaps</p>
              <p className="text-2xl font-bold tracking-tight">{formatNumber(pool.txCount)}</p>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Note: TVL tracking is not implemented in the current indexer configuration.
                Showing liquidity and volume metrics instead.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Breakdown */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Volume Breakdown
          </CardTitle>
          <CardDescription>All-time trading volume by token</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{USDC_SYMBOL} Volume</p>
                <p className="text-2xl font-bold font-mono tracking-tight">
                  {formatTokenAmount(volumeToken0, 2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  ≈ ${formatTokenAmount(volumeToken0, 2)} USD
                </p>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Coins className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{TOKEN_SYMBOL} Volume</p>
                <p className="text-2xl font-bold font-mono tracking-tight">
                  {formatTokenAmount(volumeToken1, 2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTokenAmount(volumeToken1, 2)} tokens
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

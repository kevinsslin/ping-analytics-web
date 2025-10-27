'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePool } from '@/hooks/usePool'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, formatTokenAmount, formatNumber, getTimeAgo, getBlockExplorerAddressUrl } from '@/lib/utils'
import { TOKEN_SYMBOL, USDC_SYMBOL, PING_DECIMALS, USDC_DECIMALS, POOL_ADDRESS } from '@/types'
import { ExternalLink, Copy, Droplets, Activity, Hash, Clock, Info, TrendingUp, DollarSign, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function PoolsTab() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { pool, loading, error } = usePool()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (error || !pool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pool Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error || 'Failed to load pool data'}</p>
        </CardContent>
      </Card>
    )
  }

  // Note: Envio already converts to decimal format
  const tvlToken0 = parseFloat(pool.totalValueLockedToken0)
  const tvlToken1 = parseFloat(pool.totalValueLockedToken1)
  const volumeToken0 = parseFloat(pool.volumeToken0)
  const volumeToken1 = parseFloat(pool.volumeToken1)
  const feeTier = parseFloat(pool.feeTier) / 10000 // Convert to percentage

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
      subtext: `Last swap ${getTimeAgo(pool.lastSwapAt)}`,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      icon: Hash,
      label: 'Current Tick',
      value: formatNumber(pool.tick),
      subtext: 'Price tick',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Clock,
      label: 'Created At',
      value: getTimeAgo(pool.createdAt),
      subtext: 'Pool age',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Pool Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Droplets className="h-6 w-6" />
                {TOKEN_SYMBOL}-{USDC_SYMBOL} Pool
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <span className="font-mono text-xs">{shortenAddress(POOL_ADDRESS)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-primary/10"
                  onClick={() => copyToClipboard(POOL_ADDRESS)}
                >
                  <Copy className={`h-3 w-3 ${copiedAddress === POOL_ADDRESS ? 'text-green-500' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-primary/10"
                  asChild
                >
                  <a
                    href={getBlockExplorerAddressUrl(POOL_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </CardDescription>
            </div>
            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-sm text-muted-foreground">Fee Tier</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{feeTier}%</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pool Statistics & TVL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Pool State Details */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Pool State
          </CardTitle>
          <CardDescription>Current pool parameters</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">sqrtPriceX96</p>
              <p className="text-lg font-bold font-mono break-all">
                {pool.sqrtPriceX96.substring(0, 20)}...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Current price parameter
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">Liquidity Units</p>
              <p className="text-lg font-bold font-mono">
                {formatNumber(pool.liquidity)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Available liquidity
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Note: TVL (Total Value Locked) tracking is not implemented in the current indexer.
                The pool has {formatNumber(pool.txCount)} swaps with significant trading volume.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Details */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All-Time Volume
          </CardTitle>
          <CardDescription>Total trading volume by token</CardDescription>
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
                <p className="text-3xl font-bold font-mono tracking-tight">
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
                <p className="text-3xl font-bold font-mono tracking-tight">
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

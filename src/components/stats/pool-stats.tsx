'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePool } from '@/hooks/usePool'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber, getTimeAgo } from '@/lib/utils'
import { TOKEN_SYMBOL, USDC_SYMBOL } from '@/types'
import { Droplets, Percent, DollarSign, Activity } from 'lucide-react'

export function PoolStats() {
  const { pool, loading, error } = usePool()

  if (loading) {
    return <LoadingCard />
  }

  if (error || !pool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error || 'Failed to load pool data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const volumeToken0 = parseFloat(pool.volumeToken0)
  const volumeToken1 = parseFloat(pool.volumeToken1)

  const stats = [
    {
      icon: Percent,
      label: 'Fee Tier',
      value: `${(parseFloat(pool.feeTier) / 10000).toFixed(2)}%`,
      subtext: 'Swap fee',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      icon: DollarSign,
      label: `Volume ${USDC_SYMBOL}`,
      value: formatTokenAmount(volumeToken0, 2),
      subtext: 'All-time',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: Droplets,
      label: `Volume ${TOKEN_SYMBOL}`,
      value: formatTokenAmount(volumeToken1, 0),
      subtext: 'All-time',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Activity,
      label: 'Total Swaps',
      value: formatNumber(pool.txCount),
      subtext: getTimeAgo(pool.lastSwapAt),
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    }
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          {TOKEN_SYMBOL}-{USDC_SYMBOL} Pool
        </CardTitle>
        <CardDescription>
          Uniswap V3 Pool • Last swap {getTimeAgo(pool.lastSwapAt)}
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

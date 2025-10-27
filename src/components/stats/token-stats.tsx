'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToken } from '@/hooks/useToken'
import { LoadingCard } from '@/components/shared/loading'
import { formatNumber, formatTokenAmount } from '@/lib/utils'
import { TOKEN_SYMBOL, MAX_TOTAL_SUPPLY } from '@/types'
import { Coins, Users, ArrowRightLeft, TrendingUp } from 'lucide-react'

export function TokenStats() {
  const { token, loading, error } = useToken()

  if (loading) {
    return <LoadingCard />
  }

  if (error || !token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error || 'Failed to load token data'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalVolume = parseFloat(token.totalVolume)

  const stats = [
    {
      icon: Coins,
      label: 'Max Total Supply',
      value: `1 Billion ${TOKEN_SYMBOL}`,
      subtext: 'Maximum supply',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Users,
      label: 'Holders',
      value: formatNumber(token.holderCount),
      subtext: 'Unique addresses',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: ArrowRightLeft,
      label: 'Total Transfers',
      value: formatNumber(token.totalTransfers),
      subtext: 'All-time',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Total Volume',
      value: `${formatTokenAmount(totalVolume, 2)} ${TOKEN_SYMBOL}`,
      subtext: 'Cumulative',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          {token.symbol} Token Statistics
        </CardTitle>
        <CardDescription>{token.name} on Base Network</CardDescription>
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

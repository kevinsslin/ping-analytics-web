'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDailyTokenActivity } from '@/hooks/useDailyStats'
import { useToken } from '@/hooks/useToken'
import { LoadingCard } from '@/components/shared/loading'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import { TOKEN_SYMBOL } from '@/types'
import { TrendingUp, Users } from 'lucide-react'

type TimeRange = 7 | 30 | 'all'

export function DailyChartsSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const { activities: tokenActivities, loading: tokenLoading } = useDailyTokenActivity(365)
  const { token, loading: tokenStatsLoading } = useToken()

  if (tokenLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }

  // Filter data based on time range
  const getFilteredData = (data: any[]) => {
    if (timeRange === 'all') return data
    return data.slice(0, timeRange)
  }

  const filteredTokenData = getFilteredData(tokenActivities)

  // Format data for charts
  const tokenChartData = filteredTokenData.map(activity => ({
    date: new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    transfers: parseInt(activity.dailyTransfers),
    volume: parseFloat(activity.dailyVolume),
    activeAccounts: parseInt(activity.dailyActiveAccounts),
    newAccounts: parseInt(activity.newAccounts)
  })).reverse() // Reverse to show oldest to newest

  // Get current total holders from token stats
  const currentTotalHolders = token ? parseInt(token.holderCount) : 0

  const totalDays = tokenActivities.length
  const displayedDays = filteredTokenData.length

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>
                Showing {displayedDays} of {totalDays} days available
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 7 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(7)}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(30)}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                Total
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Token Transfer Trends */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Token Transfer Activity
          </CardTitle>
          <CardDescription>Daily transfers and volume over time</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={tokenChartData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="transfers"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Transfers"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                stroke="#ec4899"
                fillOpacity={1}
                fill="url(#colorVolume)"
                name={`Volume (${TOKEN_SYMBOL})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* New Users Trends */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth Analysis
          </CardTitle>
          <CardDescription>
            Daily new accounts (Current total holders: {currentTotalHolders.toLocaleString()})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={tokenChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="newAccounts"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="New Accounts (Daily)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

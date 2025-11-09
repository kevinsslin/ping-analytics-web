'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDailyTokenActivity, useDailyPoolActivity } from '@/hooks/useDailyStats'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber } from '@/lib/utils'
import { TOKEN_SYMBOL } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, TrendingDown, ArrowRightLeft, Activity } from 'lucide-react'

export function DailyStatsTab() {
  const { activities: tokenActivities, loading: tokenLoading } = useDailyTokenActivity(365) // Get all available data
  const { activities: poolActivities, loading: poolLoading } = useDailyPoolActivity(365)

  if (tokenLoading || poolLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Activity Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Daily Token Activity
          </CardTitle>
          <CardDescription>
            {TOKEN_SYMBOL} transfer and account statistics • {tokenActivities.length} days of data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Transfers</th>
                  <th className="text-right p-4 font-medium">Volume</th>
                  <th className="text-right p-4 font-medium">Active Accounts</th>
                  <th className="text-right p-4 font-medium">New Accounts</th>
                </tr>
              </thead>
              <tbody>
                {tokenActivities.map((activity, index) => {
                  const volume = parseFloat(activity.dailyVolume)

                  return (
                    <tr
                      key={activity.id}
                      className={`border-b hover:bg-muted/50 transition-all ${
                        index === 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <td className="p-4 font-medium">{activity.date}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                          {formatNumber(activity.dailyTransfers)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">
                        {formatTokenAmount(volume, 2)} {TOKEN_SYMBOL}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          {formatNumber(activity.dailyActiveAccounts)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
                          <TrendingUp className="h-3 w-3" />
                          +{formatNumber(activity.newAccounts)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pool Activity Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Pool Activity
          </CardTitle>
          <CardDescription>
            {TOKEN_SYMBOL}-USDC pool swap statistics • {poolActivities.length} days of data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Swaps</th>
                  <th className="text-right p-4 font-medium">Volume (USDC)</th>
                  <th className="text-right p-4 font-medium">Volume (PING)</th>
                  <th className="text-right p-4 font-medium">Liquidity Change</th>
                </tr>
              </thead>
              <tbody>
                {poolActivities.map((activity, index) => {
                  // Note: Envio already converts to decimal format
                  const volumeToken0 = parseFloat(activity.dailyVolume0)
                  const volumeToken1 = parseFloat(activity.dailyVolume1)
                  const liquidityStart = parseFloat(activity.liquidityStart)
                  const liquidityEnd = parseFloat(activity.liquidityEnd)
                  const liquidityChange = ((liquidityEnd - liquidityStart) / liquidityStart) * 100
                  const isPositive = liquidityChange >= 0

                  return (
                    <tr
                      key={activity.id}
                      className={`border-b hover:bg-muted/50 transition-all ${
                        index === 0 ? 'bg-secondary/5 border-l-2 border-l-secondary' : ''
                      }`}
                    >
                      <td className="p-4 font-medium">{activity.date}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold">
                          {formatNumber(activity.dailySwaps)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatTokenAmount(volumeToken0, 2)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatTokenAmount(volumeToken1, 2)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPositive
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {isPositive ? '+' : ''}{liquidityChange.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

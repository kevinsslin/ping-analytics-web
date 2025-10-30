'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber, shortenAddress, fetchTokenInfo } from '@/lib/utils'
import { BarChart3, TrendingUp, Droplets, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePoolActivity } from '@/hooks/usePoolActivity'
import { fetchGraphQL } from '@/lib/graphql'
import { POOL_BY_ADDRESS_QUERY } from '@/lib/queries'
import { TOKEN_ADDRESS, USDC_ADDRESS } from '@/types'

interface PoolDetailsModalProps {
  poolAddress: string | null
  onClose: () => void
}

export function PoolDetailsModal({ poolAddress, onClose }: PoolDetailsModalProps) {
  // Fetch pool activity data (must be called before any early returns)
  const { activities, loading, error } = usePoolActivity(poolAddress, 30, null)
  const [tokenSymbols, setTokenSymbols] = useState<{ token0: string; token1: string }>({ token0: 'Token0', token1: 'Token1' })

  // Fetch pool data and resolve token symbols
  useEffect(() => {
    if (!poolAddress) return

    const fetchPoolData = async () => {
      try {
        // Normalize address to lowercase for query
        const normalizedAddress = poolAddress.toLowerCase()
        const data = await fetchGraphQL<{ Pool: Array<{ token0: string; token1: string }> }>(
          POOL_BY_ADDRESS_QUERY,
          { address: normalizedAddress }
        )

        if (data.Pool && data.Pool.length > 0) {
          const pool = data.Pool[0]

          // Resolve token symbols
          const getTokenSymbol = async (address: string) => {
            const addr = address.toLowerCase()
            if (addr === TOKEN_ADDRESS.toLowerCase()) return 'PING'
            if (addr === USDC_ADDRESS.toLowerCase()) return 'USDC'
            const info = await fetchTokenInfo(address)
            return info?.symbol || shortenAddress(address)
          }

          const [token0Symbol, token1Symbol] = await Promise.all([
            getTokenSymbol(pool.token0),
            getTokenSymbol(pool.token1)
          ])

          setTokenSymbols({ token0: token0Symbol, token1: token1Symbol })
        }
      } catch (err) {
        console.error('Error fetching pool data:', err)
      }
    }

    fetchPoolData()
  }, [poolAddress])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (poolAddress) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [poolAddress, onClose])

  if (!poolAddress) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden rounded-lg border bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pool Daily Activity
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed analytics for pool <code className="font-mono text-xs">{shortenAddress(poolAddress)}</code>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
          {loading && <LoadingCard />}

          {error && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No activity data available for this pool</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Daily Swap Count Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Daily Swap Count
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Number of swaps per day (Last 30 days)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Date</th>
                              <th className="text-right p-2 font-medium">Swaps</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities
                              .filter(activity => {
                                if (!activity || !activity.id || !activity.date) return false
                                if (!activity.dailySwaps) return false
                                // Validate dailySwaps is a valid number
                                const swaps = typeof activity.dailySwaps === 'string' ? parseFloat(activity.dailySwaps) : activity.dailySwaps
                                if (isNaN(swaps) || !isFinite(swaps)) return false
                                return true
                              })
                              .map((activity) => (
                              <tr key={activity.id} className="border-b hover:bg-muted/50">
                                <td className="p-2">{activity.date}</td>
                                <td className="p-2 text-right font-mono">{formatNumber(activity.dailySwaps)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Volume Charts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Daily Volume
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Trading volume per day (Token0 and Token1)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Date</th>
                              <th className="text-right p-2 font-medium">{tokenSymbols.token0} Volume</th>
                              <th className="text-right p-2 font-medium">{tokenSymbols.token1} Volume</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities
                              .filter(activity => {
                                if (!activity || !activity.id || !activity.date) return false
                                if (!activity.dailyVolumeToken0 || !activity.dailyVolumeToken1) return false
                                // Validate volumes are valid numbers
                                const vol0 = typeof activity.dailyVolumeToken0 === 'string' ? parseFloat(activity.dailyVolumeToken0) : activity.dailyVolumeToken0
                                const vol1 = typeof activity.dailyVolumeToken1 === 'string' ? parseFloat(activity.dailyVolumeToken1) : activity.dailyVolumeToken1
                                if (isNaN(vol0) || !isFinite(vol0)) return false
                                if (isNaN(vol1) || !isFinite(vol1)) return false
                                return true
                              })
                              .map((activity) => (
                              <tr key={activity.id} className="border-b hover:bg-muted/50">
                                <td className="p-2">{activity.date}</td>
                                <td className="p-2 text-right font-mono">${formatTokenAmount(activity.dailyVolumeToken0, 2)}</td>
                                <td className="p-2 text-right font-mono">{formatTokenAmount(activity.dailyVolumeToken1, 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Liquidity Changes Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Liquidity Changes
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Pool liquidity at start and end of each day
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium">Date</th>
                              <th className="text-right p-2 font-medium">Start Liquidity</th>
                              <th className="text-right p-2 font-medium">End Liquidity</th>
                              <th className="text-right p-2 font-medium">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities
                              .filter(activity => {
                                if (!activity || !activity.id || !activity.date) return false
                                if (!activity.liquidityStart || !activity.liquidityEnd) return false
                                // Validate liquidity values are valid numbers
                                const startLiq = typeof activity.liquidityStart === 'string' ? parseFloat(activity.liquidityStart) : activity.liquidityStart
                                const endLiq = typeof activity.liquidityEnd === 'string' ? parseFloat(activity.liquidityEnd) : activity.liquidityEnd
                                if (isNaN(startLiq) || !isFinite(startLiq)) return false
                                if (isNaN(endLiq) || !isFinite(endLiq)) return false
                                return true
                              })
                              .map((activity) => {
                              const startLiq = parseFloat(activity.liquidityStart)
                              const endLiq = parseFloat(activity.liquidityEnd)
                              const change = endLiq - startLiq
                              const changePercent = startLiq > 0 ? ((change / startLiq) * 100) : 0
                              const isPositive = change >= 0

                              return (
                                <tr key={activity.id} className="border-b hover:bg-muted/50">
                                  <td className="p-2">{activity.date}</td>
                                  <td className="p-2 text-right font-mono">{formatNumber(activity.liquidityStart)}</td>
                                  <td className="p-2 text-right font-mono">{formatNumber(activity.liquidityEnd)}</td>
                                  <td className={`p-2 text-right font-mono ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

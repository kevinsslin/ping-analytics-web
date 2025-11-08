'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber, shortenAddress, shortenPoolId, formatFeeTier, hasHooks, getPoolExplorerUrl } from '@/lib/utils'
import { BarChart3, TrendingUp, Droplets, X, ExternalLink } from 'lucide-react'
import { useEffect } from 'react'
import { usePoolActivity } from '@/hooks/usePoolActivity'
import { usePoolActivityV4 } from '@/hooks/usePoolActivityV4'
import { UnifiedPool } from '@/types'

interface PoolDetailsModalProps {
  pool: UnifiedPool | null
  onClose: () => void
}

export function PoolDetailsModal({ pool, onClose }: PoolDetailsModalProps) {
  // For V3 pools, use address; for V4 pools, use poolId
  const v3Identifier = pool?.version === 'v3' ? pool.identifier : null
  const v4Identifier = pool?.version === 'v4' ? pool.identifier : null

  // Fetch pool activity data (must be called before any early returns)
  const { activities: v3Activities, loading: v3Loading, error: v3Error } = usePoolActivity(v3Identifier, 30, null)
  const { activities: v4Activities, loading: v4Loading, error: v4Error } = usePoolActivityV4(v4Identifier, 30, null)

  // Use appropriate data based on pool version
  const activities = pool?.version === 'v3' ? v3Activities : v4Activities
  const loading = pool?.version === 'v3' ? v3Loading : v4Loading
  const error = pool?.version === 'v3' ? v3Error : v4Error

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (pool) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [pool, onClose])

  if (!pool) return null

  const displayIdentifier = pool.version === 'v3'
    ? shortenAddress(pool.identifier)
    : shortenPoolId(pool.identifier)

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
              Pool Details
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ml-2 ${
                pool.version === 'v3'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              }`}>
                {pool.version.toUpperCase()}
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <code className="font-mono text-xs text-muted-foreground">{displayIdentifier}</code>
              <a
                href={getPoolExplorerUrl(pool.identifier, pool.version)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
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
          {/* Pool Summary */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Pool Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Token Pair</p>
                  <p className="font-semibold">{pool.asset0Symbol} / {pool.asset1Symbol}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Fee Tier</p>
                  <p className="font-semibold">{formatFeeTier(pool.fee, pool.version)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Liquidity</p>
                  <p className="font-mono">{formatNumber(pool.liquidity)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total Swaps</p>
                  <p className="font-mono">{formatNumber(pool.txCount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Volume {pool.asset0Symbol}</p>
                  <p className="font-mono">{formatTokenAmount(pool.volume0, 2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Volume {pool.asset1Symbol}</p>
                  <p className="font-mono">{formatTokenAmount(pool.volume1, 2)}</p>
                </div>
                {pool.hooks && hasHooks(pool.hooks) && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-muted-foreground text-xs mb-1">Hooks Contract</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{pool.hooks}</code>
                      <a
                        href={getPoolExplorerUrl(pool.hooks, 'v3')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Activity Charts (Both V3 and V4) */}
          {(pool.version === 'v3' || pool.version === 'v4') && (
            <>
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
                            Trading volume per day ({pool.asset0Symbol} and {pool.asset1Symbol})
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm">
                                <tr className="border-b">
                                  <th className="text-left p-2 font-medium">Date</th>
                                  <th className="text-right p-2 font-medium">{pool.asset0Symbol} Volume</th>
                                  <th className="text-right p-2 font-medium">{pool.asset1Symbol} Volume</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activities
                                  .filter(activity => {
                                    if (!activity || !activity.id || !activity.date) return false
                                    // Handle both V3 and V4 field names
                                    const vol0Field = 'dailyVolumeToken0' in activity ? activity.dailyVolumeToken0 : ('dailyVolumeCurrency0' in activity ? (activity as any).dailyVolumeCurrency0 : null)
                                    const vol1Field = 'dailyVolumeToken1' in activity ? activity.dailyVolumeToken1 : ('dailyVolumeCurrency1' in activity ? (activity as any).dailyVolumeCurrency1 : null)
                                    if (!vol0Field || !vol1Field) return false
                                    const vol0 = typeof vol0Field === 'string' ? parseFloat(vol0Field) : vol0Field
                                    const vol1 = typeof vol1Field === 'string' ? parseFloat(vol1Field) : vol1Field
                                    if (isNaN(vol0) || !isFinite(vol0)) return false
                                    if (isNaN(vol1) || !isFinite(vol1)) return false
                                    return true
                                  })
                                  .map((activity) => {
                                    // Get volume fields based on activity type
                                    const vol0 = 'dailyVolumeToken0' in activity ? activity.dailyVolumeToken0 : (activity as any).dailyVolumeCurrency0
                                    const vol1 = 'dailyVolumeToken1' in activity ? activity.dailyVolumeToken1 : (activity as any).dailyVolumeCurrency1
                                    return (
                                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2">{activity.date}</td>
                                        <td className="p-2 text-right font-mono">{formatTokenAmount(vol0, 2)}</td>
                                        <td className="p-2 text-right font-mono">{formatTokenAmount(vol1, 2)}</td>
                                      </tr>
                                    )
                                  })}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

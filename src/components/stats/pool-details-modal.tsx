'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingCard } from '@/components/shared/loading'
import { formatTokenAmount, formatNumber, shortenAddress } from '@/lib/utils'
import { BarChart3, TrendingUp, Droplets, X } from 'lucide-react'
import { useEffect } from 'react'

interface PoolDetailsModalProps {
  poolAddress: string | null
  onClose: () => void
}

export function PoolDetailsModal({ poolAddress, onClose }: PoolDetailsModalProps) {
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

  // TODO: Use usePoolActivity hook to fetch daily activity data
  const loading = false
  const error = null

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
              {/* Daily Swap Count Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Daily Swap Count
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Number of swaps per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Chart coming soon (dailySwaps)
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
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Chart coming soon (dailyVolumeToken0, dailyVolumeToken1)
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
                    Pool liquidity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Chart coming soon (liquidityStart, liquidityEnd)
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

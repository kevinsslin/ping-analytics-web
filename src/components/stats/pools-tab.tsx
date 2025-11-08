'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePools } from '@/hooks/usePools'
import { usePoolsV4 } from '@/hooks/usePoolsV4'
import { LoadingCard } from '@/components/shared/loading'
import {
  shortenAddress,
  formatTokenAmount,
  formatNumber,
  getTimeAgo,
  getBlockExplorerAddressUrl,
  fetchTokenInfo,
  normalizePoolForDisplay,
  formatFeeTier,
  hasHooks,
  shortenPoolId,
  getPoolExplorerUrl
} from '@/lib/utils'
import { TOKEN_ADDRESS, USDC_ADDRESS, UnifiedPool } from '@/types'
import { ExternalLink, Droplets, Activity, Clock, BarChart3 } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { PoolDetailsModal } from './pool-details-modal'

export function PoolsTab() {
  const { pools: poolsV3, loading: loadingV3, error: errorV3 } = usePools()
  const { pools: poolsV4, loading: loadingV4, error: errorV4 } = usePoolsV4()
  const [tokenNames, setTokenNames] = useState<Record<string, string>>({})
  const [fetchingTokens, setFetchingTokens] = useState(false)
  const [selectedPool, setSelectedPool] = useState<UnifiedPool | null>(null)

  // Combine and normalize pools
  const allPools = useMemo(() => {
    const normalized: UnifiedPool[] = [
      ...poolsV3.map(normalizePoolForDisplay),
      ...poolsV4.map(normalizePoolForDisplay)
    ]

    // Sort by combined volume (volume0 + volume1 as proxy for total activity)
    return normalized.sort((a, b) => {
      const totalA = parseFloat(a.volume0) + parseFloat(a.volume1)
      const totalB = parseFloat(b.volume0) + parseFloat(b.volume1)
      return totalB - totalA
    })
  }, [poolsV3, poolsV4])

  const loading = loadingV3 || loadingV4
  const error = errorV3 || errorV4

  // Fetch token names for unknown tokens
  useEffect(() => {
    if (allPools.length === 0 || fetchingTokens) return

    const unknownTokens = new Set<string>()
    allPools.forEach(pool => {
      const addr0 = pool.asset0Address.toLowerCase()
      const addr1 = pool.asset1Address.toLowerCase()

      if (addr0 !== TOKEN_ADDRESS.toLowerCase() && addr0 !== USDC_ADDRESS.toLowerCase()) {
        unknownTokens.add(pool.asset0Address)
      }
      if (addr1 !== TOKEN_ADDRESS.toLowerCase() && addr1 !== USDC_ADDRESS.toLowerCase()) {
        unknownTokens.add(pool.asset1Address)
      }
    })

    if (unknownTokens.size > 0) {
      setFetchingTokens(true)
      Promise.all(
        Array.from(unknownTokens).map(async (address) => {
          const info = await fetchTokenInfo(address)
          return [address.toLowerCase(), info?.symbol || shortenAddress(address)]
        })
      ).then((results) => {
        const names: Record<string, string> = {}
        results.forEach(([address, symbol]) => {
          names[address as string] = symbol as string
        })
        setTokenNames(names)
        setFetchingTokens(false)
      })
    }
  }, [allPools, fetchingTokens])

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const getTokenSymbol = (address: string) => {
    const addr = address.toLowerCase()
    if (addr === TOKEN_ADDRESS.toLowerCase()) return 'PING'
    if (addr === USDC_ADDRESS.toLowerCase()) return 'USDC'
    return tokenNames[addr] || shortenAddress(address)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Active Pools
          </CardTitle>
          <CardDescription>
            All pools with active liquidity • {allPools.length} pool{allPools.length !== 1 ? 's' : ''} found ({poolsV3.length} V3, {poolsV4.length} V4) • Sorted by volume ↓
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-xs">Version</th>
                  <th className="text-left p-3 font-medium text-xs">Pool ID</th>
                  <th className="text-left p-3 font-medium text-xs">Token Pair</th>
                  <th className="text-right p-3 font-medium text-xs">Fee</th>
                  <th className="text-right p-3 font-medium text-xs">Liquidity</th>
                  <th className="text-right p-3 font-medium text-xs">Volume Token0</th>
                  <th className="text-right p-3 font-medium text-xs">Volume Token1</th>
                  <th className="text-right p-3 font-medium text-xs">Swaps</th>
                  <th className="text-left p-3 font-medium text-xs">Hooks</th>
                  <th className="text-left p-3 font-medium text-xs">Last Swap</th>
                  <th className="text-left p-3 font-medium text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPools.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-muted-foreground">
                      No active pools found
                    </td>
                  </tr>
                ) : (
                  allPools.map((pool) => {
                    const token0Symbol = getTokenSymbol(pool.asset0Address)
                    const token1Symbol = getTokenSymbol(pool.asset1Address)

                    // Format identifier based on version
                    const displayIdentifier = pool.version === 'v3'
                      ? shortenAddress(pool.identifier, 3)
                      : shortenPoolId(pool.identifier, 4)

                    return (
                      <tr key={pool.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            pool.version === 'v3'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}>
                            {pool.version.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-xs text-muted-foreground">
                              {displayIdentifier}
                            </code>
                            <a
                              href={getPoolExplorerUrl(pool.identifier, pool.version)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-xs">{token0Symbol}</span>
                            <span className="text-muted-foreground text-xs">/</span>
                            <span className="font-semibold text-xs">{token1Symbol}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                            {formatFeeTier(pool.fee, pool.version)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {formatNumber(pool.liquidity)}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {parseFloat(pool.volume0) === 0 ? (
                            <span className="text-muted-foreground/50 text-xs">No trades</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span>{formatTokenAmount(pool.volume0, 1)}</span>
                              <span className="text-[10px] text-muted-foreground">({token0Symbol})</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {parseFloat(pool.volume1) === 0 ? (
                            <span className="text-muted-foreground/50 text-xs">No trades</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span>{formatTokenAmount(pool.volume1, 0)}</span>
                              <span className="text-[10px] text-muted-foreground">({token1Symbol})</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {formatNumber(pool.txCount)}
                        </td>
                        <td className="p-3 text-xs">
                          {pool.hooks && hasHooks(pool.hooks) ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                Custom
                              </span>
                              <code className="font-mono text-[10px] text-muted-foreground">
                                {shortenAddress(pool.hooks, 2)}
                              </code>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {getTimeAgo(pool.lastSwapAt)}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPool(pool)}
                            className="h-7 text-xs flex items-center gap-1.5"
                          >
                            <BarChart3 className="h-3 w-3" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                <span><strong>V3:</strong> Uniswap V3 pools with fixed fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span><strong>V4:</strong> Uniswap V4 pools with dynamic fees and hooks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PoolDetailsModal
        pool={selectedPool}
        onClose={() => setSelectedPool(null)}
      />
    </>
  )
}

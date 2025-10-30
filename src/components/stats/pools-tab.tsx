'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePools } from '@/hooks/usePools'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, formatTokenAmount, formatNumber, getTimeAgo, getBlockExplorerAddressUrl, fetchTokenInfo } from '@/lib/utils'
import { TOKEN_ADDRESS, USDC_ADDRESS } from '@/types'
import { ExternalLink, Droplets, Activity, Clock, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PoolDetailsModal } from './pool-details-modal'

export function PoolsTab() {
  const { pools, loading, error } = usePools()
  const [tokenNames, setTokenNames] = useState<Record<string, string>>({})
  const [fetchingTokens, setFetchingTokens] = useState(false)
  const [selectedPoolAddress, setSelectedPoolAddress] = useState<string | null>(null)

  // Fetch token names for unknown tokens
  useEffect(() => {
    if (pools.length === 0 || fetchingTokens) return

    const unknownTokens = new Set<string>()
    pools.forEach(pool => {
      // Defensive check - skip pools with missing token data
      if (!pool.token0 || !pool.token1) return

      const addr0 = pool.token0.toLowerCase()
      const addr1 = pool.token1.toLowerCase()

      if (addr0 !== TOKEN_ADDRESS.toLowerCase() && addr0 !== USDC_ADDRESS.toLowerCase()) {
        unknownTokens.add(pool.token0)
      }
      if (addr1 !== TOKEN_ADDRESS.toLowerCase() && addr1 !== USDC_ADDRESS.toLowerCase()) {
        unknownTokens.add(pool.token1)
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
  }, [pools, fetchingTokens])

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
          All pools with active liquidity • {pools.length} pool{pools.length !== 1 ? 's' : ''} found • Sorted by PING volume ↓
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-xs">Pool</th>
                <th className="text-left p-3 font-medium text-xs">Token Pair</th>
                <th className="text-right p-3 font-medium text-xs">Fee</th>
                <th className="text-right p-3 font-medium text-xs">Liquidity</th>
                <th className="text-right p-3 font-medium text-xs">Volume Token0</th>
                <th className="text-right p-3 font-medium text-xs">Volume Token1</th>
                <th className="text-right p-3 font-medium text-xs">Avg Swap</th>
                <th className="text-right p-3 font-medium text-xs">Swaps</th>
                <th className="text-left p-3 font-medium text-xs">Age</th>
                <th className="text-left p-3 font-medium text-xs">Last Swap</th>
                <th className="text-left p-3 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pools.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    No active pools found
                  </td>
                </tr>
              ) : (
                pools.map((pool) => {
                  const feeTier = (parseFloat(pool.feeTier) / 10000).toFixed(2)
                  const token0Symbol = getTokenSymbol(pool.token0)
                  const token1Symbol = getTokenSymbol(pool.token1)

                  // Calculate analytical metrics
                  const liquidity = parseFloat(pool.liquidity)
                  const volumeToken0 = parseFloat(pool.volumeToken0)
                  const volumeToken1 = parseFloat(pool.volumeToken1)
                  const swapCount = parseFloat(pool.txCount)

                  // Average swap size
                  const avgSwapSize = swapCount > 0 ? (volumeToken0 / swapCount) : 0

                  // Pool age
                  const now = Math.floor(Date.now() / 1000)
                  const createdAt = parseInt(pool.createdAt)
                  const ageInDays = Math.floor((now - createdAt) / 86400)

                  return (
                    <tr key={pool.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono text-xs text-muted-foreground">
                            {shortenAddress(pool.address, 3)}
                          </code>
                          <a
                            href={getBlockExplorerAddressUrl(pool.address)}
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
                          {feeTier}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {formatNumber(pool.liquidity)}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {volumeToken0 === 0 ? (
                          <span className="text-muted-foreground/50 text-xs">No trades</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span>${formatTokenAmount(volumeToken0, 1)}</span>
                            <span className="text-[10px] text-muted-foreground">({token0Symbol})</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {volumeToken1 === 0 ? (
                          <span className="text-muted-foreground/50 text-xs">No trades</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span>{formatTokenAmount(volumeToken1, 0)}</span>
                            <span className="text-[10px] text-muted-foreground">({token1Symbol})</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-xs text-muted-foreground">
                        ${formatTokenAmount(avgSwapSize, 2)}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {formatNumber(pool.txCount)}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {ageInDays}d
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {getTimeAgo(pool.lastSwapAt)}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPoolAddress(pool.address)}
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
              <span><strong>Avg Swap:</strong> Average transaction size</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span><strong>Age:</strong> Days since pool creation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <PoolDetailsModal
      poolAddress={selectedPoolAddress}
      onClose={() => setSelectedPoolAddress(null)}
    />
  </>
  )
}

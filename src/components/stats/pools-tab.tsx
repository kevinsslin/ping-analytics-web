'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePools } from '@/hooks/usePools'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, formatTokenAmount, formatNumber, getTimeAgo, getBlockExplorerAddressUrl, fetchTokenInfo } from '@/lib/utils'
import { TOKEN_ADDRESS, USDC_ADDRESS } from '@/types'
import { ExternalLink, Droplets, TrendingUp, Activity, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export function PoolsTab() {
  const { pools, loading, error } = usePools()
  const [tokenNames, setTokenNames] = useState<Record<string, string>>({})
  const [fetchingTokens, setFetchingTokens] = useState(false)

  // Fetch token names for unknown tokens
  useEffect(() => {
    if (pools.length === 0 || fetchingTokens) return

    const unknownTokens = new Set<string>()
    pools.forEach(pool => {
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Active Pools
        </CardTitle>
        <CardDescription>
          All pools with active liquidity • {pools.length} pool{pools.length !== 1 ? 's' : ''} found
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
                <th className="text-right p-3 font-medium text-xs">Volume (0)</th>
                <th className="text-right p-3 font-medium text-xs">Volume (1)</th>
                <th className="text-right p-3 font-medium text-xs">Vol/Liq Ratio</th>
                <th className="text-right p-3 font-medium text-xs">Avg Swap</th>
                <th className="text-right p-3 font-medium text-xs">Swaps</th>
                <th className="text-left p-3 font-medium text-xs">Age</th>
                <th className="text-left p-3 font-medium text-xs">Last Swap</th>
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

                  // Volume/Liquidity ratio - indicates trading activity
                  const volLiqRatio = liquidity > 0 ? (volumeToken0 / liquidity).toFixed(2) : '0'

                  // Average swap size
                  const avgSwapSize = swapCount > 0 ? (volumeToken0 / swapCount) : 0

                  // Pool age
                  const now = Math.floor(Date.now() / 1000)
                  const createdAt = parseInt(pool.createdAt)
                  const ageInDays = Math.floor((now - createdAt) / 86400)

                  // Color coding for vol/liq ratio
                  let ratioColor = 'text-muted-foreground'
                  const ratio = parseFloat(volLiqRatio)
                  if (ratio > 10) ratioColor = 'text-green-600 dark:text-green-400' // High activity
                  else if (ratio > 5) ratioColor = 'text-blue-600 dark:text-blue-400' // Medium activity
                  else if (ratio > 1) ratioColor = 'text-yellow-600 dark:text-yellow-400' // Low activity
                  else ratioColor = 'text-red-600 dark:text-red-400' // Very low activity

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
                        ${formatTokenAmount(volumeToken0, 1)}
                      </td>
                      <td className="p-3 text-right font-mono text-xs">
                        {formatTokenAmount(volumeToken1, 0)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-mono text-xs font-semibold ${ratioColor}`}>
                          {volLiqRatio}x
                        </span>
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
              <TrendingUp className="h-3.5 w-3.5" />
              <span><strong>Vol/Liq Ratio:</strong> Trading activity indicator</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              <span><strong>Avg Swap:</strong> Average transaction size</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span><strong>Age:</strong> Days since pool creation</span>
            </div>
          </div>
          <div className="mt-2 text-xs">
            <span className="font-semibold">Color Legend:</span>{' '}
            <span className="text-green-600 dark:text-green-400">High activity (&gt;10x)</span> •{' '}
            <span className="text-blue-600 dark:text-blue-400">Medium (5-10x)</span> •{' '}
            <span className="text-yellow-600 dark:text-yellow-400">Low (1-5x)</span> •{' '}
            <span className="text-red-600 dark:text-red-400">Very low (&lt;1x)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

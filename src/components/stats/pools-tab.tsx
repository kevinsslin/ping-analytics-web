'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePools } from '@/hooks/usePools'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, formatTokenAmount, formatNumber, getTimeAgo, getBlockExplorerAddressUrl } from '@/lib/utils'
import { TOKEN_ADDRESS, USDC_ADDRESS } from '@/types'
import { ExternalLink, Droplets } from 'lucide-react'

export function PoolsTab() {
  const { pools, loading, error } = usePools()

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
    return shortenAddress(address)
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
                <th className="text-left p-4 font-medium">Pool Address</th>
                <th className="text-left p-4 font-medium">Token Pair</th>
                <th className="text-right p-4 font-medium">Fee Tier</th>
                <th className="text-right p-4 font-medium">Liquidity</th>
                <th className="text-right p-4 font-medium">Volume USDC</th>
                <th className="text-right p-4 font-medium">Volume PING</th>
                <th className="text-right p-4 font-medium">Total Swaps</th>
                <th className="text-left p-4 font-medium">Last Swap</th>
              </tr>
            </thead>
            <tbody>
              {pools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No active pools found
                  </td>
                </tr>
              ) : (
                pools.map((pool) => {
                  const feeTier = (parseFloat(pool.feeTier) / 10000).toFixed(2)
                  const token0Symbol = getTokenSymbol(pool.token0)
                  const token1Symbol = getTokenSymbol(pool.token1)

                  return (
                    <tr key={pool.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-muted-foreground">
                            {shortenAddress(pool.address)}
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
                      <td className="p-4">
                        <span className="font-medium">{token0Symbol}/{token1Symbol}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                          {feeTier}%
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatNumber(pool.liquidity)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        ${formatTokenAmount(pool.volumeToken0, 2)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatTokenAmount(pool.volumeToken1, 0)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm">
                        {formatNumber(pool.txCount)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {getTimeAgo(pool.lastSwapAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

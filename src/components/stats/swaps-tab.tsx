'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSwaps } from '@/hooks/useSwaps'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, getTimeAgo, getBlockExplorerTxUrl } from '@/lib/utils'
import { TOKEN_SYMBOL, USDC_SYMBOL, PING_DECIMALS, USDC_DECIMALS, TOKEN_ADDRESS } from '@/types'
import { ExternalLink, Copy, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function SwapsTab() {
  const { swaps, loading, error } = useSwaps(50)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Swaps
          </CardTitle>
          <CardDescription>
            Latest {swaps.length} swaps on {TOKEN_SYMBOL}-{USDC_SYMBOL} pool
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-right p-4 font-medium">{USDC_SYMBOL}</th>
                  <th className="text-right p-4 font-medium">{TOKEN_SYMBOL}</th>
                  <th className="text-left p-4 font-medium">Transaction</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map((swap, index) => {
                  // Note: Envio already converts to decimal format
                  const amount0 = parseFloat(swap.amount0)
                  const amount1 = parseFloat(swap.amount1)

                  // Determine swap direction - works for any pool with PING
                  // Positive amount = tokens flowing TO user (user receives)
                  // Negative amount = tokens flowing FROM user (user sends)
                  const isPingToken0 = swap.pool?.token0?.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
                  const isPingToken1 = swap.pool?.token1?.toLowerCase() === TOKEN_ADDRESS.toLowerCase()

                  let isBuy = false
                  if (isPingToken0) {
                    isBuy = amount0 > 0  // Positive PING amount = receiving PING = Buy
                  } else if (isPingToken1) {
                    isBuy = amount1 > 0  // Positive PING amount = receiving PING = Buy
                  }

                  return (
                    <tr
                      key={swap.id}
                      className={`group border-b hover:bg-muted/50 transition-all ${
                        index === 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <td className="p-4">
                        {isBuy ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 w-fit">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Buy</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 w-fit">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Sell</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {getTimeAgo(swap.timestamp)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium">{Math.abs(amount0).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">{USDC_SYMBOL}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium">{Math.abs(amount1).toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">{TOKEN_SYMBOL}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {shortenAddress(swap.transactionHash)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-primary/10"
                            onClick={() => copyToClipboard(swap.transactionHash)}
                          >
                            <Copy className={`h-3.5 w-3.5 ${copiedHash === swap.transactionHash ? 'text-green-500' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-primary/10"
                            asChild
                          >
                            <a
                              href={getBlockExplorerTxUrl(swap.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
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

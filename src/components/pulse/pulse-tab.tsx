'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSwaps } from '@/hooks/useSwaps'
import { useTransfers } from '@/hooks/useTransfers'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, getTimeAgo, formatTokenAmount, getBlockExplorerTxUrl, getBlockExplorerAddressUrl } from '@/lib/utils'
import { TOKEN_SYMBOL } from '@/types'
import { ExternalLink, Copy, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'

export function PulseTab() {
  const DISPLAY_LIMIT = 15 // Show 15 items instead of 3
  const { swaps, loading: swapsLoading } = useSwaps(25, 2000)
  const { transfers, loading: transfersLoading } = useTransfers(25, null, 2000)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [newSwapIds, setNewSwapIds] = useState<Set<string>>(new Set()) // Track new item IDs
  const [newTransferIds, setNewTransferIds] = useState<Set<string>>(new Set())
  const prevSwapsRef = useRef<string[]>([])
  const prevTransfersRef = useRef<string[]>([])

  // Track new swaps with TRUE staggered animation (one-by-one)
  useEffect(() => {
    if (swaps.length > 0 && !swapsLoading) {
      const currentIds = swaps.map(s => s.id)
      const newIds = currentIds.filter(id => !prevSwapsRef.current.includes(id))

      if (newIds.length > 0 && prevSwapsRef.current.length > 0) {
        // Add each new item with a staggered delay (100ms apart)
        newIds.forEach((id, index) => {
          setTimeout(() => {
            setNewSwapIds(prev => new Set(prev).add(id))

            // Remove highlight after 3 seconds for this specific item
            setTimeout(() => {
              setNewSwapIds(prev => {
                const updated = new Set(prev)
                updated.delete(id)
                return updated
              })
            }, 3000)
          }, index * 100) // Each item appears 100ms after the previous one
        })
      }

      prevSwapsRef.current = currentIds
    }
  }, [swaps, swapsLoading])

  // Track new transfers with TRUE staggered animation (one-by-one)
  useEffect(() => {
    if (transfers.length > 0 && !transfersLoading) {
      const currentIds = transfers.map(t => t.id)
      const newIds = currentIds.filter(id => !prevTransfersRef.current.includes(id))

      if (newIds.length > 0 && prevTransfersRef.current.length > 0) {
        // Add each new item with a staggered delay (100ms apart)
        newIds.forEach((id, index) => {
          setTimeout(() => {
            setNewTransferIds(prev => new Set(prev).add(id))

            // Remove highlight after 3 seconds for this specific item
            setTimeout(() => {
              setNewTransferIds(prev => {
                const updated = new Set(prev)
                updated.delete(id)
                return updated
              })
            }, 3000)
          }, index * 100) // Each item appears 100ms after the previous one
        })
      }

      prevTransfersRef.current = currentIds
    }
  }, [transfers, transfersLoading])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Swaps Stream */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
              <CardTitle className="text-base sm:text-lg">Live Swaps</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {swaps.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Real-time swap activity • Updates every 2s
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {swapsLoading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 sm:h-20 bg-muted/50 animate-pulse border-b"></div>
              ))}
            </div>
          ) : (
            <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {swaps.slice(0, DISPLAY_LIMIT).map((swap, index) => {
                const amount1 = parseFloat(swap.amount1)
                const amount0 = parseFloat(swap.amount0)
                const isBuy = amount1 < 0

                const isNew = newSwapIds.has(swap.id)

                return (
                  <div
                    key={swap.id}
                    className={`group relative p-3 sm:p-4 border-b hover:bg-muted/50 transition-all ${
                      index === 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    } ${isNew ? 'animate-flash-highlight' : ''}`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {isBuy ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Buy</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Sell</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {getTimeAgo(swap.timestamp)}
                      </span>
                    </div>

                    {/* Amount Row */}
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2">
                      <span className="text-base sm:text-lg font-bold font-mono">
                        {Math.abs(amount1).toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{TOKEN_SYMBOL}</span>
                      <span className="text-xs text-muted-foreground">≈</span>
                      <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                        ${Math.abs(amount0).toFixed(2)}
                      </span>
                    </div>

                    {/* Addresses - Sender → Recipient */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="font-medium text-muted-foreground">From:</span>
                      <a
                        href={getBlockExplorerAddressUrl(swap.sender)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-primary transition-colors"
                      >
                        {shortenAddress(swap.sender)}
                      </a>
                      <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium text-muted-foreground">To:</span>
                      <a
                        href={getBlockExplorerAddressUrl(swap.recipient)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-primary transition-colors"
                      >
                        {shortenAddress(swap.recipient)}
                      </a>
                    </div>

                    {/* Transaction Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {shortenAddress(swap.transactionHash)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfers Stream */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-pulse" />
              <CardTitle className="text-base sm:text-lg">Live Transfers</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                {transfers.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Real-time transfer activity • Updates every 2s
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transfersLoading ? (
            <div className="space-y-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 sm:h-20 bg-muted/50 animate-pulse border-b"></div>
              ))}
            </div>
          ) : (
            <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {transfers.slice(0, DISPLAY_LIMIT).map((transfer, index) => {
                const value = parseFloat(transfer.value)

                const isNew = newTransferIds.has(transfer.id)

                return (
                  <div
                    key={transfer.id}
                    className={`group relative p-3 sm:p-4 border-b hover:bg-muted/50 transition-all ${
                      index === 0 ? 'bg-secondary/5 border-l-2 border-l-secondary' : ''
                    } ${isNew ? 'animate-flash-highlight' : ''}`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {transfer.isPoolRelated ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Activity className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Pool</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Transfer</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {getTimeAgo(transfer.timestamp)}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2">
                      <span className="text-base sm:text-lg font-bold font-mono">
                        {formatTokenAmount(value, 2)}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{TOKEN_SYMBOL}</span>
                    </div>

                    {/* Addresses - Single Line with Arrow */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="font-medium text-muted-foreground">From:</span>
                      <a
                        href={getBlockExplorerAddressUrl(transfer.from.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-primary transition-colors"
                      >
                        {shortenAddress(transfer.from.address)}
                      </a>
                      <ArrowDownRight className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium text-muted-foreground">To:</span>
                      <a
                        href={getBlockExplorerAddressUrl(transfer.to.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:text-primary transition-colors"
                      >
                        {shortenAddress(transfer.to.address)}
                      </a>
                    </div>

                    {/* Transaction Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground font-mono">
                        {shortenAddress(transfer.transactionHash)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-blue-500/10"
                          onClick={() => copyToClipboard(transfer.transactionHash)}
                        >
                          <Copy className={`h-3.5 w-3.5 ${copiedHash === transfer.transactionHash ? 'text-green-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-blue-500/10"
                          asChild
                        >
                          <a
                            href={getBlockExplorerTxUrl(transfer.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

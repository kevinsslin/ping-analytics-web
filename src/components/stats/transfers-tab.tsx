'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransfers } from '@/hooks/useTransfers'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, getTimeAgo, formatTokenAmount, getBlockExplorerTxUrl, getBlockExplorerAddressUrl } from '@/lib/utils'
import { TOKEN_SYMBOL } from '@/types'
import { ExternalLink, Copy, ArrowRightLeft, Activity, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TransfersTab() {
  const [filter, setFilter] = useState<boolean | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const { transfers, loading, error } = useTransfers(100, filter)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Recent Transfers
              </CardTitle>
              <CardDescription>
                Latest {transfers.length} {TOKEN_SYMBOL} transfers •{' '}
                {filter === null ? 'All types' : filter ? 'Pool related only' : 'Regular only'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(null)}
              >
                All
              </Button>
              <Button
                variant={filter === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(true)}
              >
                Pool Related
              </Button>
              <Button
                variant={filter === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(false)}
              >
                Regular
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-left p-4 font-medium">From</th>
                  <th className="text-left p-4 font-medium">To</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer, index) => {
                  const value = parseFloat(transfer.value)

                  return (
                    <tr
                      key={transfer.id}
                      className={`group border-b hover:bg-muted/50 transition-all ${
                        index === 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <td className="p-4">
                        {transfer.isPoolRelated ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
                            <Activity className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Pool</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                            <User className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Regular</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {getTimeAgo(transfer.timestamp)}
                      </td>
                      <td className="p-4">
                        <a
                          href={getBlockExplorerAddressUrl(transfer.from.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs hover:text-primary transition-colors"
                        >
                          {shortenAddress(transfer.from.address)}
                        </a>
                      </td>
                      <td className="p-4">
                        <a
                          href={getBlockExplorerAddressUrl(transfer.to.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs hover:text-primary transition-colors"
                        >
                          {shortenAddress(transfer.to.address)}
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium">{formatTokenAmount(value, 2)}</span>
                          <span className="text-xs text-muted-foreground">{TOKEN_SYMBOL}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            {shortenAddress(transfer.transactionHash)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/10"
                              onClick={() => copyToClipboard(transfer.transactionHash)}
                            >
                              <Copy className={`h-3.5 w-3.5 ${copiedHash === transfer.transactionHash ? 'text-green-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-primary/10"
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

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccounts } from '@/hooks/useAccounts'
import { LoadingCard } from '@/components/shared/loading'
import { shortenAddress, formatTokenAmount, getTimeAgo, getBlockExplorerAddressUrl } from '@/lib/utils'
import { TOKEN_SYMBOL, MAX_TOTAL_SUPPLY, SPECIAL_ADDRESSES } from '@/types'
import { ExternalLink, Users, Copy, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function HoldersTab() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { accounts, loading, error } = useAccounts(100, 'balance')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  if (loading) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Holders</CardTitle>
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top {accounts.length} Holders
          </CardTitle>
          <CardDescription>
            Ranked by balance • {accounts.length} total accounts holding {TOKEN_SYMBOL}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium w-16">Rank</th>
                  <th className="text-left p-4 font-medium w-[30%]">Address</th>
                  <th className="text-right p-4 font-medium w-[18%]">Balance</th>
                  <th className="text-left p-4 font-medium w-[20%]">% of Supply</th>
                  <th className="text-right p-4 font-medium w-[12%]">Transfers</th>
                  <th className="text-left p-4 font-medium w-[20%]">First Transfer</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => {
                  const balance = parseFloat(account.balance)
                  const percentage = (balance / MAX_TOTAL_SUPPLY) * 100
                  const specialLabel = SPECIAL_ADDRESSES[account.address.toLowerCase()]

                  // Medal emojis for top 3
                  const getRankBadge = (rank: number) => {
                    if (rank === 1) return <span className="text-lg">🥇</span>
                    if (rank === 2) return <span className="text-lg">🥈</span>
                    if (rank === 3) return <span className="text-lg">🥉</span>
                    return `#${rank}`
                  }

                  return (
                    <tr
                      key={account.id}
                      className={`group border-b hover:bg-muted/50 transition-all ${
                        index < 3 ? 'bg-primary/5' : ''
                      } ${specialLabel ? 'bg-blue-500/5' : ''}`}
                    >
                      <td className="p-4 font-bold">
                        {getRankBadge(index + 1)}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1.5">
                          {specialLabel && (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${specialLabel.bgColor}`}>
                              <BadgeCheck className="h-3.5 w-3.5" />
                              <span className={`text-xs font-semibold ${specialLabel.color}`}>
                                {specialLabel.label}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs text-muted-foreground">
                              {account.address}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(account.address)}
                            >
                              <Copy className={`h-3 w-3 ${copiedAddress === account.address ? 'text-green-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium">{formatTokenAmount(balance, 2)}</span>
                          <span className="text-xs text-muted-foreground">{TOKEN_SYMBOL}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground min-w-[60px] text-right">
                            {percentage.toFixed(4)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          {account.transferCount}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {getTimeAgo(account.firstTransferAt)}
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

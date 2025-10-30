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
  const [pageSize, setPageSize] = useState(100)

  const {
    accounts,
    loading,
    error,
    currentPage,
    totalPages,
    totalHolders,
    pageSize: currentPageSize,
    goToPage,
    nextPage,
    prevPage
  } = useAccounts(pageSize, 'balance', null) // null = no auto-refresh

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(text)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getTransactionUrl = (hash: string) => {
    return `https://basescan.org/tx/${hash}`
  }

  const startIndex = (currentPage - 1) * currentPageSize
  // Smart endIndex: use totalHolders if available, otherwise calculate from actual loaded accounts
  const endIndex = totalHolders > 0
    ? Math.min(startIndex + currentPageSize, totalHolders)
    : startIndex + accounts.length

  const handlePageSizeChange = (newSize: number) => {
    console.log('[HoldersTab] handlePageSizeChange called:', {
      oldSize: pageSize,
      newSize,
      currentPage
    })
    setPageSize(newSize)
    goToPage(1) // Reset to first page when changing page size
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

  // Guard against invalid currentPage (should never happen with fixes, but defensive programming)
  if (currentPage < 1) {
    return <LoadingCard />
  }

  return (
    <div className="space-y-4">
      {/* Pagination and Page Size Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side - Page size selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Show</span>
              <div className="flex gap-1">
                {[10, 20, 50, 100].map((size) => (
                  <Button
                    key={size}
                    variant={pageSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageSizeChange(size)}
                    className="w-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>

            {/* Right side - Page navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="text-sm text-muted-foreground">
                {accounts.length > 0 ? (
                  totalHolders > 0 ? (
                    <>Showing {startIndex + 1}-{endIndex} of {totalHolders} holders</>
                  ) : (
                    <>Showing {startIndex + 1}-{endIndex}</>
                  )
                ) : (
                  <>No holders on this page</>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-muted-foreground px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        className="w-10"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={false}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holders Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Holders
          </CardTitle>
          <CardDescription>
            Ranked by balance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left p-2 md:p-4 font-medium w-12 md:w-16">Rank</th>
                  <th className="text-left p-2 md:p-4 font-medium">Address</th>
                  <th className="text-right p-2 md:p-4 font-medium">Balance</th>
                  <th className="text-left p-2 md:p-4 font-medium">% of Supply</th>
                  <th className="text-right p-2 md:p-4 font-medium">Transfers</th>
                  <th className="text-left p-2 md:p-4 font-medium">Last Transfer</th>
                  <th className="text-left p-2 md:p-4 font-medium">Last Buy</th>
                  <th className="text-left p-2 md:p-4 font-medium">Last Sell</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => {
                  const balance = parseFloat(account.balance)
                  const percentage = (balance / MAX_TOTAL_SUPPLY) * 100
                  const specialLabel = SPECIAL_ADDRESSES[account.address.toLowerCase()]
                  const globalRank = startIndex + index + 1

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
                        globalRank <= 3 ? 'bg-primary/5' : ''
                      } ${specialLabel ? 'bg-blue-500/5' : ''}`}
                    >
                      <td className="p-2 md:p-4 font-bold text-sm md:text-base">
                        {getRankBadge(globalRank)}
                      </td>
                      <td className="p-2 md:p-4">
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
                            <code className="font-mono text-xs text-muted-foreground truncate max-w-[100px] md:max-w-none">
                              <span className="md:hidden">{shortenAddress(account.address)}</span>
                              <span className="hidden md:inline">{account.address}</span>
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => copyToClipboard(account.address)}
                            >
                              <Copy className={`h-3 w-3 ${copiedAddress === account.address ? 'text-green-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 md:p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-medium text-xs md:text-sm">{formatTokenAmount(balance, 2)}</span>
                          <span className="text-xs text-muted-foreground">{TOKEN_SYMBOL}</span>
                        </div>
                      </td>
                      <td className="p-2 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="flex-1 max-w-[60px] md:max-w-[120px]">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground min-w-[50px] md:min-w-[60px] text-right">
                            {percentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-2 md:p-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                          {account.transferCount}
                        </span>
                      </td>
                      <td className="p-2 md:p-4">
                        <a
                          href={getTransactionUrl(account.lastTransferHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span>{getTimeAgo(account.lastTransferAt)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-2 md:p-4">
                        {account.lastBuyAt && account.lastBuyHash ? (
                          <a
                            href={getTransactionUrl(account.lastBuyHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span>{getTimeAgo(account.lastBuyAt)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Never</span>
                        )}
                      </td>
                      <td className="p-2 md:p-4">
                        {account.lastSellAt && account.lastSellHash ? (
                          <a
                            href={getTransactionUrl(account.lastSellHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span>{getTimeAgo(account.lastSellAt)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Never</span>
                        )}
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

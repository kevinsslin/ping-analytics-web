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
  const [pageSize, setPageSize] = useState(100)

  const {
    transfers,
    loading,
    error,
    currentPage,
    totalPages,
    totalTransfers,
    pageSize: currentPageSize,
    goToPage,
    nextPage,
    prevPage
  } = useTransfers(pageSize, filter, null) // null = no auto-refresh

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const startIndex = (currentPage - 1) * currentPageSize
  // Smart endIndex: use totalTransfers if available, otherwise calculate from actual loaded transfers
  const endIndex = totalTransfers > 0
    ? Math.min(startIndex + currentPageSize, totalTransfers)
    : startIndex + transfers.length

  const handlePageSizeChange = (newSize: number) => {
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
                {transfers.length > 0 ? (
                  totalTransfers > 0 ? (
                    <>Showing {startIndex + 1}-{endIndex} of {totalTransfers} transfers</>
                  ) : (
                    <>Showing {startIndex + 1}-{endIndex}</>
                  )
                ) : (
                  <>No transfers on this page</>
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
                {transfers
                  .filter(transfer => {
                    // Comprehensive validation - ensure all required data exists
                    if (!transfer) return false
                    if (!transfer.transactionHash || !transfer.value) return false

                    // Validate value is a parseable number
                    const val = parseFloat(transfer.value)
                    if (isNaN(val) || !isFinite(val)) return false

                    // Note: from/to can be null for pool-related transfers (mints/burns)
                    return true
                  })
                  .map((transfer, index) => {
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
                        {transfer.from && transfer.from.address ? (
                          <a
                            href={getBlockExplorerAddressUrl(transfer.from.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs hover:text-primary transition-colors"
                          >
                            {shortenAddress(transfer.from.address)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground/50">Pool (Mint)</span>
                        )}
                      </td>
                      <td className="p-4">
                        {transfer.to && transfer.to.address ? (
                          <a
                            href={getBlockExplorerAddressUrl(transfer.to.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs hover:text-primary transition-colors"
                          >
                            {shortenAddress(transfer.to.address)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground/50">Pool (Burn)</span>
                        )}
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

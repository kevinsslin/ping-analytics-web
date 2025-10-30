'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_TRANSFERS_QUERY, POOL_RELATED_TRANSFERS_QUERY, TRANSFER_COUNT_QUERY, RECENT_TRANSFERS_AFTER_TIMESTAMP_QUERY } from '@/lib/queries'
import { Transfer, TransferQueryResponse } from '@/types'

const MAX_TRANSFERS = 50 // Maximum number of transfers to keep in memory for live updates

export function useTransfers(
  pageSize = 100,
  filterPoolRelated: boolean | null = null,
  pollInterval: number | null = null // null = no polling
) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTransfers, setTotalTransfers] = useState(0)
  const latestTimestampRef = useRef<number | null>(null)
  const isInitialFetchRef = useRef(true)
  const useLiveUpdates = pollInterval !== null && currentPage === 1 && filterPoolRelated === null

  const fetchTotalCount = useCallback(async () => {
    try {
      const data = await fetchGraphQL<{ Transfer_aggregate: { aggregate: { count: number } } }>(
        TRANSFER_COUNT_QUERY,
        filterPoolRelated !== null ? { isPoolRelated: filterPoolRelated } : {}
      )
      // Use nullish coalescing to handle 0 count correctly (0 is a valid value, not falsy)
      const count = data.Transfer_aggregate?.aggregate?.count ?? 0
      setTotalTransfers(count)
    } catch (err) {
      console.error('Error fetching total count:', err)
    }
  }, [filterPoolRelated])

  const fetchTransfers = useCallback(async (page: number) => {
    try {
      // Live updates mode: incremental fetching with timestamp
      if (useLiveUpdates) {
        // Initial fetch: get the latest N transfers
        if (isInitialFetchRef.current) {
          setLoading(true)
          const data = await fetchGraphQL<TransferQueryResponse>(
            RECENT_TRANSFERS_QUERY,
            { limit: pageSize, offset: 0 }
          )

          if (data.Transfer && data.Transfer.length > 0) {
            setTransfers(data.Transfer)
            // Store the latest timestamp as integer for numeric comparison
            latestTimestampRef.current = parseInt(data.Transfer[0].timestamp)
            setError(null)
          }
          setLoading(false)
          isInitialFetchRef.current = false
        } else {
          // Subsequent fetches: get only new transfers after latest timestamp
          if (!latestTimestampRef.current) return

          const data = await fetchGraphQL<TransferQueryResponse>(
            RECENT_TRANSFERS_AFTER_TIMESTAMP_QUERY,
            { afterTimestamp: latestTimestampRef.current }
          )

          if (data.Transfer && data.Transfer.length > 0) {
            // Prepend new transfers to existing array
            setTransfers(prevTransfers => {
              const combined = [...data.Transfer, ...prevTransfers]
              // Limit to MAX_TRANSFERS items
              return combined.slice(0, MAX_TRANSFERS)
            })
            // Update latest timestamp to the newest transfer as integer
            latestTimestampRef.current = parseInt(data.Transfer[0].timestamp)
            setError(null)
          }
        }
      } else {
        // Pagination mode: traditional fetching with offset
        setLoading(true)
        // Only validate page if totalTransfers is available
        let validPage = page
        if (totalTransfers > 0) {
          const maxPage = Math.ceil(totalTransfers / pageSize)
          validPage = Math.max(1, Math.min(page, maxPage))
        } else {
          // If totalTransfers not yet loaded, just ensure page is positive
          validPage = Math.max(1, page)
        }
        const offset = Math.max(0, (validPage - 1) * pageSize)

        console.log('[useTransfers] fetchTransfers called:', {
          requestedPage: page,
          validPage,
          pageSize,
          totalTransfers,
          offset,
          limit: pageSize,
          filterPoolRelated
        })

        let data: TransferQueryResponse

        if (filterPoolRelated !== null) {
          data = await fetchGraphQL<TransferQueryResponse>(
            POOL_RELATED_TRANSFERS_QUERY,
            { limit: pageSize, offset, isPoolRelated: filterPoolRelated }
          )
        } else {
          data = await fetchGraphQL<TransferQueryResponse>(
            RECENT_TRANSFERS_QUERY,
            { limit: pageSize, offset }
          )
        }

        if (data.Transfer) {
          setTransfers(data.Transfer)
          setError(null)
        }
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Error fetching transfers:', err)
      setError(err.message || 'Failed to fetch transfers')
      setLoading(false)
    }
  }, [pageSize, filterPoolRelated, totalTransfers, useLiveUpdates])

  // Fetch total count on mount or when filter changes
  useEffect(() => {
    fetchTotalCount()
  }, [fetchTotalCount])

  // Fetch transfers for current page
  useEffect(() => {
    fetchTransfers(currentPage)

    // Only set up polling if pollInterval is provided
    if (pollInterval !== null) {
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchTransfers(currentPage)
        }
      }, pollInterval)

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchTransfers(currentPage)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [fetchTransfers, currentPage, pollInterval])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterPoolRelated])

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.max(1, Math.ceil(totalTransfers / pageSize))
    const validPage = Math.max(1, Math.min(page, maxPage))
    setCurrentPage(validPage)
  }, [totalTransfers, pageSize])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalTransfers / pageSize))

  return {
    transfers,
    loading,
    error,
    currentPage,
    totalPages,
    totalTransfers,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    refetch: () => fetchTransfers(currentPage)
  }
}

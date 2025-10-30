'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { TOP_HOLDERS_QUERY, MOST_ACTIVE_ACCOUNTS_QUERY, ACCOUNT_COUNT_QUERY } from '@/lib/queries'
import { Account, AccountQueryResponse } from '@/types'

type SortType = 'balance' | 'activity'

export function useAccounts(
  pageSize = 100,
  sortBy: SortType = 'balance',
  pollInterval: number | null = null // null = no polling
) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalHolders, setTotalHolders] = useState(0)

  const fetchTotalCount = useCallback(async () => {
    try {
      const data = await fetchGraphQL<{ Account_aggregate: { aggregate: { count: number } } }>(
        ACCOUNT_COUNT_QUERY
      )
      // Use nullish coalescing to handle 0 count correctly (0 is a valid value, not falsy)
      const count = data.Account_aggregate?.aggregate?.count ?? 0
      setTotalHolders(count)
    } catch (err) {
      console.error('Error fetching total count:', err)
    }
  }, [])

  const fetchAccounts = useCallback(async (page: number) => {
    try {
      setLoading(true)
      // Only validate page if totalHolders is available
      let validPage = page
      if (totalHolders > 0) {
        const maxPage = Math.ceil(totalHolders / pageSize)
        validPage = Math.max(1, Math.min(page, maxPage))
      } else {
        // If totalHolders not yet loaded, just ensure page is positive
        validPage = Math.max(1, page)
      }
      const offset = Math.max(0, (validPage - 1) * pageSize)
      const query = sortBy === 'balance' ? TOP_HOLDERS_QUERY : MOST_ACTIVE_ACCOUNTS_QUERY

      console.log('[useAccounts] fetchAccounts called:', {
        requestedPage: page,
        validPage,
        pageSize,
        totalHolders,
        offset,
        limit: pageSize
      })

      const data = await fetchGraphQL<AccountQueryResponse>(
        query,
        { limit: pageSize, offset }
      )

      if (data.Account) {
        setAccounts(data.Account)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching accounts:', err)
      setError(err.message || 'Failed to fetch accounts')
      setLoading(false)
    }
  }, [pageSize, sortBy, totalHolders])

  // Fetch total count on mount
  useEffect(() => {
    fetchTotalCount()
  }, [fetchTotalCount])

  // Fetch accounts for current page
  useEffect(() => {
    fetchAccounts(currentPage)

    // Only set up polling if pollInterval is provided
    if (pollInterval !== null) {
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchAccounts(currentPage)
        }
      }, pollInterval)

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchAccounts(currentPage)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [fetchAccounts, currentPage, pollInterval])

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.max(1, Math.ceil(totalHolders / pageSize))
    const validPage = Math.max(1, Math.min(page, maxPage))
    setCurrentPage(validPage)
  }, [totalHolders, pageSize])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalHolders / pageSize))

  return {
    accounts,
    loading,
    error,
    currentPage,
    totalPages,
    totalHolders,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    refetch: () => fetchAccounts(currentPage)
  }
}

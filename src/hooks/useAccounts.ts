'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { TOP_HOLDERS_QUERY, MOST_ACTIVE_ACCOUNTS_QUERY, ACCOUNT_COUNT_QUERY } from '@/lib/queries'
import { Account, AccountQueryResponse } from '@/types'

type SortType = 'balance' | 'activity'

export function useAccounts(
  pageSize = 100,
  sortBy: SortType = 'balance',
  pollInterval = 10000
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
      if (data.Account_aggregate?.aggregate?.count) {
        setTotalHolders(data.Account_aggregate.aggregate.count)
      }
    } catch (err) {
      console.error('Error fetching total count:', err)
    }
  }, [])

  const fetchAccounts = useCallback(async (page: number) => {
    try {
      setLoading(true)
      const offset = (page - 1) * pageSize
      const query = sortBy === 'balance' ? TOP_HOLDERS_QUERY : MOST_ACTIVE_ACCOUNTS_QUERY

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
  }, [pageSize, sortBy])

  // Fetch total count on mount
  useEffect(() => {
    fetchTotalCount()
  }, [fetchTotalCount])

  // Fetch accounts for current page
  useEffect(() => {
    fetchAccounts(currentPage)

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
  }, [fetchAccounts, currentPage, pollInterval])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalHolders / pageSize)))
  }, [totalHolders, pageSize])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  const totalPages = Math.ceil(totalHolders / pageSize)

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

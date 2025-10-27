'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { TOP_HOLDERS_QUERY, MOST_ACTIVE_ACCOUNTS_QUERY } from '@/lib/queries'
import { Account, AccountQueryResponse } from '@/types'

type SortType = 'balance' | 'activity'

export function useAccounts(limit = 100, sortBy: SortType = 'balance', pollInterval = 10000) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    try {
      const query = sortBy === 'balance' ? TOP_HOLDERS_QUERY : MOST_ACTIVE_ACCOUNTS_QUERY

      const data = await fetchGraphQL<AccountQueryResponse>(
        query,
        { limit }
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
  }, [limit, sortBy])

  useEffect(() => {
    fetchAccounts()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchAccounts()
      }
    }, pollInterval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAccounts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchAccounts, pollInterval])

  return { accounts, loading, error, refetch: fetchAccounts }
}

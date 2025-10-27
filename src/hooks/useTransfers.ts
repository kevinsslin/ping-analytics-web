'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_TRANSFERS_QUERY, POOL_RELATED_TRANSFERS_QUERY } from '@/lib/queries'
import { Transfer, TransferQueryResponse } from '@/types'

export function useTransfers(
  limit = 25,
  filterPoolRelated: boolean | null = null,
  pollInterval = 2000
) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransfers = useCallback(async () => {
    try {
      let data: TransferQueryResponse

      if (filterPoolRelated !== null) {
        data = await fetchGraphQL<TransferQueryResponse>(
          POOL_RELATED_TRANSFERS_QUERY,
          { limit, isPoolRelated: filterPoolRelated }
        )
      } else {
        data = await fetchGraphQL<TransferQueryResponse>(
          RECENT_TRANSFERS_QUERY,
          { limit }
        )
      }

      if (data.Transfer) {
        setTransfers(data.Transfer)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching transfers:', err)
      setError(err.message || 'Failed to fetch transfers')
      setLoading(false)
    }
  }, [limit, filterPoolRelated])

  useEffect(() => {
    fetchTransfers()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchTransfers()
      }
    }, pollInterval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTransfers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchTransfers, pollInterval])

  return { transfers, loading, error, refetch: fetchTransfers }
}

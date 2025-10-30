'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_SWAPS_QUERY } from '@/lib/queries'
import { Swap, SwapQueryResponse } from '@/types'

export function useSwaps(limit = 25, pollInterval = 2000) {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSwaps = useCallback(async () => {
    try {
      const data = await fetchGraphQL<SwapQueryResponse>(
        RECENT_SWAPS_QUERY,
        { limit }
      )

      if (data.Swap) {
        setSwaps(data.Swap)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching swaps:', err)
      setError(err.message || 'Failed to fetch swaps')
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchSwaps()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchSwaps()
      }
    }, pollInterval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSwaps()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchSwaps, pollInterval])

  return { swaps, loading, error, refetch: fetchSwaps }
}

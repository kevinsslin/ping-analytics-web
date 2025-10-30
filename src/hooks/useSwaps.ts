'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_SWAPS_QUERY, RECENT_SWAPS_AFTER_TIMESTAMP_QUERY } from '@/lib/queries'
import { Swap, SwapQueryResponse } from '@/types'

const MAX_SWAPS = 100 // Maximum number of swaps to keep in memory

export function useSwaps(limit = 25, pollInterval: number | null = null) {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSwaps = useCallback(async () => {
    try {
      // Simple polling: always fetch the latest N swaps
      const data = await fetchGraphQL<SwapQueryResponse>(
        RECENT_SWAPS_QUERY,
        { limit }
      )

      if (data.Swap && data.Swap.length > 0) {
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

    // Only set up polling if pollInterval is provided
    if (pollInterval !== null) {
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
    }
  }, [fetchSwaps, pollInterval])

  return { swaps, loading, error, refetch: fetchSwaps }
}

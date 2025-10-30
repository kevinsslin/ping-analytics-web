'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_SWAPS_QUERY, RECENT_SWAPS_AFTER_TIMESTAMP_QUERY } from '@/lib/queries'
import { Swap, SwapQueryResponse } from '@/types'

const MAX_SWAPS = 50 // Maximum number of swaps to keep in memory

export function useSwaps(limit = 25, pollInterval: number | null = null) {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const latestTimestampRef = useRef<string | null>(null)
  const isInitialFetchRef = useRef(true)

  const fetchSwaps = useCallback(async () => {
    try {
      // Initial fetch: get the latest N swaps
      if (isInitialFetchRef.current) {
        const data = await fetchGraphQL<SwapQueryResponse>(
          RECENT_SWAPS_QUERY,
          { limit }
        )

        if (data.Swap && data.Swap.length > 0) {
          setSwaps(data.Swap)
          // Store the latest timestamp
          latestTimestampRef.current = data.Swap[0].timestamp
          setError(null)
        }
        setLoading(false)
        isInitialFetchRef.current = false
      } else {
        // Subsequent fetches: get only new swaps after latest timestamp
        if (!latestTimestampRef.current) return

        const data = await fetchGraphQL<SwapQueryResponse>(
          RECENT_SWAPS_AFTER_TIMESTAMP_QUERY,
          { afterTimestamp: latestTimestampRef.current }
        )

        if (data.Swap && data.Swap.length > 0) {
          // Prepend new swaps to existing array
          setSwaps(prevSwaps => {
            const combined = [...data.Swap, ...prevSwaps]
            // Limit to MAX_SWAPS items
            return combined.slice(0, MAX_SWAPS)
          })
          // Update latest timestamp to the newest swap
          latestTimestampRef.current = data.Swap[0].timestamp
          setError(null)
        }
      }
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

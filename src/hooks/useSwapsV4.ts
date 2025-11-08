'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { RECENT_SWAPSV4_QUERY } from '@/lib/queries'
import { SwapV4, SwapV4QueryResponse } from '@/types'

const MAX_SWAPS = 100 // Maximum number of swaps to keep in memory

export function useSwapsV4(limit = 25, pollInterval: number | null = null) {
  const [swaps, setSwaps] = useState<SwapV4[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitialFetchRef = useRef(true)

  const fetchSwaps = useCallback(async () => {
    try {
      const data = await fetchGraphQL<SwapV4QueryResponse>(
        RECENT_SWAPSV4_QUERY,
        { limit }
      )

      if (data.SwapV4 && data.SwapV4.length > 0) {
        if (isInitialFetchRef.current) {
          // Initial load: just set the data
          setSwaps(data.SwapV4)
          isInitialFetchRef.current = false
        } else {
          // Subsequent polls: merge new items with existing ones
          setSwaps(prevSwaps => {
            // Get IDs of existing swaps
            const existingIds = new Set(prevSwaps.map(s => s.id))
            // Find truly new swaps (not in existing list)
            const newSwaps = data.SwapV4.filter(s => !existingIds.has(s.id))

            if (newSwaps.length > 0) {
              // Prepend new swaps to the front, limit total size
              const combined = [...newSwaps, ...prevSwaps]
              return combined.slice(0, MAX_SWAPS)
            }

            // No new swaps, keep existing
            return prevSwaps
          })
        }
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching V4 swaps:', err)
      setError(err.message || 'Failed to fetch V4 swaps')
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

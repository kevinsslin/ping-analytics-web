'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { ALL_POOLS_QUERY } from '@/lib/queries'
import { Pool, PoolQueryResponse, TOKEN_ADDRESS } from '@/types'

// Helper function to get PING volume from a pool
function getPingVolume(pool: Pool): number {
  // Defensive check - return 0 if token addresses are missing
  if (!pool.token0 || !pool.token1) return 0

  const isPingToken0 = pool.token0.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
  const isPingToken1 = pool.token1.toLowerCase() === TOKEN_ADDRESS.toLowerCase()

  if (isPingToken0) {
    return parseFloat(pool.volumeToken0) || 0
  } else if (isPingToken1) {
    return parseFloat(pool.volumeToken1) || 0
  }

  // If PING is not in this pool, return 0
  return 0
}

export function usePools(pollInterval = 10000) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPools = useCallback(async () => {
    try {
      const data = await fetchGraphQL<PoolQueryResponse>(ALL_POOLS_QUERY)

      if (data.Pool) {
        // Sort pools by PING volume in descending order
        const sortedPools = [...data.Pool].sort((a, b) => {
          const pingVolumeA = getPingVolume(a)
          const pingVolumeB = getPingVolume(b)
          return pingVolumeB - pingVolumeA // Descending order
        })

        setPools(sortedPools)
        setError(null)
        setRetryCount(0)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching pools:', err)
      setError(err.message || 'Failed to fetch pools data')
      setRetryCount(prev => prev + 1)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPools()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPools()
      }
    }, pollInterval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPools()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchPools, pollInterval])

  return { pools, loading, error, refetch: fetchPools, retryCount }
}

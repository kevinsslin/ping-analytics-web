'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { ALL_POOLSV4_QUERY } from '@/lib/queries'
import { PoolV4, PoolV4QueryResponse, TOKEN_ADDRESS } from '@/types'

// Helper function to get PING volume from a V4 pool
function getPingVolume(pool: PoolV4): number {
  // Defensive check - return 0 if currency addresses are missing
  if (!pool.currency0 || !pool.currency1) return 0

  const isPingCurrency0 = pool.currency0.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
  const isPingCurrency1 = pool.currency1.toLowerCase() === TOKEN_ADDRESS.toLowerCase()

  if (isPingCurrency0) {
    return parseFloat(pool.volumeCurrency0) || 0
  } else if (isPingCurrency1) {
    return parseFloat(pool.volumeCurrency1) || 0
  }

  // If PING is not in this pool, return 0
  return 0
}

export function usePoolsV4(pollInterval = 10000) {
  const [pools, setPools] = useState<PoolV4[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPools = useCallback(async () => {
    try {
      const data = await fetchGraphQL<PoolV4QueryResponse>(ALL_POOLSV4_QUERY)

      if (data.PoolV4) {
        // Sort pools by PING volume in descending order
        const sortedPools = [...data.PoolV4].sort((a, b) => {
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
      console.error('Error fetching V4 pools:', err)
      setError(err.message || 'Failed to fetch V4 pools data')
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

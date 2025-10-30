'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { ALL_POOLS_QUERY } from '@/lib/queries'
import { Pool, PoolQueryResponse } from '@/types'

export function usePools(pollInterval = 10000) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchPools = useCallback(async () => {
    try {
      const data = await fetchGraphQL<PoolQueryResponse>(ALL_POOLS_QUERY)

      if (data.Pool) {
        setPools(data.Pool)
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

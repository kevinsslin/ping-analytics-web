'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { POOL_QUERY } from '@/lib/queries'
import { Pool, PoolQueryResponse, CHAIN_ID, POOL_ADDRESS } from '@/types'

export function usePool(pollInterval = 10000) {
  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const poolId = `${CHAIN_ID}_${POOL_ADDRESS.toLowerCase()}`

  const fetchPool = useCallback(async () => {
    try {
      const data = await fetchGraphQL<PoolQueryResponse>(
        POOL_QUERY,
        { poolId }
      )

      if (data.Pool && data.Pool.length > 0) {
        setPool(data.Pool[0])
        setError(null)
        setRetryCount(0)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching pool:', err)
      setError(err.message || 'Failed to fetch pool data')
      setRetryCount(prev => prev + 1)
      setLoading(false)
    }
  }, [poolId])

  useEffect(() => {
    fetchPool()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchPool()
      }
    }, pollInterval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPool()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchPool, pollInterval])

  return { pool, loading, error, refetch: fetchPool, retryCount }
}

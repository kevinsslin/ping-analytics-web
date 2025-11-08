'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { DAILY_POOL_ACTIVITY_V4_QUERY } from '@/lib/queries'
import { DailyPoolActivityV4, DailyPoolActivityV4QueryResponse } from '@/types'

export function usePoolActivityV4(
  poolId: string | null,
  limit = 30, // Default to 30 days of activity
  pollInterval: number | null = null // null = no polling
) {
  const [activities, setActivities] = useState<DailyPoolActivityV4[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    // Don't fetch if no pool ID provided
    if (!poolId) {
      setActivities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchGraphQL<DailyPoolActivityV4QueryResponse>(
        DAILY_POOL_ACTIVITY_V4_QUERY,
        { limit, poolId }
      )

      if (data.DailyPoolActivityV4) {
        setActivities(data.DailyPoolActivityV4)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching V4 pool activity:', err)
      setError(err.message || 'Failed to fetch V4 pool activity')
      setLoading(false)
    }
  }, [poolId, limit])

  useEffect(() => {
    fetchActivities()

    // Only set up polling if pollInterval is provided and poolId exists
    if (pollInterval !== null && poolId) {
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchActivities()
        }
      }, pollInterval)

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchActivities()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [fetchActivities, pollInterval, poolId])

  return { activities, loading, error, refetch: fetchActivities }
}

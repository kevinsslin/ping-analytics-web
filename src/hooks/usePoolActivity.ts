'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { DAILY_POOL_ACTIVITY_QUERY } from '@/lib/queries'
import { DailyPoolActivity, DailyPoolActivityQueryResponse } from '@/types'

export function usePoolActivity(
  poolAddress: string | null,
  limit = 30, // Default to 30 days of activity
  pollInterval: number | null = null // null = no polling
) {
  const [activities, setActivities] = useState<DailyPoolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    // Don't fetch if no pool address provided
    if (!poolAddress) {
      setActivities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchGraphQL<DailyPoolActivityQueryResponse>(
        DAILY_POOL_ACTIVITY_QUERY,
        { limit, poolAddress }
      )

      if (data.DailyPoolActivity) {
        setActivities(data.DailyPoolActivity)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching pool activity:', err)
      setError(err.message || 'Failed to fetch pool activity')
      setLoading(false)
    }
  }, [poolAddress, limit])

  useEffect(() => {
    fetchActivities()

    // Only set up polling if pollInterval is provided and poolAddress exists
    if (pollInterval !== null && poolAddress) {
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
  }, [fetchActivities, pollInterval, poolAddress])

  return { activities, loading, error, refetch: fetchActivities }
}

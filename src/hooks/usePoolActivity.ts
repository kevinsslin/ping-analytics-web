'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { DAILY_POOL_ACTIVITY_QUERY } from '@/lib/queries'
import { DailyPoolActivity, DailyPoolActivityQueryResponse } from '@/types'

export function usePoolActivity(
  poolIdentifier: string | null,
  limit = 30, // Default to 30 days of activity
  pollInterval: number | null = null // null = no polling
) {
  const [activities, setActivities] = useState<DailyPoolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    // Don't fetch if no pool identifier provided
    if (!poolIdentifier) {
      setActivities([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchGraphQL<DailyPoolActivityQueryResponse>(
        DAILY_POOL_ACTIVITY_QUERY,
        { limit, poolIdentifier }
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
  }, [poolIdentifier, limit])

  useEffect(() => {
    fetchActivities()

    // Only set up polling if pollInterval is provided and poolIdentifier exists
    if (pollInterval !== null && poolIdentifier) {
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
  }, [fetchActivities, pollInterval, poolIdentifier])

  return { activities, loading, error, refetch: fetchActivities }
}

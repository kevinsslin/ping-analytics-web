'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { DAILY_TOKEN_ACTIVITY_QUERY, DAILY_POOL_ACTIVITY_QUERY } from '@/lib/queries'
import {
  DailyTokenActivity,
  DailyPoolActivity,
  DailyTokenActivityQueryResponse,
  DailyPoolActivityQueryResponse,
  CHAIN_ID,
  POOL_ADDRESS
} from '@/types'

export function useDailyTokenActivity(days = 30) {
  const [activities, setActivities] = useState<DailyTokenActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      const data = await fetchGraphQL<DailyTokenActivityQueryResponse>(
        DAILY_TOKEN_ACTIVITY_QUERY,
        { limit: days }
      )

      if (data.DailyTokenActivity) {
        setActivities(data.DailyTokenActivity)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching daily token activity:', err)
      setError(err.message || 'Failed to fetch daily activity')
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading, error, refetch: fetchActivities }
}

export function useDailyPoolActivity(days = 30) {
  const [activities, setActivities] = useState<DailyPoolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      const data = await fetchGraphQL<DailyPoolActivityQueryResponse>(
        DAILY_POOL_ACTIVITY_QUERY,
        {
          limit: days,
          poolAddress: POOL_ADDRESS.toLowerCase()
        }
      )

      if (data.DailyPoolActivity) {
        setActivities(data.DailyPoolActivity)
        setError(null)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching daily pool activity:', err)
      setError(err.message || 'Failed to fetch daily pool activity')
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return { activities, loading, error, refetch: fetchActivities }
}

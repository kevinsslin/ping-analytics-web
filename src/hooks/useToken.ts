'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchGraphQL } from '@/lib/graphql'
import { TOKEN_STATS_QUERY } from '@/lib/queries'
import { Token, TokenQueryResponse, CHAIN_ID, TOKEN_ADDRESS } from '@/types'

export function useToken(pollInterval = 10000) {
  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const tokenId = `${CHAIN_ID}_${TOKEN_ADDRESS.toLowerCase()}`

  const fetchToken = useCallback(async () => {
    try {
      const data = await fetchGraphQL<TokenQueryResponse>(
        TOKEN_STATS_QUERY,
        { tokenId }
      )

      if (data.Token && data.Token.length > 0) {
        setToken(data.Token[0])
        setError(null)
        setRetryCount(0)
      }
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching token:', err)
      setError(err.message || 'Failed to fetch token data')
      setRetryCount(prev => prev + 1)
      setLoading(false)
    }
  }, [tokenId])

  useEffect(() => {
    fetchToken()

    const interval = setInterval(() => {
      // Only fetch if document is visible
      if (!document.hidden) {
        fetchToken()
      }
    }, pollInterval)

    // Refetch when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchToken()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchToken, pollInterval])

  return { token, loading, error, refetch: fetchToken, retryCount }
}

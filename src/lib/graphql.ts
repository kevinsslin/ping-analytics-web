import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/db4edef/v1/graphql'

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// Retry configuration
export const MAX_RETRIES = 5
export const MAX_RETRY_DELAY = 30000 // 30 seconds
export const INITIAL_RETRY_DELAY = 1000 // 1 second

// Check if error is retryable
function isRetryableError(error: any): boolean {
  // Network errors (no response)
  if (!error?.response) {
    return true
  }

  // Server errors (5xx) and rate limiting (429)
  const status = error.response.status
  if (status >= 500 || status === 429) {
    return true
  }

  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    return true
  }

  return false
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  retries = 0
): Promise<T> {
  try {
    const data = await graphqlClient.request<T>(query, variables)
    return data
  } catch (error: any) {
    // Check if we should retry
    if (isRetryableError(error) && retries < MAX_RETRIES) {
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retries),
        MAX_RETRY_DELAY
      )

      const errorType = error?.response?.status === 429 ? 'Rate limited' : 'Request failed'
      console.log(`${errorType}. Retrying in ${delay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchGraphQL<T>(query, variables, retries + 1)
    }

    // Log non-retryable errors or exhausted retries
    if (retries >= MAX_RETRIES) {
      console.error(`Failed after ${MAX_RETRIES} retries:`, error)
    }

    // Re-throw error
    throw error
  }
}

// Helper to check if error is a rate limit error
export function isRateLimitError(error: any): boolean {
  return error?.response?.status === 429
}

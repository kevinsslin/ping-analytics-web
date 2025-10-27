import { GraphQLClient } from 'graphql-request'

const GRAPHQL_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/a0ffa92/v1/graphql'

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// Retry configuration
export const MAX_RETRIES = 5
export const MAX_RETRY_DELAY = 30000 // 30 seconds
export const INITIAL_RETRY_DELAY = 1000 // 1 second

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  retries = 0
): Promise<T> {
  try {
    const data = await graphqlClient.request<T>(query, variables)
    return data
  } catch (error: any) {
    // Handle rate limiting with exponential backoff
    if (error?.response?.status === 429 && retries < MAX_RETRIES) {
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, retries),
        MAX_RETRY_DELAY
      )
      console.log(`Rate limited. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchGraphQL<T>(query, variables, retries + 1)
    }

    // Re-throw other errors
    throw error
  }
}

// Helper to check if error is a rate limit error
export function isRateLimitError(error: any): boolean {
  return error?.response?.status === 429
}

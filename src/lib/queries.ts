import { gql } from 'graphql-request'

// ============ Token Queries ============

export const TOKEN_STATS_QUERY = gql`
  query GetTokenStats($tokenId: String!) {
    Token(where: { id: { _eq: $tokenId } }) {
      id
      chainId
      address
      symbol
      name
      decimals
      totalSupply
      totalTransfers
      totalVolume
      holderCount
    }
  }
`

// ============ Pool Queries ============

export const POOL_QUERY = gql`
  query GetPool($poolId: String!) {
    Pool(where: { id: { _eq: $poolId } }) {
      id
      chainId
      address
      token0
      token1
      feeTier
      tickSpacing
      liquidity
      sqrtPriceX96
      tick
      isActive
      volumeToken0
      volumeToken1
      txCount
      totalValueLockedToken0
      totalValueLockedToken1
      createdAt
      createdAtBlock
      lastSwapAt
    }
  }
`

export const ALL_POOLS_QUERY = gql`
  query GetAllPools {
    Pool(
      where: {
        liquidity: { _gt: "0" }
        isActive: { _eq: true }
      }
      order_by: [{ liquidity: desc }]
    ) {
      id
      chainId
      address
      token0
      token1
      feeTier
      tickSpacing
      liquidity
      sqrtPriceX96
      tick
      isActive
      volumeToken0
      volumeToken1
      txCount
      totalValueLockedToken0
      totalValueLockedToken1
      createdAt
      createdAtBlock
      lastSwapAt
    }
  }
`

// ============ Swap Queries ============

export const RECENT_SWAPS_QUERY = gql`
  query GetRecentSwaps($limit: Int!) {
    Swap(
      order_by: [{ timestamp: desc }]
      limit: $limit
    ) {
      id
      chainId
      transactionHash
      timestamp
      blockNumber
      sender
      recipient
      amount0
      amount1
      sqrtPriceX96
      liquidity
      tick
      pool {
        id
        address
        token0
        token1
        feeTier
      }
    }
  }
`

export const SWAP_COUNT_QUERY = gql`
  query GetSwapCount($poolId: String!) {
    Swap_aggregate(where: { pool: { id: { _eq: $poolId } } }) {
      aggregate {
        count
      }
    }
  }
`

// ============ Transfer Queries ============

export const RECENT_TRANSFERS_QUERY = gql`
  query GetRecentTransfers($limit: Int!, $offset: Int!) {
    Transfer(
      order_by: [{ timestamp: desc }]
      limit: $limit
      offset: $offset
    ) {
      id
      chainId
      transactionHash
      timestamp
      blockNumber
      value
      isPoolRelated
      poolRelatedType
      from {
        id
        address
        balance
      }
      to {
        id
        address
        balance
      }
    }
  }
`

export const POOL_RELATED_TRANSFERS_QUERY = gql`
  query GetPoolRelatedTransfers($limit: Int!, $offset: Int!, $isPoolRelated: Boolean!) {
    Transfer(
      where: { isPoolRelated: { _eq: $isPoolRelated } }
      order_by: [{ timestamp: desc }]
      limit: $limit
      offset: $offset
    ) {
      id
      chainId
      transactionHash
      timestamp
      blockNumber
      value
      isPoolRelated
      poolRelatedType
      from {
        id
        address
        balance
      }
      to {
        id
        address
        balance
      }
    }
  }
`

export const TRANSFER_COUNT_QUERY = gql`
  query GetTransferCount($isPoolRelated: Boolean) {
    Transfer_aggregate(
      where: $isPoolRelated != null ? { isPoolRelated: { _eq: $isPoolRelated } } : {}
    ) {
      aggregate {
        count
      }
    }
  }
`

// ============ Account Queries ============

export const TOP_HOLDERS_QUERY = gql`
  query GetTopHolders($limit: Int!, $offset: Int!) {
    Account(
      order_by: [{ balance: desc }]
      limit: $limit
      offset: $offset
      where: { balance: { _gt: "0" } }
    ) {
      id
      chainId
      address
      balance
      totalSent
      totalReceived
      transferCount
      firstTransferAt
      lastTransferAt
      lastTransferHash
      lastBuyAt
      lastBuyHash
      lastSellAt
      lastSellHash
      totalBuys
      totalSells
      totalBuyVolume
      totalSellVolume
    }
  }
`

export const ACCOUNT_COUNT_QUERY = gql`
  query GetAccountCount {
    Account_aggregate(where: { balance: { _gt: "0" } }) {
      aggregate {
        count
      }
    }
  }
`

export const MOST_ACTIVE_ACCOUNTS_QUERY = gql`
  query GetMostActiveAccounts($limit: Int!, $offset: Int!) {
    Account(
      order_by: [{ transferCount: desc }]
      limit: $limit
      offset: $offset
      where: { balance: { _gt: "0" } }
    ) {
      id
      chainId
      address
      balance
      totalSent
      totalReceived
      transferCount
      firstTransferAt
      lastTransferAt
      lastTransferHash
      lastBuyAt
      lastBuyHash
      lastSellAt
      lastSellHash
      totalBuys
      totalSells
      totalBuyVolume
      totalSellVolume
    }
  }
`

export const SEARCH_ACCOUNT_QUERY = gql`
  query SearchAccount($address: String!) {
    Account(where: { address: { _ilike: $address } }) {
      id
      chainId
      address
      balance
      totalSent
      totalReceived
      transferCount
      firstTransferAt
      lastTransferAt
    }
  }
`

// ============ Daily Activity Queries ============

export const DAILY_TOKEN_ACTIVITY_QUERY = gql`
  query GetDailyTokenActivity($limit: Int!) {
    DailyTokenActivity(
      order_by: [{ timestamp: desc }]
      limit: $limit
    ) {
      id
      chainId
      date
      timestamp
      dailyTransfers
      dailyVolume
      dailyActiveAccounts
      newAccounts
    }
  }
`

export const DAILY_POOL_ACTIVITY_QUERY = gql`
  query GetDailyPoolActivity($limit: Int!, $poolAddress: String!) {
    DailyPoolActivity(
      where: {
        pool: { _eq: $poolAddress }
      }
      order_by: [{ timestamp: desc }]
      limit: $limit
    ) {
      id
      chainId
      pool
      date
      timestamp
      dailySwaps
      dailyVolumeToken0
      dailyVolumeToken1
      liquidityStart
      liquidityEnd
      sqrtPriceX96Start
      sqrtPriceX96End
    }
  }
`

// ============ Combined Stats Query ============

export const DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats($tokenId: String!, $poolId: String!) {
    Token(where: { id: { _eq: $tokenId } }) {
      id
      symbol
      name
      totalSupply
      totalTransfers
      totalVolume
      holderCount
    }
    Pool(where: { id: { _eq: $poolId } }) {
      id
      liquidity
      volumeToken0
      volumeToken1
      txCount
      totalValueLockedToken0
      totalValueLockedToken1
      lastSwapAt
    }
  }
`

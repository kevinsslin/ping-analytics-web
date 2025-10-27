'use client'

import { TokenStats } from './token-stats'
import { PoolStats } from './pool-stats'

export function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <TokenStats />
        <PoolStats />
      </div>
    </div>
  )
}

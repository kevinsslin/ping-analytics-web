'use client'

import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/stats/overview-tab'
import { PulseTab } from '@/components/pulse/pulse-tab'
import { PoolsTab } from '@/components/stats/pools-tab'
import { HoldersTab } from '@/components/stats/holders-tab'
import { TransfersTab } from '@/components/stats/transfers-tab'
import { DailyChartsSection } from '@/components/charts/DailyChartsSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1920px] flex-1">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 w-full">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full grid-cols-3 lg:grid-cols-5 h-auto p-1">
              <TabsTrigger value="overview" className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm">Overview</TabsTrigger>
              <TabsTrigger value="pulse" className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm">Pulse</TabsTrigger>
              <TabsTrigger value="pools" className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm">Pools</TabsTrigger>
              <TabsTrigger value="holders" className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm">Holders</TabsTrigger>
              <TabsTrigger value="transfers" className="whitespace-nowrap px-3 sm:px-4 py-2 text-sm">Transfers</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <OverviewTab />
            <DailyChartsSection />
          </TabsContent>

          <TabsContent value="pulse" className="space-y-4 sm:space-y-6">
            <PulseTab />
          </TabsContent>

          <TabsContent value="pools" className="space-y-4 sm:space-y-6">
            <PoolsTab />
          </TabsContent>

          <TabsContent value="holders" className="space-y-4 sm:space-y-6">
            <HoldersTab />
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4 sm:space-y-6">
            <TransfersTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}

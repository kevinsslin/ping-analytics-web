'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOKEN_SYMBOL, CHAIN_NAME } from '@/types'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 max-w-[1920px] items-center">
        <div className="mr-4 md:mr-6 flex">
          <a className="flex items-center space-x-2 md:space-x-3" href="/">
            <img src="/ping-logo.jpg" alt="PING" className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover" />
            <span className="font-bold text-base md:text-lg">
              {TOKEN_SYMBOL} Analytics
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <span className="text-sm text-muted-foreground">
              {CHAIN_NAME} Network
            </span>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

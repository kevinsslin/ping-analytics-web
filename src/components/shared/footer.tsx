'use client'

import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1920px]">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          {/* Made by */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made by</span>
            <a
              href="https://github.com/kevinsslin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              Kevin Lin
            </a>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-4 w-px bg-border"></div>

          {/* Powered by Envio */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href="https://envio.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Envio
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

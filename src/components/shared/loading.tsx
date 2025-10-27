export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-8 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  )
}

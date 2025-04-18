"use client"

import { useStore } from "@/lib/store"

export function LoadingOverlay() {
  const { isLoading, error } = useStore()

  if (!isLoading && !error) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 p-4 rounded-md max-w-md">
          <p className="text-destructive font-medium">Error</p>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      )}
    </div>
  )
}


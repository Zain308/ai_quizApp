"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Something went wrong!</CardTitle>
          <CardDescription>An error occurred while loading the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {error.message || "An unexpected error occurred"}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1">
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

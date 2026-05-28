import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertTitle>This spark has encountered a runtime error</AlertTitle>
          <AlertDescription>Something unexpected happened while running the application.</AlertDescription>
        </Alert>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
            <CardDescription>Share this message with the spark author if the issue continues.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-32 overflow-auto rounded-md border bg-muted p-3 text-xs text-destructive">
              {error.message}
            </pre>
          </CardContent>
        </Card>

        <Button type="button" onClick={resetErrorBoundary} className="min-h-11 w-full shadow-none" variant="outline">
          <RefreshCwIcon aria-hidden="true" />
          Try Again
        </Button>
      </div>
    </main>
  )
}

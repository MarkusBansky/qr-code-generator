import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Theme } from '@radix-ui/themes'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import './main.css'

createRoot(document.getElementById('root')!).render(
  <Theme appearance="dark" accentColor="cyan" grayColor="slate" panelBackground="translucent" radius="large" scaling="100%">
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </Theme>,
)

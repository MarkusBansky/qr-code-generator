import { Box, Button, Callout, Card, Code, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error

  return (
    <Container size="1" className="error-shell">
      <Flex direction="column" gap="4">
        <Callout.Root color="red" variant="soft">
          <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
          <Callout.Text>
            <Heading as="h2" size="3" mb="1">This spark has encountered a runtime error</Heading>
            <Text size="2">Something unexpected happened while running the application.</Text>
          </Callout.Text>
        </Callout.Root>

        <Card>
          <Flex direction="column" gap="2">
            <Text size="2" color="gray" weight="medium">Error Details:</Text>
            <Box className="error-details">
              <Code color="red">{error.message}</Code>
            </Box>
          </Flex>
        </Card>

        <Button onClick={resetErrorBoundary} variant="soft" color="gray" size="3">
          <ReloadIcon /> Try Again
        </Button>
      </Flex>
    </Container>
  )
}

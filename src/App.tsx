import { Box, Link, Text } from '@radix-ui/themes'
import QRGenerator from './components/QRGenerator'

function App() {
  return (
    <Box minHeight="100vh" className="app-root">
      <QRGenerator />
      <Box asChild py="4" className="app-footer">
        <footer>
          <Text size="1" color="gray" align="center" as="p">
            © 2025 <Link href="https://markiian-benovskyi.com">Markiian Benovskyi</Link>. With some help from GitHub Spark
          </Text>
        </footer>
      </Box>
    </Box>
  )
}

export default App

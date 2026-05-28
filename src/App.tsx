import QRGenerator from './components/QRGenerator'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <QRGenerator />
      <footer className="mt-auto border-t bg-card px-4 py-4 text-center text-xs text-muted-foreground">
        © 2025 <a className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="https://markiian-benovskyi.com">Markiian Benovskyi</a>. With some help from GitHub Spark
      </footer>
    </div>
  )
}

export default App

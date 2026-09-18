import QRGenerator from './components/QRGenerator'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <QRGenerator />
      <footer className="mt-auto pt-3 pb-8 text-center text-xs text-muted-foreground">
        Made with <span aria-label="love">❤️</span> by Markiian Benovskyi
      </footer>
    </div>
  )
}

export default App

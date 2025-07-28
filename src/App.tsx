import QRGenerator from './components/QRGenerator'

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <QRGenerator />
            <footer className="mt-auto py-4 text-center text-xs text-muted-foreground bg-background border-t border-border">
                Created by Markiian Benovskyi with help of GH Spark
            </footer>
        </div>
    )
}

export default App
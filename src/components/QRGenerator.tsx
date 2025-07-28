import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, QrCode } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

const MAX_CHARACTERS = 2000

export default function QRGenerator() {
  const [text, setText] = useKV('qr-text', '')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return str.startsWith('http://') || str.startsWith('https://') || str.includes('.')
    }
  }

  const generateQR = async (input: string) => {
    if (!input.trim()) {
      setQrDataUrl('')
      return
    }

    setIsGenerating(true)
    try {
      const dataUrl = await QRCode.toDataURL(input, {
        width: 256,
        margin: 2,
        color: {
          dark: '#262626',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      setQrDataUrl('')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR(text)
    }, 100)

    return () => clearTimeout(timer)
  }, [text])

  const downloadQR = async () => {
    if (!text.trim()) return

    try {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, text, {
        width: 512,
        margin: 3,
        color: {
          dark: '#262626',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })

      const link = document.createElement('a')
      link.download = `qr-code-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const characterCount = text.length
  const isOverLimit = characterCount > MAX_CHARACTERS
  const displayText = isOverLimit ? text.slice(0, MAX_CHARACTERS) : text

  return (
    <div className="flex-1 bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode size={28} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">QR Generator</h1>
          </div>
          <p className="text-sm text-muted-foreground">Convert any text or URL into a QR code</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-input" className="text-sm font-medium">
                  Text or URL
                </Label>
                <Badge 
                  variant={isOverLimit ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {characterCount}/{MAX_CHARACTERS}
                </Badge>
              </div>
              <Input
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or paste a URL..."
                className={`font-mono text-sm ${isUrl(text) ? 'text-primary' : ''} ${isOverLimit ? 'border-destructive' : ''}`}
              />
              {text && isUrl(text) && (
                <p className="text-xs text-primary">✓ Detected URL format</p>
              )}
              {isOverLimit && (
                <p className="text-xs text-destructive">Text will be truncated to {MAX_CHARACTERS} characters</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {isGenerating ? (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Generating...</div>
                  </div>
                ) : qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Generated QR Code" 
                    className="w-64 h-64 rounded-lg shadow-sm border"
                  />
                ) : (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Enter text to generate QR code</p>
                    </div>
                  </div>
                )}
              </div>
              
              {qrDataUrl && (
                <Button 
                  onClick={downloadQR}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Download size={16} className="mr-2" />
                  Download PNG
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
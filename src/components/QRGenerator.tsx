import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Download, QrCode, FileImage, FileSvg, Clock, ChevronDown, Copy, Trash } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

const MAX_CHARACTERS = 2000

interface QROptions {
  colorDark: string
  colorLight: string
  size: number
  margin: number
}

interface QRHistoryItem {
  id: string
  text: string
  createdAt: number
  options: QROptions
}

export default function QRGenerator() {
  const [text, setText] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrSvg, setQrSvg] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Use persistent storage for QR history
  const [qrHistory, setQrHistory] = useKV<QRHistoryItem[]>("qr-history", [])
  
  const [options, setOptions] = useState<QROptions>({
    colorDark: '#262626',
    colorLight: '#FFFFFF',
    size: 256,
    margin: 2
  })

  const isUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return str.startsWith('http://') || str.startsWith('https://') || str.includes('.')
    }
  }

  const saveToHistory = (inputText: string, qrOptions: QROptions) => {
    if (!inputText.trim()) return
    
    setQrHistory((currentHistory) => {
      // Check if this exact text and options combination already exists
      const existingIndex = currentHistory.findIndex(
        item => item.text === inputText && 
                JSON.stringify(item.options) === JSON.stringify(qrOptions)
      )
      
      if (existingIndex !== -1) {
        // Move existing item to front
        const existing = currentHistory[existingIndex]
        return [
          { ...existing, createdAt: Date.now() },
          ...currentHistory.filter((_, index) => index !== existingIndex)
        ]
      }
      
      // Add new item to front, limit to 20 items
      const newItem: QRHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: inputText,
        createdAt: Date.now(),
        options: { ...qrOptions }
      }
      
      return [newItem, ...currentHistory].slice(0, 20)
    })
  }

  const loadFromHistory = (item: QRHistoryItem) => {
    setText(item.text)
    setOptions(item.options)
  }

  const removeFromHistory = (itemId: string) => {
    setQrHistory((currentHistory) => 
      currentHistory.filter(item => item.id !== itemId)
    )
  }

  const clearHistory = () => {
    setQrHistory([])
  }

  const generateQR = async (input: string) => {
    if (!input.trim()) {
      setQrDataUrl('')
      setQrSvg('')
      return
    }

    setIsGenerating(true)
    try {
      // Generate SVG version
      const svgString = await QRCode.toString(input, {
        type: 'svg',
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.colorDark,
          light: options.colorLight
        },
        errorCorrectionLevel: 'M'
      })
      
      setQrSvg(svgString)

      // Generate PNG version
      const dataUrl = await QRCode.toDataURL(input, {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.colorDark,
          light: options.colorLight
        },
        errorCorrectionLevel: 'M',
        rendererOpts: {
          quality: 0.92
        }
      })
      setQrDataUrl(dataUrl)
      

    } catch (error) {
      console.error('Error generating QR code:', error)
      setQrDataUrl('')
      setQrSvg('')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR(text)
    }, 100)

    return () => clearTimeout(timer)
  }, [text, options])

  const downloadQR = async (format: 'png' | 'svg' = 'png') => {
    if (!text.trim()) return

    try {
      if (format === 'svg') {
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      } else {
        // Use the standard method for PNG download
        const canvas = document.createElement('canvas')
        await QRCode.toCanvas(canvas, text, {
          width: 512,
          margin: 3,
          color: {
            dark: options.colorDark,
            light: options.colorLight
          },
          errorCorrectionLevel: 'H'
        })

        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      
      // Save to history only when user actually exports the QR code
      saveToHistory(text, options)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const characterCount = text.length
  const isOverLimit = characterCount > MAX_CHARACTERS
  const displayText = isOverLimit ? text.slice(0, MAX_CHARACTERS) : text

  return (
    <div className="flex-1 bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <QrCode size={28} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">QR Generator</h1>
          </div>
          <p className="text-sm text-muted-foreground">Convert any text or URL into a QR code and download as PNG or SVG.</p>
          <p className="text-sm text-muted-foreground">No trackers. No ads. Forever free, as it should be.</p>
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
            <CardTitle className="text-lg">Customize</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Select 
                value={options.size.toString()} 
                onValueChange={(value) => 
                  setOptions(prev => ({ ...prev, size: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="200">Small (200px)</SelectItem>
                  <SelectItem value="256">Medium (256px)</SelectItem>
                  <SelectItem value="320">Large (320px)</SelectItem>
                  <SelectItem value="400">Extra Large (400px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Color Presets</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1"
                  onClick={() => setOptions(prev => ({ ...prev, colorDark: '#000000', colorLight: '#FFFFFF' }))}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-black rounded-sm"></div>
                    <div className="w-3 h-3 bg-white border rounded-sm"></div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1"
                  onClick={() => setOptions(prev => ({ ...prev, colorDark: '#1e40af', colorLight: '#eff6ff' }))}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-blue-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-50 border rounded-sm"></div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1"
                  onClick={() => setOptions(prev => ({ ...prev, colorDark: '#166534', colorLight: '#f0fdf4' }))}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-50 border rounded-sm"></div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 p-1"
                  onClick={() => setOptions(prev => ({ ...prev, colorDark: '#dc2626', colorLight: '#fef2f2' }))}
                >
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-red-50 border rounded-sm"></div>
                  </div>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color-dark" className="text-sm font-medium">Foreground Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color-dark"
                    type="color"
                    value={options.colorDark}
                    onChange={(e) => setOptions(prev => ({ ...prev, colorDark: e.target.value }))}
                    className="w-12 h-8 p-1 border-2 rounded cursor-pointer"
                  />
                  <Input
                    value={options.colorDark}
                    onChange={(e) => setOptions(prev => ({ ...prev, colorDark: e.target.value }))}
                    className="font-mono text-xs"
                    placeholder="#262626"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-light" className="text-sm font-medium">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color-light"
                    type="color"
                    value={options.colorLight}
                    onChange={(e) => setOptions(prev => ({ ...prev, colorLight: e.target.value }))}
                    className="w-12 h-8 p-1 border-2 rounded cursor-pointer"
                  />
                  <Input
                    value={options.colorLight}
                    onChange={(e) => setOptions(prev => ({ ...prev, colorLight: e.target.value }))}
                    className="font-mono text-xs"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
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
                ) : qrSvg ? (
                  <div 
                    className="w-64 h-64 rounded-lg shadow-sm border flex items-center justify-center p-2"
                    style={{ backgroundColor: options.colorLight }}
                  >
                    <div 
                      className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Enter text to generate QR code</p>
                    </div>
                  </div>
                )}
              </div>
              
              {qrSvg && (
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => downloadQR('png')}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <FileImage size={16} className="mr-2" />
                    PNG
                  </Button>
                  <Button 
                    onClick={() => downloadQR('svg')}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileSvg size={16} className="mr-2" />
                    SVG
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {qrHistory.length > 0 && (
          <Card>
            <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-4 cursor-pointer hover:bg-muted/50 rounded-t-lg transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock size={20} className="text-muted-foreground" />
                      History ({qrHistory.length})
                    </CardTitle>
                    <ChevronDown 
                      size={16} 
                      className={`text-muted-foreground transition-transform duration-200 ${
                        isHistoryOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Previously exported QR codes
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
                    >
                      Clear all
                    </Button>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {qrHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.text.length > 40 
                                ? `${item.text.substring(0, 40)}...` 
                                : item.text
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()} at{' '}
                              {new Date(item.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => loadFromHistory(item)}
                              title="Load this QR code"
                            >
                              <Copy size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-destructive"
                              onClick={() => removeFromHistory(item.id)}
                              title="Remove from history"
                            >
                              <Trash size={12} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
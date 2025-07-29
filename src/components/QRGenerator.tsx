import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Download, QrCode, FileImage, FileSvg, Upload, X } from '@phosphor-icons/react'

const MAX_CHARACTERS = 2000

interface QROptions {
  colorDark: string
  colorLight: string
  size: number
  margin: number
}

interface LogoOptions {
  file: File | null
  dataUrl: string
  size: number // percentage of QR code size (10-40)
  x: number // position as percentage (0-100)
  y: number // position as percentage (0-100)
}

export default function QRGenerator() {
  const [text, setText] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [qrSvg, setQrSvg] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [options, setOptions] = useState<QROptions>({
    colorDark: '#262626',
    colorLight: '#FFFFFF',
    size: 256,
    margin: 2
  })

  const [logoOptions, setLogoOptions] = useState<LogoOptions>({
    file: null,
    dataUrl: '',
    size: 20,
    x: 50,
    y: 50
  })

  const isUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return str.startsWith('http://') || str.startsWith('https://') || str.includes('.')
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setLogoOptions(prev => ({
        ...prev,
        file,
        dataUrl
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoOptions({
      file: null,
      dataUrl: '',
      size: 20,
      x: 50,
      y: 50
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createLogoOverlay = async (qrCanvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    if (!logoOptions.dataUrl) return qrCanvas

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = qrCanvas.width
    canvas.height = qrCanvas.height

    // Draw QR code
    ctx.drawImage(qrCanvas, 0, 0)

    // Load and draw logo
    return new Promise((resolve) => {
      const logoImg = new Image()
      logoImg.onload = () => {
        const logoSize = (canvas.width * logoOptions.size) / 100
        const logoX = (canvas.width * logoOptions.x) / 100 - logoSize / 2
        const logoY = (canvas.height * logoOptions.y) / 100 - logoSize / 2

        // Draw white background circle for logo
        ctx.fillStyle = options.colorLight
        ctx.beginPath()
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 4, 0, 2 * Math.PI)
        ctx.fill()

        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        
        resolve(canvas)
      }
      logoImg.src = logoOptions.dataUrl
    })
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
        errorCorrectionLevel: 'H' // Higher error correction for logo overlay
      })
      
      setQrSvg(svgString)

      // Generate PNG version with logo overlay if needed
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, input, {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.colorDark,
          light: options.colorLight
        },
        errorCorrectionLevel: 'H' // Higher error correction for logo overlay
      })

      let finalCanvas = canvas
      if (logoOptions.dataUrl) {
        finalCanvas = await createLogoOverlay(canvas)
      }

      setQrDataUrl(finalCanvas.toDataURL())
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
  }, [text, options, logoOptions])

  const downloadQR = async (format: 'png' | 'svg' = 'png') => {
    if (!text.trim()) return

    try {
      if (format === 'svg') {
        // For SVG, we need to manually add logo if present
        let finalSvg = qrSvg
        
        if (logoOptions.dataUrl) {
          // Insert logo into SVG
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(qrSvg, 'image/svg+xml')
          const svgElement = svgDoc.querySelector('svg')
          
          if (svgElement) {
            const svgWidth = parseFloat(svgElement.getAttribute('width') || '256')
            const svgHeight = parseFloat(svgElement.getAttribute('height') || '256')
            
            const logoSize = (svgWidth * logoOptions.size) / 100
            const logoX = (svgWidth * logoOptions.x) / 100 - logoSize / 2
            const logoY = (svgHeight * logoOptions.y) / 100 - logoSize / 2

            // Add background circle
            const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
            circle.setAttribute('cx', (logoX + logoSize/2).toString())
            circle.setAttribute('cy', (logoY + logoSize/2).toString())
            circle.setAttribute('r', (logoSize/2 + 4).toString())
            circle.setAttribute('fill', options.colorLight)
            svgElement.appendChild(circle)

            // Add logo image
            const imageElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
            imageElement.setAttribute('href', logoOptions.dataUrl)
            imageElement.setAttribute('x', logoX.toString())
            imageElement.setAttribute('y', logoY.toString())
            imageElement.setAttribute('width', logoSize.toString())
            imageElement.setAttribute('height', logoSize.toString())
            svgElement.appendChild(imageElement)
            
            finalSvg = new XMLSerializer().serializeToString(svgDoc)
          }
        }

        const blob = new Blob([finalSvg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      } else {
        // For PNG, generate with high resolution and logo overlay
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

        let finalCanvas = canvas
        if (logoOptions.dataUrl) {
          finalCanvas = await createLogoOverlay(canvas)
        }

        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = finalCanvas.toDataURL()
        link.click()
      }
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
            <CardTitle className="text-lg">Logo Overlay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Logo</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload size={16} className="mr-2" />
                  {logoOptions.file ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoOptions.file && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={removeLogo}
                    className="text-destructive hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
              {logoOptions.file && (
                <p className="text-xs text-muted-foreground">
                  {logoOptions.file.name} ({Math.round(logoOptions.file.size / 1024)}KB)
                </p>
              )}
            </div>

            {logoOptions.dataUrl && (
              <>
                <Separator />
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Logo Size</Label>
                      <span className="text-xs text-muted-foreground">{logoOptions.size}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={logoOptions.size}
                      onChange={(e) => setLogoOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">X Position</Label>
                        <span className="text-xs text-muted-foreground">{logoOptions.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={logoOptions.x}
                        onChange={(e) => setLogoOptions(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Y Position</Label>
                        <span className="text-xs text-muted-foreground">{logoOptions.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={logoOptions.y}
                        onChange={(e) => setLogoOptions(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
                  <div className="w-64 h-64 rounded-lg shadow-sm border flex items-center justify-center p-2">
                    <img 
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="w-full h-full object-contain"
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
              
              {qrDataUrl && (
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

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
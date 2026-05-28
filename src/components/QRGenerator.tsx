import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import {
  AddressBook,
  CaretDown,
  ChatCircle,
  Clock,
  Copy,
  Download,
  Envelope,
  FileImage,
  FileSvg,
  MapPin,
  Phone,
  QrCode,
  Trash,
  WifiHigh,
} from '@phosphor-icons/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MAX_CHARACTERS = 2000

type TemplateFieldType = 'text' | 'email' | 'tel' | 'password'

interface QRTemplate {
  name: string
  icon: ReactNode
  description: string
  fields: {
    label: string
    key: string
    type: TemplateFieldType
    placeholder: string
    required?: boolean
  }[]
  generateText: (values: Record<string, string>) => string
}

const QR_TEMPLATES: QRTemplate[] = [
  {
    name: 'WiFi Network',
    icon: <WifiHigh aria-hidden="true" weight="bold" />,
    description: 'Connect to WiFi network automatically',
    fields: [
      { label: 'Network Name (SSID)', key: 'ssid', type: 'text', placeholder: 'MyWiFiNetwork', required: true },
      { label: 'Password', key: 'password', type: 'password', placeholder: 'WiFi password' },
      { label: 'Security Type', key: 'security', type: 'text', placeholder: 'WPA (leave empty for open)' },
    ],
    generateText: (values) => {
      const security = values.security || 'WPA'
      const password = values.password || ''
      return `WIFI:T:${security};S:${values.ssid};P:${password};H:false;;`
    },
  },
  {
    name: 'Contact Card',
    icon: <AddressBook aria-hidden="true" weight="bold" />,
    description: 'Save contact information directly to phone',
    fields: [
      { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe', required: true },
      { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1234567890' },
      { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
      { label: 'Organization', key: 'org', type: 'text', placeholder: 'Company Name' },
      { label: 'Website', key: 'url', type: 'text', placeholder: 'https://example.com' },
    ],
    generateText: (values) => [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${values.name}`,
      values.phone ? `TEL:${values.phone}` : '',
      values.email ? `EMAIL:${values.email}` : '',
      values.org ? `ORG:${values.org}` : '',
      values.url ? `URL:${values.url}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n'),
  },
  {
    name: 'Email',
    icon: <Envelope aria-hidden="true" weight="bold" />,
    description: 'Pre-compose an email message',
    fields: [
      { label: 'Email Address', key: 'email', type: 'email', placeholder: 'recipient@example.com', required: true },
      { label: 'Subject', key: 'subject', type: 'text', placeholder: 'Email subject' },
      { label: 'Message', key: 'body', type: 'text', placeholder: 'Email message' },
    ],
    generateText: (values) => {
      let mailto = `mailto:${values.email}`
      const params = []
      if (values.subject) params.push(`subject=${encodeURIComponent(values.subject)}`)
      if (values.body) params.push(`body=${encodeURIComponent(values.body)}`)
      if (params.length > 0) mailto += `?${params.join('&')}`
      return mailto
    },
  },
  {
    name: 'Phone Call',
    icon: <Phone aria-hidden="true" weight="bold" />,
    description: 'Dial a phone number directly',
    fields: [
      { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1234567890', required: true },
    ],
    generateText: (values) => `tel:${values.phone}`,
  },
  {
    name: 'SMS Message',
    icon: <ChatCircle aria-hidden="true" weight="bold" />,
    description: 'Send a pre-written text message',
    fields: [
      { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1234567890', required: true },
      { label: 'Message', key: 'message', type: 'text', placeholder: 'Your message here' },
    ],
    generateText: (values) => {
      let sms = `sms:${values.phone}`
      if (values.message) sms += `?body=${encodeURIComponent(values.message)}`
      return sms
    },
  },
  {
    name: 'Location',
    icon: <MapPin aria-hidden="true" weight="bold" />,
    description: 'Share GPS coordinates or address',
    fields: [
      { label: 'Latitude', key: 'lat', type: 'text', placeholder: '40.7128', required: true },
      { label: 'Longitude', key: 'lng', type: 'text', placeholder: '-74.0060', required: true },
      { label: 'Label (optional)', key: 'label', type: 'text', placeholder: 'My Location' },
    ],
    generateText: (values) => {
      const geo = `geo:${values.lat},${values.lng}`
      if (values.label) return `${geo}?q=${values.lat},${values.lng}(${encodeURIComponent(values.label)})`
      return geo
    },
  },
]

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

const COLOR_PRESETS = [
  { name: 'Classic', dark: '#111827', light: '#ffffff' },
  { name: 'Slate', dark: '#f8fafc', light: '#0f172a' },
  { name: 'Blue', dark: '#1d4ed8', light: '#eff6ff' },
  { name: 'Green', dark: '#166534', light: '#f0fdf4' },
]

const helperTextId = 'qr-text-helper'

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate | null>(null)
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({})
  const [qrHistory, setQrHistory] = useState<QRHistoryItem[]>([])
  const [options, setOptions] = useState<QROptions>({
    colorDark: '#111827',
    colorLight: '#ffffff',
    size: 256,
    margin: 2,
  })

  const characterCount = text.length
  const isOverLimit = characterCount > MAX_CHARACTERS
  const displayText = isOverLimit ? text.slice(0, MAX_CHARACTERS) : text

  const isUrl = (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return value.startsWith('http://') || value.startsWith('https://') || value.includes('.')
    }
  }

  const saveToHistory = (inputText: string, qrOptions: QROptions) => {
    if (!inputText.trim()) return

    setQrHistory((currentHistory) => {
      const existingIndex = currentHistory.findIndex(
        (item) => item.text === inputText && JSON.stringify(item.options) === JSON.stringify(qrOptions),
      )

      if (existingIndex !== -1) {
        const existing = currentHistory[existingIndex]
        return [
          { ...existing, createdAt: Date.now() },
          ...currentHistory.filter((_, index) => index !== existingIndex),
        ]
      }

      const newItem: QRHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        text: inputText,
        createdAt: Date.now(),
        options: { ...qrOptions },
      }

      return [newItem, ...currentHistory].slice(0, 20)
    })
  }

  const loadFromHistory = (item: QRHistoryItem) => {
    setText(item.text)
    setOptions(item.options)
  }

  const selectTemplate = (template: QRTemplate) => {
    setSelectedTemplate(template)
    setTemplateValues({})
    setText('')
  }

  const clearTemplate = () => {
    setSelectedTemplate(null)
    setTemplateValues({})
  }

  const updateTemplateValue = (key: string, value: string) => {
    const newValues = { ...templateValues, [key]: value }
    setTemplateValues(newValues)

    if (!selectedTemplate) return

    const allRequiredFilled = selectedTemplate.fields
      .filter((field) => field.required)
      .every((field) => newValues[field.key]?.trim())

    setText(allRequiredFilled ? selectedTemplate.generateText(newValues) : '')
  }

  const generateQR = async (input: string) => {
    if (!input.trim()) {
      setQrDataUrl('')
      setQrSvg('')
      return
    }

    setIsGenerating(true)
    try {
      const qrOptions = {
        width: options.size,
        margin: options.margin,
        color: {
          dark: options.colorDark,
          light: options.colorLight,
        },
        errorCorrectionLevel: 'M' as const,
      }

      const [svgString, dataUrl] = await Promise.all([
        QRCode.toString(input, { ...qrOptions, type: 'svg' }),
        QRCode.toDataURL(input, { ...qrOptions, rendererOpts: { quality: 0.92 } }),
      ])

      setQrSvg(svgString)
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
      generateQR(displayText)
    }, 100)

    return () => clearTimeout(timer)
  }, [displayText, options])

  const downloadQR = async (format: 'png' | 'svg' = 'png') => {
    if (!displayText.trim()) return

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
        const canvas = document.createElement('canvas')
        await QRCode.toCanvas(canvas, displayText, {
          width: 512,
          margin: 3,
          color: {
            dark: options.colorDark,
            light: options.colorLight,
          },
          errorCorrectionLevel: 'H',
        })

        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }

      saveToHistory(displayText, options)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section aria-labelledby="page-title" className="rounded-xl border bg-card p-5 text-card-foreground shadow-none sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge variant="secondary" className="w-fit gap-2 rounded-md px-3 py-1">
              <QrCode aria-hidden="true" size={16} weight="bold" />
              Plain shadcn QR tool
            </Badge>
            <h1 id="page-title" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              QR Generator
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              A flat, high-contrast workspace with clear sections, steady spacing, and no decorative effects.
            </p>
          </div>
          <div className="rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">ADHD-friendly:</span> calm colors, predictable layout, focused actions.
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Create QR Code</CardTitle>
                  <CardDescription>Enter content manually or choose one guided template.</CardDescription>
                </div>
                <Badge variant={isOverLimit ? 'destructive' : 'outline'} aria-live="polite" className="w-fit">
                  {characterCount}/{MAX_CHARACTERS}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual" className="gap-4">
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg shadow-none">
                  <TabsTrigger value="manual" onClick={clearTemplate} className="min-h-11 shadow-none data-[state=active]:shadow-none">
                    Manual Input
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="min-h-11 shadow-none data-[state=active]:shadow-none">
                    Templates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-4">
                  <div className="space-y-3">
                    <Label htmlFor="text-input">Text or URL</Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Enter text or paste a URL..."
                      aria-describedby={helperTextId}
                      aria-invalid={isOverLimit}
                      className="min-h-32 resize-y text-base leading-7 shadow-none md:text-base"
                    />
                    <div id={helperTextId} className="space-y-2 text-sm" aria-live="polite">
                      <p className="text-muted-foreground">Preview updates after you pause typing. Long text is limited for reliable QR scanning.</p>
                      {text && isUrl(text) && <p className="font-medium text-primary">Detected URL format.</p>}
                      {isOverLimit && <p className="font-medium text-destructive">Text will be truncated to {MAX_CHARACTERS} characters.</p>}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {QR_TEMPLATES.map((template) => (
                        <Button
                          key={template.name}
                          type="button"
                          variant={selectedTemplate?.name === template.name ? 'default' : 'outline'}
                          className="min-h-14 justify-start rounded-lg px-4 shadow-none"
                          onClick={() => selectTemplate(template)}
                          aria-pressed={selectedTemplate?.name === template.name}
                        >
                          {template.icon}
                          <span>{template.name}</span>
                        </Button>
                      ))}
                    </div>

                    {selectedTemplate && (
                      <div className="rounded-xl border bg-background p-4">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                              {selectedTemplate.icon}
                              {selectedTemplate.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={clearTemplate}>
                            Clear
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {selectedTemplate.fields.map((field) => {
                            const fieldId = `template-${selectedTemplate.name}-${field.key}`.replace(/\s+/g, '-').toLowerCase()
                            return (
                              <div key={field.key} className="space-y-2">
                                <Label htmlFor={fieldId}>
                                  {field.label}
                                  {field.required && <span className="ml-1 text-destructive" aria-label="required">*</span>}
                                </Label>
                                <Input
                                  id={fieldId}
                                  type={field.type}
                                  value={templateValues[field.key] || ''}
                                  onChange={(event) => updateTemplateValue(field.key, event.target.value)}
                                  placeholder={field.placeholder}
                                  required={field.required}
                                  className="min-h-11 text-base shadow-none md:text-base"
                                />
                              </div>
                            )
                          })}
                        </div>

                        {text && (
                          <div className="mt-4 rounded-lg border bg-muted p-3" aria-live="polite">
                            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">Generated Content</Label>
                            <p className="break-all font-mono text-sm leading-6 text-foreground">{text}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Customize</CardTitle>
              <CardDescription>Choose readable QR colors and a comfortable preview size.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="size-select">Size</Label>
                <Select
                  value={options.size.toString()}
                  onValueChange={(value) => setOptions((prev) => ({ ...prev, size: Number.parseInt(value, 10) }))}
                >
                  <SelectTrigger id="size-select" className="min-h-11 w-full shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="shadow-none">
                    <SelectItem value="200">Small (200px)</SelectItem>
                    <SelectItem value="256">Medium (256px)</SelectItem>
                    <SelectItem value="320">Large (320px)</SelectItem>
                    <SelectItem value="400">Extra Large (400px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label asChild>
                  <span>Color Presets</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {COLOR_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      className="min-h-11 justify-start rounded-lg shadow-none"
                      onClick={() => setOptions((prev) => ({ ...prev, colorDark: preset.dark, colorLight: preset.light }))}
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-3 rounded-sm border" style={{ backgroundColor: preset.dark }} aria-hidden="true" />
                        <span className="size-3 rounded-sm border" style={{ backgroundColor: preset.light }} aria-hidden="true" />
                        {preset.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="color-dark">Foreground Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-dark"
                      type="color"
                      value={options.colorDark}
                      onChange={(event) => setOptions((prev) => ({ ...prev, colorDark: event.target.value }))}
                      className="h-11 w-14 shrink-0 cursor-pointer p-1 shadow-none"
                      aria-label="Foreground color picker"
                    />
                    <Input
                      value={options.colorDark}
                      onChange={(event) => setOptions((prev) => ({ ...prev, colorDark: event.target.value }))}
                      className="min-h-11 font-mono text-base shadow-none md:text-sm"
                      aria-label="Foreground color hex value"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-light">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-light"
                      type="color"
                      value={options.colorLight}
                      onChange={(event) => setOptions((prev) => ({ ...prev, colorLight: event.target.value }))}
                      className="h-11 w-14 shrink-0 cursor-pointer p-1 shadow-none"
                      aria-label="Background color picker"
                    />
                    <Input
                      value={options.colorLight}
                      onChange={(event) => setOptions((prev) => ({ ...prev, colorLight: event.target.value }))}
                      className="min-h-11 font-mono text-base shadow-none md:text-sm"
                      aria-label="Background color hex value"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6" aria-label="QR preview and history">
          <Card className="shadow-none">
            <CardHeader className="text-center">
              <CardTitle>QR Code</CardTitle>
              <CardDescription>Preview updates automatically as you type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="flex min-h-72 w-full items-center justify-center rounded-xl border bg-muted p-4" role="status" aria-live="polite">
                  {isGenerating ? (
                    <p className="text-sm text-muted-foreground">Generating QR code…</p>
                  ) : qrDataUrl ? (
                    <img src={qrDataUrl} width={options.size} height={options.size} alt="Generated QR code" className="h-auto max-w-full rounded-md border bg-white" />
                  ) : (
                    <div className="space-y-3 text-center text-muted-foreground">
                      <QrCode aria-hidden="true" size={52} className="mx-auto" />
                      <p className="text-sm">Enter text to generate QR code.</p>
                    </div>
                  )}
                </div>

                {qrDataUrl && (
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Button type="button" className="min-h-11 shadow-none" onClick={() => downloadQR('png')}>
                      <FileImage aria-hidden="true" weight="bold" />
                      Download PNG
                    </Button>
                    <Button type="button" variant="outline" className="min-h-11 shadow-none" onClick={() => downloadQR('svg')}>
                      <FileSvg aria-hidden="true" weight="bold" />
                      Download SVG
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {qrHistory.length > 0 && (
            <Card className="shadow-none">
              <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex min-h-14 w-full justify-between rounded-b-none px-6 shadow-none"
                    aria-label={`${isHistoryOpen ? 'Hide' : 'Show'} QR history`}
                  >
                    <span className="flex items-center gap-2 text-base font-semibold">
                      <Clock aria-hidden="true" weight="bold" />
                      History ({qrHistory.length})
                    </span>
                    <CaretDown aria-hidden="true" className={cn(isHistoryOpen && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">Previously exported QR codes</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setQrHistory([])}>
                        Clear all
                      </Button>
                    </div>
                    <ScrollArea className="h-56 pr-3">
                      <div className="space-y-2">
                        {qrHistory.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{item.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()} at{' '}
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => loadFromHistory(item)} aria-label="Load this QR code">
                              <Copy aria-hidden="true" size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setQrHistory((history) => history.filter((entry) => entry.id !== item.id))}
                              aria-label="Remove from history"
                            >
                              <Trash aria-hidden="true" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </aside>
      </div>
    </main>
  )
}

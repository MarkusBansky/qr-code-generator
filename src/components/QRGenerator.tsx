import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  Badge,
  Box,
  Button,
  Callout,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  IconButton,
  Inset,
  ScrollArea,
  Section,
  Select,
  Separator,
  Tabs,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  CaretDownIcon,
  ChatBubbleIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  MobileIcon,
  PersonIcon,
  SewingPinIcon,
  TrashIcon,
} from '@radix-ui/react-icons'

const MAX_CHARACTERS = 2000

type TemplateFieldType = 'text' | 'email' | 'tel' | 'password'

interface QRTemplate {
  name: string
  icon: React.ReactNode
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
    icon: <GlobeIcon />,
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
    icon: <PersonIcon />,
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
    icon: <EnvelopeClosedIcon />,
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
    icon: <MobileIcon />,
    description: 'Dial a phone number directly',
    fields: [
      { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1234567890', required: true },
    ],
    generateText: (values) => `tel:${values.phone}`,
  },
  {
    name: 'SMS Message',
    icon: <ChatBubbleIcon />,
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
    icon: <SewingPinIcon />,
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
  { name: 'Classic', dark: '#0f172a', light: '#ffffff' },
  { name: 'Cyan', dark: '#06b6d4', light: '#08111c' },
  { name: 'Violet', dark: '#a78bfa', light: '#111827' },
  { name: 'Amber', dark: '#f59e0b', light: '#111111' },
]

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
    colorDark: '#0f172a',
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
    <Section size="3" className="app-shell">
      <Container size="4">
        <Flex direction="column" gap="6">
          <Flex direction="column" align="center" gap="3" className="hero-copy">
            <Badge size="3" variant="soft" color="cyan">
              <CodeIcon /> Dark Radix QR Studio
            </Badge>
            <Heading size="9" align="center" trim="start">
              QR Generator
            </Heading>
            <Text size="3" color="gray" align="center" className="hero-subtitle">
              Generate QR codes from text, URLs, or guided templates with a focused dark Radix interface.
            </Text>
          </Flex>

          <Grid columns={{ initial: '1', lg: '2' }} gap="5" align="start">
            <Flex direction="column" gap="5">
              <Card size="4" className="glass-card">
                <Flex direction="column" gap="4">
                  <Flex justify="between" align="start" gap="3">
                    <Box>
                      <Heading size="5">Create QR Code</Heading>
                      <Text size="2" color="gray">Start manually or choose a Radix-powered template.</Text>
                    </Box>
                    <Badge color={isOverLimit ? 'red' : 'gray'} variant="soft">
                      {characterCount}/{MAX_CHARACTERS}
                    </Badge>
                  </Flex>

                  <Tabs.Root defaultValue="manual">
                    <Tabs.List>
                      <Tabs.Trigger value="manual" onClick={clearTemplate}>Manual Input</Tabs.Trigger>
                      <Tabs.Trigger value="templates">Templates</Tabs.Trigger>
                    </Tabs.List>

                    <Box pt="4">
                      <Tabs.Content value="manual">
                        <Flex direction="column" gap="3">
                          <Text as="label" size="2" weight="medium" htmlFor="text-input">Text or URL</Text>
                          <TextArea
                            id="text-input"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Enter text or paste a URL..."
                            size="3"
                            resize="vertical"
                          />
                          {text && isUrl(text) && <Text size="2" color="cyan">✓ Detected URL format</Text>}
                          {isOverLimit && (
                            <Callout.Root color="red" variant="soft">
                              <Callout.Text>Text will be truncated to {MAX_CHARACTERS} characters.</Callout.Text>
                            </Callout.Root>
                          )}
                        </Flex>
                      </Tabs.Content>

                      <Tabs.Content value="templates">
                        <Flex direction="column" gap="4">
                          <Grid columns={{ initial: '1', sm: '2' }} gap="3">
                            {QR_TEMPLATES.map((template) => (
                              <Button
                                key={template.name}
                                variant={selectedTemplate?.name === template.name ? 'solid' : 'soft'}
                                color={selectedTemplate?.name === template.name ? 'cyan' : 'gray'}
                                size="3"
                                className="template-button"
                                onClick={() => selectTemplate(template)}
                              >
                                {template.icon}
                                {template.name}
                              </Button>
                            ))}
                          </Grid>

                          {selectedTemplate && (
                            <Card variant="surface">
                              <Flex direction="column" gap="4">
                                <Flex justify="between" align="start" gap="3">
                                  <Box>
                                    <Flex gap="2" align="center">
                                      {selectedTemplate.icon}
                                      <Heading size="4">{selectedTemplate.name}</Heading>
                                    </Flex>
                                    <Text size="2" color="gray">{selectedTemplate.description}</Text>
                                  </Box>
                                  <Button variant="ghost" color="gray" size="2" onClick={clearTemplate}>Clear</Button>
                                </Flex>

                                <Grid columns={{ initial: '1', sm: '2' }} gap="3">
                                  {selectedTemplate.fields.map((field) => (
                                    <Flex key={field.key} direction="column" gap="2">
                                      <Text as="label" size="2" weight="medium">
                                        {field.label}{field.required && <Text color="red"> *</Text>}
                                      </Text>
                                      <TextField.Root
                                        type={field.type}
                                        value={templateValues[field.key] || ''}
                                        onChange={(event) => updateTemplateValue(field.key, event.target.value)}
                                        placeholder={field.placeholder}
                                      />
                                    </Flex>
                                  ))}
                                </Grid>

                                {text && (
                                  <Callout.Root color="cyan" variant="soft">
                                    <Callout.Icon><FileTextIcon /></Callout.Icon>
                                    <Callout.Text className="generated-content">{text}</Callout.Text>
                                  </Callout.Root>
                                )}
                              </Flex>
                            </Card>
                          )}
                        </Flex>
                      </Tabs.Content>
                    </Box>
                  </Tabs.Root>
                </Flex>
              </Card>

              <Card size="4" className="glass-card">
                <Flex direction="column" gap="4">
                  <Box>
                    <Heading size="5">Customize</Heading>
                    <Text size="2" color="gray">Fine-tune size and contrast while staying in the dark theme.</Text>
                  </Box>

                  <Flex direction="column" gap="2">
                    <Text as="label" size="2" weight="medium">Size</Text>
                    <Select.Root
                      value={options.size.toString()}
                      onValueChange={(value) => setOptions((prev) => ({ ...prev, size: Number.parseInt(value, 10) }))}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="200">Small (200px)</Select.Item>
                        <Select.Item value="256">Medium (256px)</Select.Item>
                        <Select.Item value="320">Large (320px)</Select.Item>
                        <Select.Item value="400">Extra Large (400px)</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Separator size="4" />

                  <Flex direction="column" gap="3">
                    <Text size="2" weight="medium">Color Presets</Text>
                    <Grid columns={{ initial: '2', sm: '4' }} gap="2">
                      {COLOR_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="soft"
                          color="gray"
                          onClick={() => setOptions((prev) => ({ ...prev, colorDark: preset.dark, colorLight: preset.light }))}
                        >
                          <Flex gap="2" align="center">
                            <Box className="swatch" style={{ backgroundColor: preset.dark }} />
                            <Box className="swatch" style={{ backgroundColor: preset.light }} />
                            {preset.name}
                          </Flex>
                        </Button>
                      ))}
                    </Grid>
                  </Flex>

                  <Grid columns={{ initial: '1', sm: '2' }} gap="3">
                    <Flex direction="column" gap="2">
                      <Text as="label" size="2" weight="medium" htmlFor="color-dark">Foreground Color</Text>
                      <TextField.Root
                        id="color-dark"
                        value={options.colorDark}
                        onChange={(event) => setOptions((prev) => ({ ...prev, colorDark: event.target.value }))}
                        placeholder="#0f172a"
                      />
                    </Flex>
                    <Flex direction="column" gap="2">
                      <Text as="label" size="2" weight="medium" htmlFor="color-light">Background Color</Text>
                      <TextField.Root
                        id="color-light"
                        value={options.colorLight}
                        onChange={(event) => setOptions((prev) => ({ ...prev, colorLight: event.target.value }))}
                        placeholder="#ffffff"
                      />
                    </Flex>
                  </Grid>
                </Flex>
              </Card>
            </Flex>

            <Flex direction="column" gap="5" className="preview-column">
              <Card size="4" className="glass-card preview-card">
                <Flex direction="column" gap="4" align="center">
                  <Flex direction="column" gap="1" align="center">
                    <Heading size="5">QR Code</Heading>
                    <Text size="2" color="gray" align="center">Preview updates automatically as you type.</Text>
                  </Flex>

                  <Inset clip="padding-box" p="current">
                    <Flex align="center" justify="center" className="qr-frame">
                      {isGenerating ? (
                        <Text color="gray">Generating...</Text>
                      ) : qrDataUrl ? (
                        <img src={qrDataUrl} width={options.size} height={options.size} alt="Generated QR code" className="qr-image" />
                      ) : (
                        <Flex direction="column" align="center" gap="3" className="empty-state">
                          <CodeIcon width="48" height="48" />
                          <Text size="2" color="gray" align="center">Enter text to generate QR code</Text>
                        </Flex>
                      )}
                    </Flex>
                  </Inset>

                  {qrDataUrl && (
                    <Grid columns="2" gap="3" width="100%">
                      <Button size="3" color="cyan" onClick={() => downloadQR('png')}>
                        <ImageIcon /> PNG
                      </Button>
                      <Button size="3" variant="soft" color="gray" onClick={() => downloadQR('svg')}>
                        <DownloadIcon /> SVG
                      </Button>
                    </Grid>
                  )}
                </Flex>
              </Card>

              {qrHistory.length > 0 && (
                <Card size="4" className="glass-card">
                  <Collapsible.Root open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <Collapsible.Trigger asChild>
                      <Button variant="ghost" color="gray" className="history-trigger">
                        <Flex justify="between" align="center" width="100%">
                          <Flex gap="2" align="center">
                            <ClockIcon />
                            <Heading size="4">History ({qrHistory.length})</Heading>
                          </Flex>
                          <CaretDownIcon className={isHistoryOpen ? 'rotate-icon' : ''} />
                        </Flex>
                      </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <Flex direction="column" gap="3" mt="4">
                        <Flex justify="between" align="center" gap="3">
                          <Text size="2" color="gray">Previously exported QR codes</Text>
                          <Button variant="ghost" color="red" size="2" onClick={() => setQrHistory([])}>Clear all</Button>
                        </Flex>
                        <ScrollArea type="auto" scrollbars="vertical" style={{ height: 220 }}>
                          <Flex direction="column" gap="2" pr="3">
                            {qrHistory.map((item) => (
                              <Card key={item.id} variant="surface">
                                <Flex align="center" gap="3">
                                  <Box flexGrow="1" className="history-text">
                                    <Text size="2" weight="medium" truncate>{item.text}</Text>
                                    <Text size="1" color="gray">
                                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                  </Box>
                                  <IconButton variant="ghost" color="gray" title="Load this QR code" onClick={() => loadFromHistory(item)}>
                                    <CopyIcon />
                                  </IconButton>
                                  <IconButton variant="ghost" color="red" title="Remove from history" onClick={() => setQrHistory((history) => history.filter((entry) => entry.id !== item.id))}>
                                    <TrashIcon />
                                  </IconButton>
                                </Flex>
                              </Card>
                            ))}
                          </Flex>
                        </ScrollArea>
                      </Flex>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Card>
              )}
            </Flex>
          </Grid>
        </Flex>
      </Container>
    </Section>
  )
}

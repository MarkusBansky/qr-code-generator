# QR Code Generator - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: Provide a simple, privacy-focused QR code generator that converts text/URLs into customizable QR codes with both PNG and SVG export options.
- **Success Indicators**: Users can quickly generate QR codes, customize their appearance, and download them in their preferred format without privacy concerns.
- **Experience Qualities**: Clean, Professional, Accessible

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Creating (generating and customizing QR codes for download)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Users need QR codes for various purposes but want control over appearance and format, plus privacy assurance.
- **User Context**: Quick one-off QR code generation for business cards, websites, sharing, presentations, etc.
- **Critical Path**: Choose input method (manual/template) → Enter content → Customize appearance → Download in preferred format (with optional history access)
- **Key Moments**: 
  1. Template selection and guided form completion for structured data
  2. Real-time QR code generation as user types or fills template fields
  3. Visual customization with live preview
  4. Format choice (PNG vs SVG) for different use cases
  5. Access to previous QR codes through history

## Essential Features

### Input Management
- **Manual Input**: Real-time QR code generation with debounced input processing
- **Template System**: Pre-configured templates for common QR code use cases:
  - **WiFi Network**: Auto-generate WiFi connection QR codes with SSID, password, and security type
  - **Contact Card**: Create vCard format for saving contact information (name, phone, email, organization, website)
  - **Email**: Pre-compose email messages with recipient, subject, and body
  - **Phone Call**: Direct dialing QR codes with phone numbers
  - **SMS Message**: Pre-written text message QR codes
  - **Location**: GPS coordinate sharing with optional labels
- Character limit enforcement (2000 chars) with visual feedback
- URL detection with visual confirmation for manual input
- Input validation and error handling
- Tab-based interface separating manual input from template selection

### QR Code Customization
- **Color Customization**: Full color picker for foreground/background colors
- **Color Presets**: Quick-select popular color combinations (Black/White, Blue theme, Green theme, Red theme)
- **Size Options**: Small (200px), Medium (256px), Large (320px), Extra Large (400px)
- **Live Preview**: Immediate visual feedback for all customization changes

### Export Capabilities
- **PNG Export**: High-quality raster format for general use, presentations, printing
- **SVG Export**: Vector format for scalable graphics, web use, professional printing
- Both formats maintain consistent square QR code styling

### QR Code History
- **Persistent Storage**: Automatically saves generated QR codes to local history when exported
- **Template Integration**: History preserves both template selections and generated content
- **Smart Deduplication**: Prevents duplicate entries while updating timestamps
- **Quick Access**: Collapsible history panel with recent QR codes
- **History Management**: Individual removal and bulk clear options
- **One-Click Reload**: Instantly restore previous QR codes with all settings and template data

### Privacy & Performance
- **No Server Dependency**: All processing happens client-side
- **No Tracking**: Explicit privacy messaging
- **Responsive Generation**: Sub-100ms update times for smooth UX
- **Local Storage**: History stored locally for privacy while maintaining convenience

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with approachable simplicity
- **Design Personality**: Clean, modern, trustworthy - like premium developer tools
- **Visual Metaphors**: Clean forms, precise controls, professional software interfaces
- **Simplicity Spectrum**: Minimal interface that progressively reveals advanced options

### Color Strategy
- **Color Scheme Type**: Monochromatic with subtle warm accents
- **Primary Color**: Warm beige (#E5D5A3 - oklch(0.85 0.08 85)) for friendliness
- **Secondary Colors**: Soft warm grays for supporting elements
- **Accent Color**: Deeper warm tone (#C4A973 - oklch(0.68 0.10 85)) for interactive elements
- **Color Psychology**: Warm tones convey approachability while maintaining professionalism
- **Color Accessibility**: All text/background pairings meet WCAG AA standards

### Typography System
- **Font Pairing Strategy**: Single font family approach with weight variations
- **Primary Font**: Cabin (clean, friendly sans-serif) for all UI elements
- **Monospace Font**: IBM Plex Mono for code-like inputs (URLs, hex colors)
- **Typographic Hierarchy**: Clear size relationships (2xl heading, lg card titles, sm labels, xs metadata)
- **Readability Focus**: Generous line spacing, appropriate contrast, clear hierarchy

### Visual Hierarchy & Layout
- **Attention Direction**: Vertical flow from input → customization → output → download
- **White Space Philosophy**: Generous spacing between sections for clarity and breathing room
- **Grid System**: Card-based layout with consistent internal padding and margins
- **Responsive Approach**: Single-column mobile-first design that scales elegantly
- **Content Density**: Balanced information density avoiding both emptiness and clutter

### UI Elements & Component Selection
- **Card Components**: Clear section separation and visual grouping
- **Tab Interface**: Clean separation between manual input and template modes  
- **Template Grid**: Visual template selection with icons and descriptions
- **Form Controls**: Dynamic field generation based on selected template
- **Input Controls**: Shadcn components for consistency and accessibility
- **Color Pickers**: Dual approach (visual picker + hex input) for precision and convenience
- **Select Dropdowns**: Clear option presentation for size choices
- **Button Groups**: Paired download options with clear format distinction
- **Progress Indicators**: Subtle loading states and character count feedback
- **Generated Content Preview**: Read-only display of template-generated QR content

### Animations
- **Purposeful Meaning**: Smooth transitions communicate app responsiveness
- **Hierarchy of Movement**: QR code regeneration gets priority animation attention
- **Contextual Appropriateness**: Subtle, professional motion that doesn't distract

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance maintained across all color combinations
- **Color Independence**: Information never conveyed through color alone
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Screen Reader Support**: Proper labeling and semantic structure

## Edge Cases & Problem Scenarios
- **Empty Input**: Clear placeholder state with helpful messaging
- **Template Validation**: Required field enforcement with clear visual feedback
- **Incomplete Templates**: Graceful handling when required template fields are missing
- **Overlong Input**: Graceful truncation with clear feedback
- **Invalid Template Data**: Validation for email formats, phone numbers, coordinates
- **Invalid Colors**: Fallback to defaults if invalid hex codes entered
- **Generation Errors**: User-friendly error messages with recovery guidance
- **Download Failures**: Retry mechanisms and alternative download methods
- **Template Switching**: Clean state management when switching between templates

## Implementation Considerations
- **Performance**: Debounced input processing to avoid excessive regeneration
- **Browser Compatibility**: SVG and Canvas API support across modern browsers
- **File Size**: Optimized bundle size while maintaining feature completeness
- **Scalability**: Modular component structure for easy feature addition

## Reflection
This approach uniquely combines simplicity with power - users get immediate results with minimal input, but can dive into customization when needed. The dual-format export addresses different use cases (PNG for general use, SVG for professional applications) while maintaining privacy through client-side processing. The warm, professional aesthetic distinguishes it from typical utility apps while building user trust.
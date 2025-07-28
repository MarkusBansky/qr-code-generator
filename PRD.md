# Planning Guide

Generate QR codes instantly from any text or URL input with a clean, minimal interface optimized for quick use.

**Experience Qualities**: 
1. **Instant** - QR codes generate immediately as user types with no delays
2. **Clean** - Distraction-free interface focusing purely on input and output
3. **Reliable** - Consistent generation with clear visual feedback for all input types

**Complexity Level**: Micro Tool (single-purpose)
- Perfect single-function app that does one thing exceptionally well - converting text/URLs to QR codes

## Essential Features

**QR Code Generation**
- Functionality: Convert any text or URL into a scannable QR code
- Purpose: Enable quick sharing of information via QR codes
- Trigger: User types or pastes content into input field
- Progression: Input text → Real-time QR generation → Display code → Optional download
- Success criteria: QR code updates instantly and scans correctly on mobile devices

**Input Validation & Feedback**
- Functionality: Show input character count and validate URLs
- Purpose: Guide users and prevent errors
- Trigger: User begins typing
- Progression: Text input → Character count updates → URL validation (if applicable) → Visual feedback
- Success criteria: Users understand input limits and URL formatting

**Download Functionality**
- Functionality: Save generated QR code as PNG image
- Purpose: Allow users to save and use QR codes elsewhere
- Trigger: User clicks download button
- Progression: Click download → Generate high-res image → Browser download → Success feedback
- Success criteria: Downloaded QR codes are high quality and scan properly

## Edge Case Handling

- **Empty Input**: Show placeholder QR with sample text
- **Very Long Text**: Character limit with graceful truncation warning
- **Invalid URLs**: Visual indicator but still generate QR (user choice)
- **Special Characters**: Handle unicode and emojis correctly
- **Mobile Usage**: Touch-friendly interface with proper input focus

## Design Direction

The design should feel clean, technical, and efficient - like a professional developer tool with Apple-like attention to detail and minimal visual noise that keeps focus on the primary task.

## Color Selection

Complementary (opposite colors) - Using a refined blue and warm accent to create professional contrast while maintaining excellent readability.

- **Primary Color**: Deep Blue (oklch(0.4 0.15 250)) - Communicates trust and technical precision
- **Secondary Colors**: Light blue-gray backgrounds for subtle depth without distraction
- **Accent Color**: Warm Orange (oklch(0.65 0.18 45)) - Draws attention to download and action buttons
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark text (oklch(0.15 0 0)) - Ratio 14.8:1 ✓
  - Card (Light Gray oklch(0.98 0 0)): Dark text (oklch(0.15 0 0)) - Ratio 13.9:1 ✓
  - Primary (Deep Blue oklch(0.4 0.15 250)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent (Warm Orange oklch(0.65 0.18 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓

## Font Selection

Typography should convey technical precision and modern clarity using a clean monospace for code-like elements and sans-serif for interface text.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/24px/tight letter spacing
  - Input Label: Inter Medium/14px/normal spacing  
  - Input Text: JetBrains Mono Regular/16px/relaxed for technical content
  - Helper Text: Inter Regular/12px/loose spacing
  - Button Text: Inter Medium/14px/tight spacing

## Animations

Subtle functional animations that provide immediate feedback without drawing attention away from the core task.

- **Purposeful Meaning**: Quick fade-ins for QR code updates and gentle hover states for interactive elements
- **Hierarchy of Movement**: QR code generation gets priority animation, followed by button states and input feedback

## Component Selection

- **Components**: 
  - Card for main container with subtle shadow
  - Input for text entry with clean styling
  - Button for download action with primary styling
  - Label for input guidance
  - Badge for character count display
- **Customizations**: Custom QR code canvas component with proper sizing and download functionality
- **States**: Input (default, focused, error), Button (default, hover, active, loading), QR display (loading, generated, error)
- **Icon Selection**: Download icon for save action, QR code icon for branding
- **Spacing**: Consistent 4-unit (16px) spacing between major sections, 2-unit (8px) for related elements
- **Mobile**: Single column layout with larger touch targets, input field expands to full width, QR code scales appropriately
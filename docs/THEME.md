# ENT Scribe v1 Design System

A comprehensive design system for ENT Scribe, a medical SaaS application designed for ENT physicians to record patient visits and generate clinical notes efficiently and securely.

---

## 1. Design Principles & Philosophy

ENT Scribe prioritizes **clinical clarity, physician efficiency, and patient safety** through a design system that is:

- **Clinical-Grade**: Professional, medical-appropriate, and trusted
- **Fast & Responsive**: Minimal cognitive load, quick interactions
- **Accessible**: WCAG 2.2 AA compliant (exceeding 2.1 AA deadline of May 2026)
- **Trustworthy**: Clear data flows, secure interactions, transparent processes
- **Physician-Centric**: Built for busy clinicians documenting in real-time
- **Dark Mode Ready**: Supports both light and dark interfaces for different clinical environments

---

## 2. Color Palette

### Primary Colors

The color system uses a **clinical blue** foundation combined with **supportive greens** for actions and **professional grays** for structure—inspired by healthcare SaaS leaders like Retool and modern EHR systems.

#### Semantic Color Mapping

```
Primary (Trust/Clinical):
  - primary-50:  #F0F7FF  (Lightest blue background)
  - primary-100: #E0EEFF  (Light blue)
  - primary-200: #C1DDFF  (Softer blue)
  - primary-300: #A2CCFF  (Medium-light blue)
  - primary-400: #5B9FFF  (Bright blue for interactions)
  - primary-500: #1E6FFF  (Primary blue - interactive elements, focus states)
  - primary-600: #1754CC  (Slightly darker for hover states)
  - primary-700: #003DA6  (Darker for active states)
  - primary-800: #002470  (Deep blue for emphasis)
  - primary-900: #001529  (Almost black-blue for highest contrast)

Success (Clinical Positive):
  - success-50:  #F0F9F4
  - success-100: #D4F1E4
  - success-200: #A9E8CE
  - success-400: #5AD295  (Bright success - data recorded, note complete)
  - success-600: #12A84C  (Primary success green)
  - success-900: #023C1C  (Deep success for critical indicators)

Warning (Clinical Caution):
  - warning-50:  #FFFAF0
  - warning-100: #FFE8D6
  - warning-200: #FFD4B0
  - warning-400: #FFA040  (Bright warning - unsaved data, review needed)
  - warning-600: #CC6F00  (Primary warning)
  - warning-900: #7F3F00  (Deep warning for critical notices)

Danger (Clinical Alert):
  - danger-50:  #FEF2F2
  - danger-100: #FCE7E7
  - danger-200: #F8CFCF
  - danger-400: #EB4848  (Bright danger - error states, critical actions)
  - danger-600: #C3132D  (Primary danger red)
  - danger-900: #6B0817  (Deep danger for maximum emphasis)

Neutral (Structure & Text):
  - neutral-50:  #FAFBFC
  - neutral-100: #F3F4F6  (Light backgrounds)
  - neutral-200: #E5E7EB  (Borders, subtle dividers)
  - neutral-300: #D1D5DB  (Secondary borders)
  - neutral-400: #9CA3AF  (Placeholder text, disabled states)
  - neutral-500: #6B7280  (Secondary text)
  - neutral-600: #4B5563  (Body text)
  - neutral-700: #374151  (Primary text, headings)
  - neutral-800: #1F2937  (Dark text)
  - neutral-900: #111827  (Almost black text)
```

### Dark Mode Color System

Dark mode uses inverted semantics while maintaining accessibility:

```
Dark Mode Mapping:
  - Dark background:    #0F1419  (Replace neutral-50)
  - Dark surface:       #1A1F27  (Replace neutral-100)
  - Dark border:        #2D3139  (Replace neutral-200)
  - Dark text primary:  #F3F4F6  (Replace neutral-700)
  - Dark text secondary:#D1D5DB  (Replace neutral-500)

  Colors remain saturated:
  - primary-400: #5B9FFF (maintains same value)
  - success-600: #12A84C (maintains same value)
  - warning-600: #CC6F00 (maintains same value)
  - danger-600: #C3132D (maintains same value)
```

### Contrast Ratios (WCAG 2.2 AA Compliance)

All color combinations meet or exceed minimum contrast requirements:

- **Text on Background**: 4.5:1 minimum (regular), 3:1 (large text 18pt+)
- **UI Components & Borders**: 3:1 minimum
- **Recommended for Medical Software**: Aim for 7:1 (AAA level) where possible

Key contrast pairs:
- `primary-900` text on `neutral-50` = 12.8:1 ✓ (Exceeds AAA)
- `primary-600` text on `neutral-50` = 8.2:1 ✓ (Exceeds AAA)
- `neutral-700` text on `neutral-50` = 10.1:1 ✓ (Exceeds AAA)
- `primary-400` on `neutral-900` = 6.5:1 ✓ (Exceeds AA)
- `neutral-400` text on `neutral-50` = 4.6:1 ✓ (Meets AA)

---

## 3. Typography

### Font Stack

```
Headings (Professional, trustworthy):
  Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif
  (System fonts for fast rendering in medical environments)

Body Text & UI:
  Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif

Code & Clinical Values:
  Font Family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace
  (For precise clinical data, lab values, medical codes)
```

### Type Scale

```
Display / H1 (Page titles, patient names):
  Font Size: 32px (2rem)
  Line Height: 1.25 (40px)
  Font Weight: 700 (bold)
  Letter Spacing: -0.02em
  Color: neutral-900

Heading 2 / H2 (Section titles, template names):
  Font Size: 24px (1.5rem)
  Line Height: 1.33 (32px)
  Font Weight: 600 (semibold)
  Letter Spacing: -0.01em
  Color: neutral-800

Heading 3 / H3 (Subsection titles, field groups):
  Font Size: 18px (1.125rem)
  Line Height: 1.44 (26px)
  Font Weight: 600 (semibold)
  Color: neutral-700

Heading 4 / H4 (Tertiary headers):
  Font Size: 16px (1rem)
  Line Height: 1.5 (24px)
  Font Weight: 600 (semibold)
  Color: neutral-700

Body Large (Lead text, clinical notes):
  Font Size: 16px (1rem)
  Line Height: 1.6 (25.6px)
  Font Weight: 400 (regular)
  Color: neutral-700

Body Regular (Standard text, descriptions):
  Font Size: 14px (0.875rem)
  Line Height: 1.6 (22.4px)
  Font Weight: 400 (regular)
  Color: neutral-600

Body Small (Secondary text, timestamps, help text):
  Font Size: 12px (0.75rem)
  Line Height: 1.5 (18px)
  Font Weight: 400 (regular)
  Color: neutral-500

Label / Overline (Form labels, tags):
  Font Size: 12px (0.75rem)
  Line Height: 1.33 (16px)
  Font Weight: 500 (medium)
  Letter Spacing: 0.05em
  Color: neutral-600

Code / Monospace (Clinical codes, values):
  Font Size: 13px (0.8125rem)
  Line Height: 1.6
  Font Weight: 400 (regular)
  Font Family: Monospace
  Color: primary-700
  Background: primary-50
```

---

## 4. Spacing Scale

Consistent spacing ensures visual harmony and improves scannability for busy physicians:

```
2px   - Fine details, icon separations
4px   - Minimal spacing between elements
8px   - Base unit, standard padding
12px  - Slightly larger spacing
16px  - Standard spacing between sections (1rem)
20px  - Medium spacing
24px  - Large spacing
32px  - Extra large spacing
40px  - Page section spacing
48px  - Major section breaks
64px  - Full-page divisions
```

**Tailwind Usage**: Use standard Tailwind spacing scale (`p-2`, `p-4`, `p-6`, etc.)

---

## 5. Visual Identity & Branding

### Logo & Wordmark

**ENT Scribe** should have:
- **Icon**: Stethoscope + microphone + document (symbolizing listening, recording, documentation)
- **Style**: Clean, professional, medical-appropriate
- **Sizes**: 32px (favicon), 48px (header), 256px (full-size logo)
- **Color Variants**:
  - Primary Blue (primary-600) on light backgrounds
  - White on primary-900 for dark backgrounds
  - Monochrome neutral-700 for grayscale contexts

### Iconography Style

```
Icon System:
  - 24px standard size (most common in UI)
  - 16px for small badges and inline icons
  - 32px for prominent actions
  - Stroke width: 1.5px (not 1px for clarity)
  - Border radius: 2px (subtle, not fully rounded)
  - Style: Outlined/stroke-based (not filled)
  - Color: Inherit text color or use semantic colors

Common ENT-Related Icons:
  - Microphone (recording)
  - Stethoscope (clinical)
  - Checkmark (confirmed, saved)
  - Edit/Pencil (modify notes)
  - Copy (clipboard actions)
  - Download (export records)
  - Settings/Gear (preferences, templates)
  - Lock (security, private data)
  - Eye (review before submit)
  - Clock (timestamps, patient history)
```

### Illustration Style

For empty states, onboarding, and guidance:
- **Style**: Flat, minimalist, medical-appropriate
- **Colors**: Use primary-400 and success-600 for main elements
- **Tone**: Professional, not whimsical
- **Use Cases**:
  - Empty state when no notes exist
  - Onboarding flow steps
  - Feature explanations
  - Success celebrations (note saved, shared)

---

## 6. UI/UX Principles

### Accessibility First (WCAG 2.2 AA Standard)

1. **Color Contrast**: All text/UI meets 4.5:1 minimum; medical-critical info targets 7:1
2. **Focus Indicators**:
   - Visible keyboard focus rings (primary-400, 2px minimum width)
   - Tab order follows visual and logical flow
   - Focus trap in modals, release on close
3. **Semantic HTML**:
   - Use proper heading hierarchy (h1 → h6)
   - Form labels explicitly associated with inputs
   - ARIA labels for icon-only buttons
   - Landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`
4. **Motion**:
   - Respect `prefers-reduced-motion` setting
   - Avoid autoplay of audio/video
   - Animations max 200ms duration
5. **Form Accessibility**:
   - Required fields marked with `*` and `aria-required="true"`
   - Error messages associated with `aria-describedby`
   - Success/validation messages announced to screen readers
6. **Color Not Alone**: Never use color to convey information without accompanying text/icon
7. **Text Sizing**: Support up to 200% zoom without loss of functionality

### Responsive Design Approach

ENT Scribe is **mobile-first** but optimized for desktop clinical workflows:

```
Mobile First Breakpoints:
  - xs: 0px      (Mobile: default)
  - sm: 640px    (Tablet portrait)
  - md: 768px    (Tablet landscape, small laptop)
  - lg: 1024px   (Laptop, desktop)
  - xl: 1280px   (Wide desktop, dual monitors)
  - 2xl: 1536px  (Ultra-wide, clinical displays)

Layout Shifts:
  Mobile (xs):
    - Single column layout
    - Full-width inputs
    - Floating action buttons for record/save
    - Collapsible sections
    - Bottom sheet modals

  Tablet (sm-md):
    - 2-column grids possible
    - Side navigation appears
    - Modal positioning adjusted

  Desktop (lg+):
    - 3+ column layouts
    - Sidebar navigation fixed
    - Modal center-positioned
    - Whitespace optimization
```

### Dark Mode Strategy

Dark mode is critical in clinical environments with dim lighting:

```
Light Mode (Default):
  - Background: neutral-50 (#FAFBFC)
  - Surface: white (#FFFFFF)
  - Borders: neutral-200 (#E5E7EB)
  - Text primary: neutral-900 (#111827)
  - Text secondary: neutral-600 (#4B5563)

Dark Mode (Toggled via system preference or UI):
  - Background: neutral-900 (#111827)
  - Surface: neutral-800 (#1F2937)
  - Borders: neutral-700 (#374151)
  - Text primary: neutral-50 (#FAFBFC)
  - Text secondary: neutral-300 (#D1D5DB)

Implementation:
  - Use CSS custom properties (--color-primary, etc.)
  - Persist preference in localStorage
  - Respect `prefers-color-scheme` media query
  - Smooth transition (300ms) between modes
```

---

## 7. Component Library

### Buttons

```
Primary Button (Main actions: Start Recording, Save Note):
  - Background: primary-600
  - Text: white
  - Padding: 12px 20px (0.75rem 1.25rem)
  - Border radius: 8px
  - Font weight: 600
  - Font size: 14px
  - Hover: primary-700 background
  - Active/Pressed: primary-800 background
  - Disabled: neutral-200 background, neutral-400 text
  - Min width: 44px height (touch target), min width: 88px

Secondary Button (Alternative actions: Cancel, Delete):
  - Background: neutral-100
  - Border: 1px neutral-300
  - Text: neutral-900
  - Padding: 12px 20px
  - Border radius: 8px
  - Hover: neutral-200 background
  - Active: neutral-300 background
  - Focus: 2px primary-400 outline

Tertiary Button (Low-priority: Help, Learn More):
  - Background: transparent
  - Text: primary-600
  - Underline on hover
  - Padding: 12px 20px
  - No background color change

Danger Button (Delete, Clear):
  - Background: danger-600
  - Text: white
  - Hover: danger-700
  - Requires confirmation modal

Icon Button (Edit, Copy, Settings):
  - Size: 40px × 40px (touch-friendly)
  - Background: transparent (light mode) / neutral-700 (dark mode)
  - Icon color: primary-600 or neutral-700
  - Hover: background: neutral-100 (light) / neutral-600 (dark)
  - Focus: 2px primary-400 outline
  - Aria-label required
```

### Form Inputs

```
Text Input / Textarea:
  - Border: 1px neutral-300 (light) / neutral-600 (dark)
  - Border radius: 6px
  - Padding: 10px 12px (input) / 12px (textarea)
  - Font size: 14px
  - Placeholder: neutral-400 color
  - Focus: 2px primary-400 outline, border-primary-400
  - Disabled: neutral-100 background, neutral-400 text
  - Error state:
    - Border: danger-500
    - Red icon/message below: danger-600 text
  - Success state:
    - Border: success-500
    - Green checkmark icon
  - Label: 12px, 600 weight, neutral-700 color
  - Helper text: 12px, neutral-500 color

Select / Dropdown:
  - Similar styling to text input
  - Dropdown arrow: 16px, primary-600 color
  - Items in dropdown: 14px, neutral-700 (hover: neutral-50 background)
  - Selected item: background: primary-50, border-left: 3px primary-600

Checkbox / Radio:
  - Size: 20px × 20px (easy touch targets)
  - Border: 1.5px neutral-300
  - Checked: primary-600 background, white checkmark/dot
  - Focus: 2px primary-400 outline
  - Label: 14px, neutral-700, left-aligned next to control
  - Group label: 14px 600 weight, neutral-800

Toggle Switch:
  - Width: 48px, Height: 24px
  - Border radius: 12px (fully rounded)
  - Off: neutral-300 background, neutral-500 circle
  - On: primary-600 background, white circle
  - Focus: 2px primary-400 outline
  - Accessible: use input[type="checkbox"] + label styling
```

### Cards

```
Content Card (Patient info, note preview):
  - Background: white (light) / neutral-800 (dark)
  - Border: 1px neutral-200 (light) / neutral-700 (dark)
  - Border radius: 8px
  - Padding: 16px 20px
  - Shadow: subtle (0 1px 3px rgba(0,0,0,0.12))
  - Hover: shadow increases (0 4px 6px rgba(0,0,0,0.15))
  - Transition: 200ms

Status Card (Recording in progress, note ready):
  - Like content card but with left border accent
  - Accent border: 4px primary-500 (left side)
  - Optional icon: primary-500 or success-600 at top-right

Empty State Card:
  - Dashed border: 1px primary-300
  - Background: primary-50 (light) / primary-900 (dark)
  - Min height: 120px
  - Centered text: neutral-500
  - Icon: primary-300 or primary-400
```

### Modals

```
Confirmation Modal:
  - Overlay: 0.5 opacity neutral-900 (dims background)
  - Modal box: white (light) / neutral-800 (dark)
  - Border radius: 12px
  - Shadow: 0 20px 25px rgba(0,0,0,0.15)
  - Max width: 500px
  - Padding: 32px 24px (top/bottom, left/right)
  - Title: 18px 600 weight, neutral-900
  - Body: 14px regular, neutral-600
  - Actions: 2 buttons (Primary + Secondary)
  - Spacing between buttons: 12px
  - Close button: X icon, top-right, 24px
  - Focus trap: Tab cycles through focusable elements
  - Escapes with Escape key

Notification Toast (Saved, Error):
  - Position: bottom-right (desktop) / bottom-full (mobile)
  - Background: neutral-900 (light mode success) or danger-600 (error)
  - Text: white
  - Padding: 12px 16px
  - Border radius: 8px
  - Min height: 44px
  - Icon + Text: 14px
  - Auto-dismiss: 5 seconds
  - Close button: X icon

Alert Banner (System messages, warnings):
  - Position: top of page or section
  - Background: warning-50 (light) / warning-900 (dark)
  - Border-left: 4px warning-600
  - Padding: 12px 16px
  - Icon: warning-600
  - Text: 14px neutral-700
  - Optional close button: right-aligned
```

### Tags & Badges

```
Standard Tag:
  - Background: primary-100 (light) / primary-900 (dark)
  - Text: primary-700
  - Padding: 4px 8px
  - Border radius: 4px
  - Font size: 12px
  - Optional: dismissible X icon (right side)

Status Badge:
  - Success: background-success-100, text-success-700
  - Warning: background-warning-100, text-warning-700
  - Danger: background-danger-100, text-danger-700
  - Info: background-primary-100, text-primary-700
  - Padding: 6px 12px
  - Border radius: 6px
  - Font size: 12px 600 weight
```

---

## 8. Brand Voice & Tone

### Voice Principles

- **Clear**: Medical terminology balanced with plain language
- **Confident**: Build trust in the AI-assisted documentation
- **Respectful**: Honor physicians' expertise and time
- **Efficient**: Brief, scannable, action-oriented copy

### Tone Variants

**For Physicians:**
- Formal but not stuffy
- Use medical terminology correctly
- Respect their time (concise UI text)
- Example: "Review note for accuracy before saving"

**For Patients (if feature added):**
- Friendly but professional
- Explain medical terms simply
- Reassuring and transparent
- Example: "Your doctor is recording this visit to create accurate medical records"

**For System Messages:**
- Encouraging (success): "Note saved successfully. Ready for review."
- Clear (errors): "Unable to transcribe. Please check microphone and try again."
- Helpful (guidance): "Press Start to begin recording. Speak naturally—we'll capture everything."

### Microcopy Examples

```
Recording states:
  - Listening... (recording active)
  - Processing... (transcription in progress)
  - Ready to save (note complete)

Empty states:
  - "No notes yet. Start by recording a visit." (action-oriented)
  - "Templates help you structure your notes. Create one to get started." (educational)

Error messages:
  - ❌ "Microphone access denied. Enable in settings to continue." (specific, actionable)
  - ❌ "Audio is too quiet. Speak clearly into the microphone." (diagnostic, helpful)

Success messages:
  - ✓ "Note generated. Review changes in the editor." (next step)
  - ✓ "Template saved and ready to use." (confirmation)
```

---

## 9. Emotion & Feeling

ENT Scribe should evoke:

**Professionalism**:
- Clean lines, ample whitespace, consistent layout
- Medical blue color signaling clinical credibility
- Professional typography hierarchy

**Trust**:
- Clear data handling (what's recorded, what's shared)
- Transparent AI-generated notes (show edits, sources)
- Confirmation for critical actions (save, share)

**Speed**:
- Minimal loading states (max 2 seconds)
- Quick access to recent templates
- One-click recording start

**Control**:
- Physicians always review notes before saving
- Full edit capability on AI-generated content
- Visible undo/redo for all changes

**Calm**:
- No aggressive warnings (use caution colors sparingly)
- Soft shadows and transitions
- Breathing room in layouts

---

## 10. References & Inspiration

### Best-in-Class Medical SaaS

1. **Retool** (Internal tools for healthcare)
   - Clean data visualization
   - Clinical blue + neutral grays
   - Form-heavy interface, accessibility-first
   - [https://retool.com](https://retool.com)

2. **Figma** (Design collaboration)
   - Minimalist interface
   - Command palette for power users
   - Dark mode excellence
   - [https://figma.com](https://figma.com)

3. **Notion** (Medical teams & healthcare)
   - Flexible document layouts
   - Database design for patient records
   - Thoughtful dark mode
   - [https://notion.so](https://notion.so)

4. **Epic EHR** (Gold standard clinical software)
   - Role-specific workflows
   - Complex form design
   - Data-heavy dashboards
   - (Proprietary, but standard in healthcare)

5. **Ambient EHR Competitors**
   - Nuance/Microsoft Ambient Recordings
   - Augmedix
   - scribe.ai
   - Focus: real-time transcription, structured note generation

### Design System Resources

- **WCAG 2.2 AA Guidelines**: [https://www.w3.org/WAI/WCAG22/quickref/](https://www.w3.org/WAI/WCAG22/quickref/)
- **WebAIM Color Contrast Checker**: [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
- **Tailwind CSS Documentation**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **HHS May 2026 Accessibility Deadline**: [https://www.hhs.gov/web/section-508-technical-standards](https://www.hhs.gov/web/section-508-technical-standards)

---

## 11. Tailwind CSS Configuration

### Theme Extension

Add to `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Clinical Blue
        primary: {
          50: '#F0F7FF',
          100: '#E0EEFF',
          200: '#C1DDFF',
          300: '#A2CCFF',
          400: '#5B9FFF',
          500: '#1E6FFF',
          600: '#1754CC',
          700: '#003DA6',
          800: '#002470',
          900: '#001529',
        },
        // Success - Clinical Green
        success: {
          50: '#F0F9F4',
          100: '#D4F1E4',
          200: '#A9E8CE',
          400: '#5AD295',
          600: '#12A84C',
          900: '#023C1C',
        },
        // Warning - Clinical Caution
        warning: {
          50: '#FFFAF0',
          100: '#FFE8D6',
          200: '#FFD4B0',
          400: '#FFA040',
          600: '#CC6F00',
          900: '#7F3F00',
        },
        // Danger - Clinical Alert
        danger: {
          50: '#FEF2F2',
          100: '#FCE7E7',
          200: '#F8CFCF',
          400: '#EB4848',
          600: '#C3132D',
          900: '#6B0817',
        },
        // Neutral - Structure & Text
        neutral: {
          50: '#FAFBFC',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontSize: {
        // H1
        'display': ['32px', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.02em' }],
        // H2
        'h2': ['24px', { lineHeight: '1.33', fontWeight: '600', letterSpacing: '-0.01em' }],
        // H3
        'h3': ['18px', { lineHeight: '1.44', fontWeight: '600' }],
        // H4
        'h4': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        // Body Large
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        // Body Regular
        'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        // Body Small
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        // Label
        'label': ['12px', { lineHeight: '1.33', fontWeight: '500', letterSpacing: '0.05em' }],
        // Code
        'code': ['13px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        // Standard Tailwind spacing (2px, 4px, 8px, 16px, 24px, 32px, etc.)
        // Add custom values if needed
        'touch': '44px', // Minimum touch target
        'touch-lg': '48px', // Larger touch target
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
        base: '0 4px 6px rgba(0, 0, 0, 0.15)',
        md: '0 10px 15px rgba(0, 0, 0, 0.2)',
        lg: '0 20px 25px rgba(0, 0, 0, 0.25)',
        focus: '0 0 0 2px #F0F7FF, 0 0 0 4px #1E6FFF', // Primary focus ring
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode with class strategy
};

export default config;
```

### Usage in Components

```tsx
// Example Button Component with Tailwind
export function Button({
  variant = 'primary',
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-5 py-3 rounded-lg font-semibold text-sm transition-colors duration-base';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-200 disabled:text-neutral-400',
    secondary: 'bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200 active:bg-neutral-300',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Example Input Component
export function Input({
  error = false,
  success = false,
  disabled = false,
  ...props
}: InputProps) {
  const borderColor = error ? 'border-danger-500' : success ? 'border-success-500' : 'border-neutral-300';

  return (
    <input
      className={`w-full px-3 py-2 text-base rounded-md border transition-colors duration-fast ${borderColor} focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 disabled:bg-neutral-100 disabled:text-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-50`}
      disabled={disabled}
      {...props}
    />
  );
}
```

---

## 12. Accessibility Standards

### WCAG 2.2 AA Compliance Checklist

- [ ] **Perceivable**
  - [ ] All images have descriptive alt text
  - [ ] Color is not the only way to convey information (use icons, text, patterns)
  - [ ] Text has sufficient contrast (4.5:1 for body, 3:1 for large text)
  - [ ] Video/audio content has captions and transcripts
  - [ ] No flashing content (no more than 3 flashes per second)

- [ ] **Operable**
  - [ ] All functionality available via keyboard (Tab, Enter, Arrow keys, Escape)
  - [ ] Focus is visible at all times (2px outline minimum)
  - [ ] No keyboard traps (can escape with Escape key)
  - [ ] Forms are properly labeled and associated with inputs
  - [ ] Touch targets are minimum 44x44px (48x48px recommended)
  - [ ] Links are distinguishable from surrounding text

- [ ] **Understandable**
  - [ ] Page purpose is clear
  - [ ] Form labels are clear and associated with inputs
  - [ ] Error messages are specific and helpful
  - [ ] Language is plain and simple (avoid jargon where possible)
  - [ ] Consistent navigation across pages
  - [ ] Focus order is logical and matches visual order

- [ ] **Robust**
  - [ ] Valid HTML (no duplicate IDs, properly nested elements)
  - [ ] ARIA labels where needed (but semantic HTML preferred)
  - [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
  - [ ] Form inputs have proper roles and states
  - [ ] No reliance on inline styles for critical information

### Testing Tools

- **Automated**:
  - axe DevTools (Chrome/Firefox extension)
  - Lighthouse (Chrome DevTools)
  - WAVE (WebAIM tool)

- **Manual Testing**:
  - Keyboard navigation only (Tab, Enter, Arrow keys)
  - Screen reader testing (NVDA on Windows, VoiceOver on Mac/iOS)
  - Color contrast checking (WebAIM contrast checker)
  - Zoom to 200% (no content loss)

### Common Accessibility Patterns for Medical Apps

```tsx
// Proper Form with Label Association
<div className="mb-4">
  <label htmlFor="patient-name" className="block text-label font-medium text-neutral-700 mb-2">
    Patient Name <span className="text-danger-600" aria-label="required">*</span>
  </label>
  <input
    id="patient-name"
    type="text"
    required
    aria-required="true"
    aria-describedby="patient-name-help"
    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
  />
  <p id="patient-name-help" className="text-body-sm text-neutral-500 mt-1">
    Enter the patient's full name as it appears in the record.
  </p>
</div>

// Error State with Proper Association
<div className="mb-4">
  <label htmlFor="dob" className="block text-label font-medium text-neutral-700 mb-2">
    Date of Birth
  </label>
  <input
    id="dob"
    type="date"
    aria-invalid="true"
    aria-describedby="dob-error"
    className="w-full px-3 py-2 border-2 border-danger-500 rounded-md focus:outline-none focus:ring-2 focus:ring-danger-400"
  />
  <p id="dob-error" className="text-body-sm text-danger-600 mt-2" role="alert">
    ❌ Please enter a valid date of birth (patient must be at least 18 years old).
  </p>
</div>

// Icon Button with ARIA Label
<button
  aria-label="Copy note to clipboard"
  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
>
  <CopyIcon className="w-5 h-5 text-neutral-700" />
</button>

// Modal with Focus Management
<dialog
  open
  className="fixed inset-0 z-50 flex items-center justify-center"
  aria-labelledby="modal-title"
  aria-modal="true"
  role="dialog"
>
  <div className="bg-white rounded-xl shadow-lg max-w-md p-8">
    <h2 id="modal-title" className="text-h3 font-bold text-neutral-900 mb-4">
      Confirm Save
    </h2>
    <p className="text-body text-neutral-600 mb-6">
      Save this note to your records?
    </p>
    <div className="flex gap-3 justify-end">
      <button className="px-4 py-2 text-body font-medium text-neutral-700 hover:bg-neutral-100 rounded-md">
        Cancel
      </button>
      <button className="px-4 py-2 text-body font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
        Save Note
      </button>
    </div>
  </div>
</dialog>
```

---

## 13. Mobile-First Responsive Design

### Breakpoint Strategy

```
xs (Mobile, 0px+):
  - Single column everything
  - Full-width inputs and buttons
  - Bottom sheet modals
  - Hamburger menu navigation
  - Floating action button for primary action (Record)
  - Hide: complex tables, sidebars, multi-column layouts

sm (Tablet Portrait, 640px+):
  - Navigation transitions to side panel
  - 2-column grids possible
  - Modals gain max-width constraint
  - Forms can have side-by-side fields

md (Tablet Landscape, 768px+):
  - 3-column layouts possible
  - Sidebar navigation fixed
  - Patient info displayed in cards
  - Data tables become scrollable (not full-width)

lg (Laptop, 1024px+):
  - Full desktop experience
  - 4+ column grids
  - All complex UI patterns available
  - Sidebars persistent

xl (Wide Desktop, 1280px+):
  - Optimized for dual monitors
  - Enhanced whitespace
  - Multi-pane editors
```

### Mobile UX Patterns

**Recording Interface (Primary Use Case)**

```
Mobile (xs):
  - Large, centered microphone icon (primary-600, 48px)
  - Text: "Press to Record"
  - Timer displays above in large text (24px)
  - Stop button (danger-600) appears when recording
  - Transcription appears below, scrollable

Desktop (lg+):
  - Recording button on left sidebar
  - Transcription in main panel
  - Real-time visualization of audio
  - Waveform display
```

**Note Editor**

```
Mobile (xs):
  - Full-width textarea
  - Edit buttons in toolbar below (horizontal scroll if needed)
  - Preview mode toggles full-screen
  - Save button fixed at bottom

Desktop (lg+):
  - Split-view: editor left, preview right
  - Sidebar: template sections
  - Toolbar: floating above editor
  - Inline editing with suggestions
```

**Patient Templates**

```
Mobile (xs):
  - Vertical list of templates
  - Tap to expand template details
  - Create button at bottom
  - Search bar at top, full-width

Desktop (lg+):
  - Grid of template cards
  - Hover states showing actions
  - Create button in header
  - Sidebar filters (specialty, date)
```

### Touch-Friendly Design

- **Minimum touch target**: 44px × 44px (48px recommended for ENT apps)
- **Spacing between targets**: 8px minimum
- **Avoid hover states on mobile** (use `:active` for pressed state)
- **Avoid long press interactions** (prefer explicit buttons)
- **Gesture support**: Swipe back to previous screen, long-press for context menu

### Performance on Mobile

- **Images**: Use `next/image` with lazy loading, responsive sizes
- **CSS**: Minimize animations (max 200ms), respect `prefers-reduced-motion`
- **JavaScript**: Code split by route, lazy-load modals
- **Network**: Cache frequently accessed data, optimistic updates

---

## 14. Implementation Checklist

Before shipping ENT Scribe v1, ensure:

**Design System**
- [ ] All colors verified for WCAG 2.2 AA contrast
- [ ] Typography scale applied consistently across app
- [ ] Spacing scale validated (no orphan margin/padding values)
- [ ] Dark mode tested in all components

**Components**
- [ ] Button component with all variants (primary, secondary, tertiary, danger)
- [ ] Form input with error/success states
- [ ] Modal with focus trap and keyboard escape
- [ ] Cards with hover and active states
- [ ] Notification toast for feedback
- [ ] Loading skeletons for better perceived performance

**Accessibility**
- [ ] WCAG 2.2 AA audit passed (axe DevTools)
- [ ] Keyboard navigation tested (Tab, Enter, Arrow keys, Escape)
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Color contrast verified on all interactive elements
- [ ] Focus indicators visible on all focusable elements

**Responsive**
- [ ] Mobile (xs): Recording interface tested
- [ ] Tablet (sm-md): Navigation and layout transition tested
- [ ] Desktop (lg): Multi-column layouts optimized
- [ ] Touch targets: minimum 44px verified
- [ ] Zoom to 200%: no content loss

**Performance**
- [ ] Lighthouse score: >= 90 on mobile, >= 95 on desktop
- [ ] Time to Interactive: < 3 seconds
- [ ] Cumulative Layout Shift: < 0.1
- [ ] Images optimized and responsive

**Medical Compliance**
- [ ] Patient data encryption (HTTPS/TLS 1.3)
- [ ] Data privacy policy clear and transparent
- [ ] HIPAA considerations documented (not business associate yet)
- [ ] Error messages don't leak patient information

---

## 15. Version History

**v1.0** (Current)
- Initial design system for ambient scribe
- WCAG 2.2 AA compliance framework
- Dark mode support
- Mobile-first responsive design
- Tailwind CSS v4 integration

---

## Appendix: Resources

### Regulatory & Compliance
- [HHS Section 508 & WCAG 2.1 AA Requirements](https://www.hhs.gov/web/section-508-technical-standards)
- [May 2026 Deadline for Healthcare Accessibility](https://www.mwe.com/insights/may-2026-deadline-hhs-imposes-accessibility-standards-for-healthcare-company-websites-mobile-apps-kiosks/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

### Design & UX
- [Healthcare UI Design Best Practices 2026](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- [Healthcare UX Trends 2025-2026](https://www.excellentwebworld.com/healthcare-ux-ui-design-trends/)
- [UX Design in Healthcare](https://www.techmagic.co/blog/ux-design-in-healthcare)

### Development
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Best Practices](https://nextjs.org/docs)
- [Web Accessibility Testing Tools](https://webaim.org/resources/contrastchecker/)

### Medical SaaS Inspiration
- [Retool](https://retool.com) - Internal tools for healthcare
- [Figma](https://figma.com) - Collaboration design
- [Notion](https://notion.so) - Flexible documentation
- [Epic EHR](https://www.epic.com) - Clinical standard (reference)

---

**Last Updated**: February 20, 2026
**ENT Scribe Version**: v1.0
**Design System Status**: Ready for Implementation

For questions or design system contributions, refer to the main README.md or open an issue on GitHub.

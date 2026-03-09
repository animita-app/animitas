# Figma Design System Rules - Animita

Design system rules for implementing Figma designs in the Animita project using Tailwind CSS v4 and shadcn/ui components.

## Component Organization

- **UI Components**: `frontend/components/ui/` - shadcn/ui base components (Button, Input, Card, Badge, etc.)
- **Feature Components**: `frontend/components/` - Custom feature-specific components
- **Map Components**: `frontend/components/map/` - Map-specific layers, controls, and overlays
- **Layout Components**: `frontend/components/headers/`, `frontend/layouts/` - Headers, footers, layout wrappers
- **Forms**: `frontend/components/forms/` - Form wrappers and composites

Component naming: PascalCase, e.g., `MyComponent.tsx`

## Design Tokens

### Color System

All colors defined in `frontend/app/globals.css` using CSS custom properties. **IMPORTANT: Never hardcode hex colors - always use CSS variable tokens.**

#### Semantic Colors (Light Mode)
- `--color-background`: Main background (#FCFCFC)
- `--color-background-weak`: Secondary background (#F2F2F2)
- `--color-background-weaker`: Tertiary background (#E8E8E8)
- `--color-text`: Body text (#656364)
- `--color-text-weak`: Secondary text (#8D8B8C)
- `--color-text-weaker`: Tertiary text (#777677)
- `--color-text-strong`: Primary text/headings (black)
- `--color-text-inverted`: Inverted text (#FCFCFC)
- `--color-border`: Primary border (#CFCECC)
- `--color-border-weak`: Secondary border (#E2E2E2)
- `--color-accent`: Primary action color (#0000ee blue)
- `--color-icon`: Icon color (--color-neutral-dark-1)

#### Legacy/Semantic Support
- `--color-primary`: Text strong (black)
- `--color-primary-foreground`: Text inverted
- `--color-secondary`: Background weaker
- `--color-secondary-foreground`: Text
- `--color-destructive`: Error/destructive actions
- `--color-muted`: Background weak
- `--color-muted-foreground`: Text weak

#### Tailwind CSS Color Usage
Map CSS variables to Tailwind classes automatically:
- `bg-background`, `bg-accent`, `text-text-strong`, etc.
- `border-border`, `border-border-weak`
- Use Tailwind utilities directly; variables are available through `@theme`

### Typography

**Fonts**:
- `--font-sans`: Geist Sans (body, UI text, default)
- `--font-mono`: Geist Mono (code, monospace content)
- `--font-ibm-plex-mono`: IBM Plex Mono (headings in some contexts)

**Font Sizes** (Tailwind defaults):
- `text-xs`: 12px
- `text-sm`: 14px (body default)
- `text-base`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px
- `text-4xl`: 36px

**Font Weights** (via Tailwind):
- `font-light`: 300
- `font-normal`: 400 (default)
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

**Line Heights** (via Tailwind):
- Default: 1.6 (set in body)
- Use Tailwind utilities: `leading-tight`, `leading-snug`, `leading-normal`, `leading-relaxed`, `leading-loose`

**Letter Spacing** (via Tailwind):
- Use `tracking-tight`, `tracking-normal`, `tracking-wide` utilities

### Spacing

Uses Tailwind's default 4px base scale:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px

Apply via: `p-4` (padding), `m-4` (margin), `gap-4` (flex gap), etc.

### Border Radius

Tokens in `globals.css`:
- `--radius`: 10px (0.625rem) - default
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 10px
- `--radius-xl`: 14px

Use Tailwind classes: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`

### Shadow & Elevation

Use Tailwind shadows:
- `shadow-xs`: Minimal elevation
- `shadow-sm`: Light elevation
- `shadow`: Standard elevation
- `shadow-lg`: Strong elevation
- `shadow-xl`: Maximum elevation

## Component Primitives

### Button

**File**: `frontend/components/ui/button.tsx`

**Variants**:
- `default`: Blue accent background (`bg-accent`)
- `secondary`: Light gray background
- `outline`: Bordered with optional background
- `ghost`: Minimal, hover on light gray
- `destructive`: Error state with red tint
- `link`: Text-only with underline

**Sizes**:
- `sm`: Small (h-8)
- `default`: Medium (h-9)
- `lg`: Large (h-10)
- `icon`, `icon-sm`, `icon-xs`, `icon-lg`: Icon-only sizes

**Rules**:
- IMPORTANT: All buttons scale down 3% on active (`active:scale-[97%]`)
- Icons are automatically sized to 16px unless class specifies otherwise
- Focus state includes ring: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Disabled state: `disabled:opacity-50 disabled:pointer-events-none`

### Input

**File**: `frontend/components/ui/input.tsx`

**Features**:
- Semantic HTML `<input>` element
- Border: `border-border`
- Background: `bg-background`
- Focus ring: `ring-ring/50`
- Placeholder: `placeholder-text-weak`
- Supports all HTML input types

**Rules**:
- Use `<label>` for accessibility
- Apply `disabled:opacity-50` for disabled state
- Validation: Use `aria-invalid` for error states

### Badge

**File**: `frontend/components/ui/badge.tsx`

**Variants**:
- `default`: Primary background
- `secondary`: Secondary background
- `outline`: Bordered
- `destructive`: Error background

**Sizes**: Compact pill-shaped badges

**Rules**:
- Use for labels, tags, status indicators
- Text should be short and descriptive
- IMPORTANT: Never use badges for interactive content

### Card

**File**: `frontend/components/ui/card.tsx`

**Structure**:
- `<Card>`: Container with `bg-card`, `rounded-lg`, `border-border`, `shadow-sm`
- `<CardHeader>`: Top section with padding
- `<CardTitle>`: Heading (use `text-xl` or `text-lg`)
- `<CardDescription>`: Subtitle with `text-muted-foreground`
- `<CardContent>`: Main content area
- `<CardFooter>`: Footer with action buttons

**Rules**:
- Cards are primary content containers
- Use consistent padding via CardHeader/CardContent/CardFooter
- Background: `bg-card` (same as background by default)
- Border: `border-border`

### Select / Dropdown

**Files**: `frontend/components/ui/select.tsx`, `frontend/components/ui/dropdown-menu.tsx`

**Select**:
- Controlled component
- Trigger shows current value
- Popover with options below/above
- Support for groups, disabled options

**Dropdown Menu**:
- Trigger button to open menu
- Menu items with optional submenus
- Keyboard navigation (arrow keys, Enter)
- Close on click or Escape

### Dialog / Modal

**File**: `frontend/components/ui/dialog.tsx`

**Features**:
- Centered overlay with backdrop
- Animated entrance/exit
- Escape key to close
- Focus trap inside dialog
- IMPORTANT: Include close button or `onOpenChange` handler

**Rules**:
- Always provide way to dismiss
- Keep modals focused on single task
- Use `DialogHeader` for title, `DialogContent` for body

### Tabs

**File**: `frontend/components/ui/tabs.tsx`

**Features**:
- Horizontal tab list
- Content panels switch on tab click
- Keyboard navigation (arrow keys)
- Active indicator/underline

**Rules**:
- Use for grouped related content
- Tab labels should be short
- IMPORTANT: Only one tab panel visible at a time

### Form Components

**Input Group** (`frontend/components/ui/input-group.tsx`):
- Wrapper for input + icon/addon
- Flex layout with fixed icon width

**Textarea** (`frontend/components/ui/textarea.tsx`):
- Multi-line text input
- Resize handle in bottom-right
- Auto-expand on type (optional)

**Label** (`frontend/components/ui/label.tsx`):
- Associated with form inputs via `htmlFor`
- Uses `font-medium`, `text-sm`
- IMPORTANT: Always use for accessibility

## Styling Approach

### Tailwind CSS v4 with @theme Inline

The project uses Tailwind CSS v4 with inline theme defined in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --color-accent: #0000ee;
  /* ... more tokens ... */
}
```

**Rules**:
- IMPORTANT: Use Tailwind utility classes for styling
- Never use inline `style={}` for presentation
- Never hardcode colors - use design token CSS variables
- All custom styles go in component-level CSS (rarely needed)
- Reuse design tokens consistently across all components

### Color Application via Tailwind

When implementing designs:
1. Identify color usage (background, text, border, accent)
2. Map to semantic tokens: `bg-background`, `text-text-strong`, `border-border`, etc.
3. Use Tailwind utilities: `bg-accent`, `text-sm`, `rounded-md`, `shadow-sm`

**Examples**:
- Primary button: `bg-accent text-primary-foreground`
- Text: `text-text-strong`, `text-text-weak`, `text-muted-foreground`
- Borders: `border-border`, `border-border-weak`
- Backgrounds: `bg-background`, `bg-secondary`, `bg-card`

### Dark Mode

Dark mode colors automatically apply via `.dark` class in `globals.css`:
- Light text becomes dark
- Dark backgrounds become light
- Accents and semantics flip appropriately

**Rules**:
- IMPORTANT: Test all components in both light and dark modes
- Use semantic color tokens (they handle light/dark automatically)
- No need to write separate dark mode utilities

### Icon Sizing

**IMPORTANT**: Per CLAUDE.md, never use `w-` or `h-` classes on lucide icons.

Icons automatically size to 16px. For custom sizing:
- Use Tailwind size utilities on parent container
- Or wrap icon in sized container
- Example: `<div className="size-6"><Icon /></div>`

## Figma MCP Integration Rules

### Required Implementation Flow

1. **Get Design Context**: Call `get_design_context` for the exact node being implemented
2. **Get Screenshot**: Call `get_screenshot` for visual reference
3. **Map Design Tokens**: Match Figma colors/typography to CSS variables
4. **Implement**: Use shadcn/ui components + Tailwind utilities
5. **Validate**: Compare final UI against Figma screenshot for 1:1 parity

### Translation Rules

- **Figma Buttons** → Use `Button` component with appropriate variant/size
- **Figma Inputs** → Use `Input` component with label and validation
- **Figma Cards** → Use `Card` + `CardHeader/Content/Footer` structure
- **Figma Colors** → Map to CSS variable tokens in globals.css
- **Figma Typography** → Use Tailwind font-size + font-weight + line-height utilities
- **Figma Spacing** → Use Tailwind margin/padding/gap utilities (4px base)
- **Figma Shadows** → Use Tailwind shadow utilities

### Component Reuse

Before creating new components:
1. Check `frontend/components/ui/` for existing shadcn components
2. Check `frontend/components/` for custom feature components
3. Compose from existing components rather than duplicating
4. Only create new components if truly unique to project needs

### Asset Handling

- IMPORTANT: Use localhost sources from Figma MCP server directly
- DO NOT import new icon packages - use lucide-react only
- DO NOT create placeholders - use assets from Figma payload
- Store images in `frontend/public/` with descriptive names

## Project-Specific Conventions

### Imports

- Use path aliases: `@/components`, `@/lib`, `@/hooks`, `@/types`, `@/contexts`
- Group imports: React, third-party, internal components, utilities, hooks, types
- No relative imports beyond parent directory

### Component Patterns

- All UI components accept `className` prop for composition
- Variants use union types: `variant: 'primary' | 'secondary' | 'ghost'`
- Use `cva` (class-variance-authority) for variant management
- Export as named exports: `export function ComponentName() {}`

### State Management

- Use React Context for spatial/map state: `useSpatialContext`
- Use Next.js API routes for server actions
- Use client components (`'use client'`) only when needed

### Accessibility

- All interactive elements need `aria-label` or visible text
- Use semantic HTML: `<button>`, `<input>`, `<label>`, `<nav>`, etc.
- Test with keyboard navigation
- Color contrast must meet WCAG AA standards

### Code Quality

- Add JSDoc for exported components
- Use TypeScript strict mode
- No console.log statements in production code
- IMPORTANT: Never use comments in code (per CLAUDE.md)

## Map-Specific Components

### Mapbox Integration

- Map initialization: `frontend/components/map/hooks/useMapInitialization.ts`
- Marker layer: `frontend/components/map/layers/marker-layer.tsx`
- Layer detail panel: `frontend/components/map/layers/layer-detail.tsx`
- Legend: `frontend/components/map/legend.tsx`

**Rules**:
- Map padding adjusted for header (72px top, 56px bottom, 64px left/right)
- All layers must respect active area filtering
- Use spatial context for layer state management
- Icons on map use lucide-react without size classes (auto 16px)

## File Structure Reference

```
frontend/
├── app/
│   ├── globals.css              # Design tokens, Tailwind @theme
│   ├── layout.tsx               # Root layout with Header
│   └── [pages]/
├── components/
│   ├── ui/                      # shadcn/ui components (Button, Input, Badge, etc.)
│   ├── map/                     # Map-specific components
│   ├── headers/                 # Header components (main-header-panel.tsx)
│   ├── forms/                   # Form wrappers
│   └── [feature]/               # Feature-specific components
├── contexts/                    # React Contexts (user-context, spatial-context)
├── hooks/                       # Custom hooks
├── lib/                         # Utilities (cn, validators, gis-engine)
├── public/                      # Static assets
└── types/                       # TypeScript types and interfaces
```

## Design System Checklist

When implementing Figma designs:

- [ ] Use semantic color tokens (never hardcode hex)
- [ ] Use Tailwind utilities for layout and spacing
- [ ] Reuse existing components from `ui/`
- [ ] Include proper TypeScript types
- [ ] Test in light and dark modes
- [ ] Validate keyboard navigation
- [ ] Ensure accessibility (labels, alt text, ARIA)
- [ ] Validate 1:1 visual parity with Figma
- [ ] No inline styles
- [ ] No new icon libraries
- [ ] No relative imports beyond parent
- [ ] No console.log statements

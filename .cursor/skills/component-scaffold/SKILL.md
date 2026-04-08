---
name: component-scaffold
description: >-
  Scaffolds new React components following Aquacanvas project conventions.
  Use when creating new components, pages, or layouts to ensure consistent
  file structure, naming, and TypeScript patterns.
---

# Component Scaffold — Aquacanvas

## File naming

- **kebab-case** for all files and directories: `order-card.tsx`, `use-auth.ts`
- **PascalCase** for component exports: `export function OrderCard()`

## Where to place files

| Type | Path | Example |
|------|------|---------|
| Shadcn/UI primitives | `src/components/ui/` | `button.tsx` |
| Shared app components | `src/components/shared/` | `navbar.tsx` |
| Shop-specific | `src/components/shop/` | `upload-zone.tsx` |
| Dashboard-specific | `src/components/dashboard/` | `order-list.tsx` |
| Admin-specific | `src/components/admin/` | `admin-sidebar.tsx` |
| Pages | `src/app/{route-group}/` | `src/app/(shop)/create/page.tsx` |
| Hooks | `src/hooks/` | `use-order-status.ts` |
| Zustand stores | `src/stores/` | `cart-store.ts` |
| Zod validators | `src/validators/` | `order.ts` |
| TypeScript types | `src/types/` | `order.ts` |

## Component template

### Server Component (default)

```tsx
import { Card, CardContent } from '@/components/ui/card'

interface OrderCardProps {
  order: {
    id: string
    styleName: string
    status: string
    createdAt: string
  }
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-heading text-2xl tracking-[-0.03em] text-foreground">
          {order.styleName}
        </h3>
        <p className="font-sans text-base leading-[1.7] text-muted-foreground">
          {order.status}
        </p>
      </CardContent>
    </Card>
  )
}
```

### Client Component (only when needed)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  onUpload: (file: File) => void
  maxSizeMb: number
}

export function UploadZone({ onUpload, maxSizeMb }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-brand bg-brand/5' : 'border-outline-variant/20'
      }`}
    >
      <p className="font-sans text-muted-foreground">
        Drop your photo here or click to browse
      </p>
      <Button variant="secondary" className="mt-4">Choose File</Button>
    </div>
  )
}
```

## When to use `'use client'`

Only when the component needs:
- `useState`, `useReducer`, `useEffect`, `useRef`
- Event handlers (`onClick`, `onChange`, `onDrop`, etc.)
- Browser APIs (`window`, `document`)
- Motion/animation libraries
- Third-party client-only libraries

## Props pattern

Always define props as an `interface` above the component:

```tsx
interface Props {
  title: string
  description?: string
  isActive: boolean
  onAction: (id: string) => void
  children: React.ReactNode
}
```

Rules:
- Prefix booleans with `is`, `has`, `can`, `should`
- Prefix event handlers with `on` in props, `handle` in implementation
- Use `children: React.ReactNode` for composition
- Make optional props explicit with `?`

## Checklist before finishing a component

- [ ] TypeScript interface defined for all props
- [ ] Using design system tokens (not default Tailwind colors)
- [ ] `font-heading` for headings, `font-sans` for body
- [ ] Shadcn/UI components used for all UI primitives
- [ ] Interactive elements have hover, focus-visible, and active states
- [ ] Server Component unless client features are required
- [ ] File is kebab-case, export is PascalCase
- [ ] All user-facing strings via translations — never hardcoded
- [ ] Env vars via `src/lib/env.ts` — never `process.env.VAR!`

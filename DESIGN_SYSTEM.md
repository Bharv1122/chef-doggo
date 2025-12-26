# Chef Doggo - Design System

This document defines the visual design standards for Chef Doggo to ensure consistency across all features.

---

## Design Philosophy

**"Playful Modernism"** - Fun and approachable while maintaining trust and credibility.

### Core Principles
1. **Warm & Inviting** - Colors that evoke appetite and comfort
2. **Trustworthy** - Clean layouts that convey veterinary credibility
3. **Playful** - Rounded shapes, bouncy animations, dog-themed elements
4. **Accessible** - High contrast, readable fonts, mobile-first

---

## Color Palette

All colors use **OKLCH** format for better perceptual uniformity.

### Primary Colors

| Name | OKLCH Value | Hex Approx | Usage |
|------|-------------|------------|-------|
| **Primary (Orange)** | `oklch(0.75 0.18 55)` | #FF8C42 | CTAs, highlights, energy |
| **Primary Foreground** | `oklch(0.98 0.01 90)` | #FFFAF5 | Text on primary |

### Secondary Colors

| Name | OKLCH Value | Hex Approx | Usage |
|------|-------------|------------|-------|
| **Secondary (Green)** | `oklch(0.65 0.2 145)` | #4CAF50 | Fresh ingredients, success |
| **Secondary Foreground** | `oklch(0.98 0.01 145)` | #F0FFF0 | Text on secondary |

### Accent Colors

| Name | OKLCH Value | Hex Approx | Usage |
|------|-------------|------------|-------|
| **Accent (Brown)** | `oklch(0.55 0.1 50)` | #8D6E63 | Warm accents, earthy |
| **Accent Foreground** | `oklch(0.98 0.02 50)` | #FFF8F0 | Text on accent |

### Neutral Colors

| Name | OKLCH Value | Usage |
|------|-------------|-------|
| **Background** | `oklch(0.985 0.01 90)` | Page background (warm cream) |
| **Foreground** | `oklch(0.25 0.05 50)` | Primary text (warm dark) |
| **Muted** | `oklch(0.95 0.02 90)` | Secondary backgrounds |
| **Muted Foreground** | `oklch(0.5 0.03 50)` | Secondary text |
| **Border** | `oklch(0.88 0.03 60)` | Borders, dividers |

### Semantic Colors

| Name | OKLCH Value | Usage |
|------|-------------|-------|
| **Destructive** | `oklch(0.55 0.25 25)` | Errors, delete actions |
| **Warning** | `oklch(0.75 0.15 85)` | Warnings, cautions |
| **Success** | `oklch(0.65 0.2 145)` | Success states |

---

## Typography

### Font Families

```css
--font-heading: 'Fredoka', sans-serif;  /* Rounded, friendly */
--font-body: 'Nunito', sans-serif;      /* Clean, readable */
```

### Loading Fonts (in index.html)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | Fredoka | 3rem (48px) | 700 | 1.2 |
| H2 | Fredoka | 2.25rem (36px) | 600 | 1.3 |
| H3 | Fredoka | 1.5rem (24px) | 600 | 1.4 |
| H4 | Fredoka | 1.25rem (20px) | 500 | 1.4 |
| Body | Nunito | 1rem (16px) | 400 | 1.6 |
| Body Large | Nunito | 1.125rem (18px) | 400 | 1.6 |
| Small | Nunito | 0.875rem (14px) | 400 | 1.5 |
| Caption | Nunito | 0.75rem (12px) | 400 | 1.4 |

---

## Spacing System

Use Tailwind's default spacing scale consistently:

| Name | Value | Usage |
|------|-------|-------|
| xs | 0.25rem (4px) | Tight spacing |
| sm | 0.5rem (8px) | Small gaps |
| md | 1rem (16px) | Default spacing |
| lg | 1.5rem (24px) | Section padding |
| xl | 2rem (32px) | Large sections |
| 2xl | 3rem (48px) | Hero sections |
| 3xl | 4rem (64px) | Major sections |

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 0.375rem | Small elements |
| md | 0.5rem | Buttons, inputs |
| lg | 0.75rem | Cards |
| xl | 1rem | Large cards |
| 2xl | 1.5rem | Hero elements |
| full | 9999px | Pills, avatars |

---

## Shadows

```css
--shadow-sm: 0 1px 2px oklch(0.25 0.05 50 / 0.05);
--shadow-md: 0 4px 6px oklch(0.25 0.05 50 / 0.07);
--shadow-lg: 0 10px 15px oklch(0.25 0.05 50 / 0.1);
--shadow-xl: 0 20px 25px oklch(0.25 0.05 50 / 0.15);
```

---

## Component Patterns

### Buttons

**Primary Button**
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-semibold">
  Get Started
</Button>
```

**Secondary Button**
```jsx
<Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 rounded-full">
  Learn More
</Button>
```

### Cards

```jsx
<div className="bg-card rounded-xl p-6 shadow-md border border-border">
  {/* Card content */}
</div>
```

### Input Fields

```jsx
<Input className="rounded-lg border-2 border-border focus:border-primary px-4 py-3" />
```

---

## Animations

### Micro-interactions

**Hover Scale**
```css
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}
```

**Bounce In**
```css
@keyframes bounceIn {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
```

**Float**
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Framer Motion Presets

```jsx
// Fade in from bottom
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Stagger children
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Scale on hover
const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};
```

---

## Iconography

### Icon Library
Use **Lucide React** for all icons.

```jsx
import { Camera, Dog, ChefHat, Heart, Sparkles } from 'lucide-react';
```

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| sm | `w-4 h-4` | Inline with text |
| md | `w-5 h-5` | Buttons |
| lg | `w-6 h-6` | Navigation |
| xl | `w-8 h-8` | Feature icons |
| 2xl | `w-12 h-12` | Hero icons |

---

## Decorative Elements

### Paw Print Pattern

Use as subtle background pattern:
```css
.paw-pattern {
  background-image: url("data:image/svg+xml,...");
  background-size: 60px;
  opacity: 0.03;
}
```

### Food Emoji Accents

Floating food emojis for playful sections:
- 🥕 Carrots
- 🥩 Meat
- 🍠 Sweet potato
- 🥦 Broccoli
- 🐕 Dog

---

## Responsive Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Mobile-First Approach

Always design for mobile first, then add larger breakpoints:

```jsx
<div className="px-4 md:px-8 lg:px-16">
  <h1 className="text-2xl md:text-4xl lg:text-5xl">
    Turn Kibble into Cuisine
  </h1>
</div>
```

---

## Accessibility

### Color Contrast
- All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Primary orange on white: ✅ Passes
- Use `text-foreground` on `bg-background` for body text

### Focus States
```css
:focus-visible {
  outline: 2px solid oklch(0.75 0.18 55);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum 44x44px for all interactive elements on mobile
- Use `min-h-[44px] min-w-[44px]` for buttons

---

## Brand Assets

### Logo
- **Primary:** `/client/public/chef-doggo-logo.png` (with text)
- **Icon only:** `/client/public/chef-doggo-icon.png` (for favicon)

### Mascot
- Red heeler puppy with white chef hat
- Friendly, approachable expression
- Used in hero sections and empty states

---

## Do's and Don'ts

### Do ✅
- Use warm, appetizing colors
- Include playful micro-animations
- Show the Chef Doggo mascot in empty states
- Use rounded corners consistently
- Add veterinary disclaimers prominently

### Don't ❌
- Use cold blues or grays as primary colors
- Make animations distracting or slow
- Hide important warnings in small text
- Use sharp corners (feels clinical)
- Overcrowd with too many elements

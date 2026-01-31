# GameServersHub Theme Specification

> **Purpose:** This document defines the official GameServersHub design system. Use this as a reference when building any GSH product to ensure visual consistency across all platforms.

---

## Brand Identity

**Brand:** GameServersHub (GSH)
**Style:** Modern dark gaming aesthetic with professional polish
**Target:** Gamers managing game servers

---

## Color Palette

### Primary Colors (Emerald)

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#047857` | Main brand color, buttons, links, accents |
| Primary Light | `#10B981` | Hover states, highlights, success indicators |
| Primary Dark | `#065F46` | Active states, pressed buttons |

### Secondary Colors (Purple)

| Name | Hex | Usage |
|------|-----|-------|
| Secondary | `#A855F7` | Accent elements, special features, badges |
| Secondary Light | `#C084FC` | Hover states, highlights |
| Secondary Dark | `#9333EA` | Active states, pressed buttons |

### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| Background Default | `#1A1A1E` | Main page background |
| Background Paper | `#16181D` | Cards, panels, modals |
| Background Secondary | `#25262B` | Slightly elevated surfaces |
| Background Tertiary | `#2C2E33` | Card backgrounds, sections |
| Surface | `#1F2937` | Interactive elements |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#E5E7EB` | Main text, headings |
| Text Secondary | `#9CA3AF` | Secondary text, descriptions, captions |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#10B981` | Success states, online indicators |
| Error | `#EF4444` | Error states, destructive actions |
| Warning | `#F59E0B` | Warning states, caution indicators |
| Info | `#06B6D4` | Informational elements |
| Divider | `#374151` | Borders, separators |

---

## Typography

### Font Families

```css
/* Primary font */
font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;

/* Headings (optional) */
font-family: 'Poppins', 'Inter', sans-serif;
```

### Type Scale

| Variant | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| h1 | clamp(2.25rem, 5vw, 3.75rem) | 700 | 1.2 | -0.02em |
| h2 | clamp(1.875rem, 4vw, 3rem) | 600 | 1.3 | -0.01em |
| h3 | clamp(1.5rem, 3vw, 2.25rem) | 600 | 1.3 | 0 |
| h4 | clamp(1.25rem, 2vw, 1.5rem) | 600 | 1.4 | 0 |
| h5 | clamp(1.125rem, 1.5vw, 1.25rem) | 500 | 1.4 | 0 |
| h6 | 0.875rem | 600 | 1.4 | 0.05em (uppercase) |
| body1 | 1rem | 400 | 1.6 | 0 |
| body2 | 0.875rem | 400 | 1.5 | 0 |
| button | 0.875rem | 600 | - | 0.01em |
| caption | 0.75rem | 400 | 1.66 | 0 |

---

## Component Styling

### Border Radius

| Element | Radius |
|---------|--------|
| Default | 8px |
| Cards | 12px |
| Chips/Tags | 16px |
| Buttons | 8px |

### Shadows

```css
/* Card shadow */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

/* Card hover shadow */
box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);

/* Button glow (primary) */
box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);

/* Button glow (secondary) */
box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
```

### Transitions

```css
/* Default transition */
transition: all 0.2s ease-in-out;
```

### Scrollbar Styling

```css
/* Track */
background: #16181D;

/* Thumb */
background-color: #047857;
border-radius: 4px;

/* Thumb hover */
background-color: #10B981;
```

---

## Button Styles

### Primary Button

```css
background-color: #047857;
color: white;
border-radius: 8px;
font-weight: 600;
text-transform: none;

/* Hover */
background-color: #065F46;
box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
transform: scale(1.02);
```

### Secondary Button

```css
background-color: #A855F7;
color: white;

/* Hover */
background-color: #9333EA;
box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
```

### Outlined Button

```css
border-width: 2px;
border-color: #047857;
background: transparent;
```

---

## Card Styles

```css
background-color: #16181D;
border: 1px solid #374151;
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

/* Hover */
border-color: #10B981;
box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
```

---

## Chip/Badge Styles

### Primary Chip

```css
background-color: rgba(4, 120, 87, 0.1);
color: #10B981;
border: 1px solid rgba(16, 185, 129, 0.3);
border-radius: 16px;
font-weight: 600;
```

### Secondary Chip

```css
background-color: rgba(168, 85, 247, 0.1);
color: #C084FC;
border: 1px solid rgba(192, 132, 252, 0.3);
```

---

## Input/TextField Styles

```css
border-radius: 8px;
background-color: #16181D;
border: 1px solid #374151;

/* Hover */
border-color: #047857;

/* Focus */
border-color: #10B981;
```

---

## Animations

### Fade In

```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
animation: fadeIn 0.3s ease-in-out;
```

### Slide Up

```css
@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
animation: slideUp 0.4s ease-out;
```

### Pulse Slow

```css
animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

---

## Tailwind CSS Configuration

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#047857',
          dark: '#065f46',
          light: '#059669',
        },
        secondary: {
          DEFAULT: '#A855F7',
          dark: '#9333EA',
          light: '#C084FC',
        },
        background: {
          DEFAULT: '#1A1A1E',
          secondary: '#25262B',
          tertiary: '#2C2E33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
```

---

## Material-UI Theme

```typescript
// theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#047857',
      light: '#10B981',
      dark: '#065F46',
    },
    secondary: {
      main: '#A855F7',
      light: '#C084FC',
      dark: '#9333EA',
    },
    background: {
      default: '#1A1A1E',
      paper: '#16181D',
    },
    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
    },
    divider: '#374151',
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    info: { main: '#06B6D4' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
});
```

---

## Global CSS Base

```css
@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
      'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
      'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #1A1A1E;
    color: #E5E7EB;
  }
}
```

---

## Usage Guidelines

### Color Usage

1. **Primary (Emerald)** - Use for main CTAs, links, active states, brand elements
2. **Secondary (Purple)** - Use sparingly for special features, premium badges, accents
3. **Background layers** - Use darker shades for depth hierarchy (default → paper → surface)
4. **Text** - Primary for headings/important text, secondary for descriptions

### Accessibility

- Primary color meets WCAG AAA compliance (7.1:1 contrast ratio)
- Always ensure sufficient contrast between text and backgrounds
- Use semantic colors consistently (success=green, error=red, warning=amber)

### Hover States

- Buttons: Scale up slightly (1.02) + add glow shadow
- Cards: Border color changes to primary light + enhanced shadow
- Links: Use primary light color

### Dark Theme Only

This theme is designed exclusively for dark mode. Do not implement light mode variants.

---

## Quick Reference

```
Primary:    #047857 (Emerald-700)
Secondary:  #A855F7 (Purple-500)
Background: #1A1A1E
Paper:      #16181D
Text:       #E5E7EB
Muted:      #9CA3AF
Border:     #374151
Success:    #10B981
Error:      #EF4444
Warning:    #F59E0B
Info:       #06B6D4
```

---

**Apply this theme consistently across all GameServersHub products for brand unity.**

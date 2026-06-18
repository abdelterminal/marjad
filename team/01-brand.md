# Brand — MARJAD

## Status: Placeholder

User will provide logo, final color palette, and typography assets. The direction below is a working placeholder the UI can build against — replace with real assets once delivered.

## Positioning

MARJAD is a **premium Moroccan interior decoration brand** — not fast furniture, not a bazaar. It sits between artisanal heritage and modern home aesthetics: thoughtfully made objects that bring warmth and character to a room.

**Tagline (placeholder):** "L'art de décorer / فن التزيين"

## Voice & tone

- French: warm, confident, slightly editorial — like a curated design magazine, not a discount flyer
- Arabic: same warmth, more direct — functional and trustworthy
- Avoid superlatives ("meilleur", "incroyable") — let the product imagery speak

## Visual direction (placeholder — to be replaced by user assets)

### Palette

Earthy, premium, interior-design aesthetic. Inspired by Moroccan zellige, terracotta, natural linen:

| Role | Name | Hex |
|---|---|---|
| Primary | Terracotta warm | `#C4622D` |
| Primary dark | Deep clay | `#8B3E1A` |
| Secondary | Sand gold | `#D4A853` |
| Surface | Warm white | `#FAF7F2` |
| Surface alt | Linen | `#F0EBE1` |
| Text primary | Charcoal | `#1A1A1A` |
| Text secondary | Warm gray | `#6B6560` |
| Border | Stone | `#E0D9CF` |
| Success | Sage | `#5C7A5C` |
| Error | Brick | `#B94040` |

### Typography (placeholder)

- **Display / headings:** Playfair Display (FR) / Amiri (AR) — elegant, editorial serif
- **Body / UI:** Inter (FR) / Cairo (AR) — clean, readable at small sizes
- **Monospace / prices:** Inter — consistent number alignment

### Spacing & radius

- Base spacing: 4px grid
- Border radius: `8px` (cards), `4px` (inputs), `9999px` (pills/badges)
- Elevation: minimal shadow — `0 1px 3px rgba(0,0,0,0.08)` for cards

## CSS token block (Tailwind — placeholder values)

```js
// tailwind.config token extensions
colors: {
  brand: {
    primary:    '#C4622D',
    'primary-dark': '#8B3E1A',
    secondary:  '#D4A853',
    surface:    '#FAF7F2',
    'surface-alt': '#F0EBE1',
    text:       '#1A1A1A',
    'text-muted': '#6B6560',
    border:     '#E0D9CF',
    success:    '#5C7A5C',
    error:      '#B94040',
  }
}
```

> **Replace this entire file** with the real brand guidelines once the user delivers logo + assets.

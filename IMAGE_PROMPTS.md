# MARJAD — Image Generation Prompts
# Generate these with ChatGPT Image (DALL·E 3) or any AI image tool.
# Save the outputs to: public/images/<filename>
# All images should be high-resolution (1200px+ wide), no text/watermarks.

---

## 1. hero-bg.png
**Path:** `public/images/hero-bg.png`
**Dimensions:** 1920×1080px (landscape)
**Used in:** Homepage hero section (full-bleed background)

**Prompt:**
A stunning wide-angle interior photograph of a beautifully decorated Moroccan-inspired living room. Warm late-afternoon sunlight streams through latticed mashrabiya windows casting geometric shadow patterns on terracotta-toned walls. The room features handcrafted artwork, a sculptural brass lamp, artisan ceramic vases, and a low wooden table with carved details. Rich textures: zellige tile accents, handwoven wool rugs in deep amber and ivory, raw linen cushions. The palette is earthy and warm — terracotta, burnished copper, golden amber, cream. Cinematic depth of field. No people. No text. Shot with a 35mm lens, editorial interior photography style, magazine quality, ultra-realistic.

---

## 2. brand-story.png
**Path:** `public/images/brand-story.png`
**Dimensions:** 800×1000px (portrait)
**Used in:** Homepage brand story section (right column image)

**Prompt:**
An intimate portrait-format editorial photograph of a Moroccan artisan workshop at golden hour. Hands of a craftsman carefully painting intricate geometric patterns on a ceramic plate, surrounded by handmade pottery, copper trays, and colorful glazed tiles. Warm workshop light, wooden workbenches, soft bokeh background showing hanging lanterns and stacked ceramics. The color palette is warm — terracotta orange, golden yellow, deep brown, cream white. No faces visible. No text. Ultra-realistic artisan craftsmanship photography, rich detail, editorial quality.

---

## 3. about-story.png
**Path:** `public/images/about-story.png`
**Dimensions:** 800×1000px (portrait)
**Used in:** About page story section (left column image)

**Prompt:**
A warm editorial lifestyle photograph showing a beautifully styled corner of a Moroccan home. A hand-carved wooden side table holds a brass candleholder with a lit candle, a small terracotta vase with dried pampas grass, and a folded artisan textile in deep amber tones. Soft natural light from an arched window, warm terracotta wall, zellige tile floor partially visible. The mood is calm, luxurious, intimate. No people visible. No text. Editorial interior photography, shot with natural light, warm color temperature, ultra-realistic, magazine quality.

---

## 4. category-tableaux.png
**Path:** `public/images/category-tableaux.png`
**Dimensions:** 600×800px (portrait)
**Used in:** Homepage category card for "Tableaux" (wall art)

**Prompt:**
A styled interior wall featuring three handcrafted Moroccan-style artisan wall artworks. One geometric abstract canvas in terracotta and gold, one calligraphy-inspired mixed media piece in warm ochre tones, one textured relief panel in clay and copper. The wall is warm white with subtle texture, a narrow wooden shelf below holds a small ceramic vase. Soft studio lighting with warm shadows. No faces. No text. Editorial product photography, clean composition, ultra-realistic.

---

## 5. category-lampes.png
**Path:** `public/images/category-lampes.png`
**Dimensions:** 600×800px (portrait)
**Used in:** Homepage category card for "Lampes" (lamps)

**Prompt:**
A beautifully lit photograph of artisan Moroccan lamps. A tall brass floor lamp with an intricate pierced geometric shade casting warm star-pattern light on a cream wall. Beside it, a smaller hammered copper table lamp with amber glass. In the background, a hanging lantern with colored glass panels (amber, ruby). The scene is intimate, warm, glowing. Dark warm background, the lamps are the only light source creating magical bokeh. No people. No text. Editorial lighting photography, ultra-realistic, artisan luxury aesthetic.

---

## 6. category-tables.png
**Path:** `public/images/category-tables.png`
**Dimensions:** 600×800px (portrait)
**Used in:** Homepage category card for "Tables"

**Prompt:**
An artisan Moroccan carved wooden coffee table styled in a warm living room setting. The table has intricate hand-carved geometric fretwork on the sides, deep walnut finish with brass inlay details on the top. On the table surface: a small brass tray with tea glasses, a single white candle, a book with a linen cover. Soft warm light, cream wool rug underneath, terracotta cushions in the background. No people. No text. Editorial furniture photography, ultra-realistic, premium artisan aesthetic.

---

## 7. category-terroir.png
**Path:** `public/images/category-terroir.png`
**Dimensions:** 600×800px (portrait)
**Used in:** Homepage category card for "Terroir" (decorative objects)

**Prompt:**
A flat-lay editorial arrangement of beautiful Moroccan artisan decorative objects on a warm cream stone surface. Objects include: a hand-painted glazed ceramic bowl in deep cobalt and terracotta, small argan oil amber bottles with cork stoppers, a bundle of dried rose petals tied with jute twine, a hammered copper plate, a small woven palm basket, dried saffron threads on a ceramic dish. Warm overhead natural light with soft shadows. No people. No text. Editorial still life photography, warm color palette, ultra-realistic, artisan luxury.

---

## Usage Notes
- Compress all images to WebP format before use (use `sharp` or Squoosh)
- Hero bg: target < 300KB
- Portrait images: target < 150KB each
- Add to `public/images/` folder (this folder is gitignored — don't commit photos)
- If using Next.js `<Image>` component, add domains/paths to `next.config.js` if needed

## Color reference for consistency
- Terracotta: #C4622D
- Golden amber: #D4A853
- Cream: #FAF7F2
- Dark warm: #1A0E08
- All photos should feel warm (color temperature 3000–4500K equivalent)

/**
 * Slug utilities — used by admin product/category create flows.
 */

/**
 * Convert a French/Arabic string to a URL-safe slug.
 * - Lowercases
 * - Normalises NFD (decomposes diacritics) then strips combining marks
 * - Replaces spaces (and other whitespace) with hyphens
 * - Strips any remaining non-alphanumeric / non-hyphen characters
 * - Collapses consecutive hyphens; trims leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // decompose accented characters → base + combining mark
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[؀-ۿݐ-ݿࢠ-ࣿ]+/g, () => {
      // Arabic characters — keep as-is (they are valid in slugs) but
      // replace with a transliteration placeholder to stay ASCII-only slugs.
      // For simplicity we strip them (admin uses nameFr for slugs).
      return '';
    })
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/[^a-z0-9-]/g, '') // strip non-alphanumeric / non-hyphen
    .replace(/-{2,}/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim
}

/**
 * Ensure a slug is unique by appending -2, -3, … until the check passes.
 * @param base              The initial slug (already slugified)
 * @param existingCheck     Async predicate — returns true if the slug is TAKEN
 */
export async function ensureUniqueSlug(
  base: string,
  existingCheck: (s: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let suffix = 2;

  while (await existingCheck(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix++;
  }

  return candidate;
}

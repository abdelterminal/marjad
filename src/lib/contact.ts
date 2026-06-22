const PLACEHOLDER_WHATSAPP_NUMBERS = new Set(['212000000000', '212XXXXXXXXX']);

export function getPublicWhatsAppNumber() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!number || PLACEHOLDER_WHATSAPP_NUMBERS.has(number)) return null;

  const normalized = number.replace(/[^\d]/g, '');
  return normalized || null;
}

export function getWhatsAppHref(message?: string) {
  const number = getPublicWhatsAppNumber();
  if (!number) return null;

  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

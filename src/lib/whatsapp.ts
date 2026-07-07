import { formatMAD } from '@/lib/money';

export interface WhatsappOrderContext {
  id: number;
  customerName: string;
  status: string;
  total: string;
  city: string;
  address: string;
  items: Array<{ product: { nameFr: string } | null }>;
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

export function getWhatsappPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return normalized.startsWith('0') ? `212${normalized.slice(1)}` : normalized.replace(/^\+/, '');
}

export function getWhatsappMessage(order: WhatsappOrderContext) {
  const total = formatMAD(parseFloat(order.total));
  const firstItem = order.items[0]?.product?.nameFr ?? 'votre commande';

  if (order.status === 'confirmed') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} (${total}) est confirmée. Nous la préparons avec soin et vous informerons dès son expédition.`;
  }

  if (order.status === 'shipped') {
    return `Bonjour ${order.customerName}, votre commande MARJAD #${order.id} est en route vers ${order.city}. Paiement à la livraison : ${total}. Merci de garder votre téléphone disponible.`;
  }

  if (order.status === 'cancelled') {
    return `Bonjour ${order.customerName}, nous vous contactons au sujet de votre commande MARJAD #${order.id}. Dites-nous si vous souhaitez la réactiver ou modifier les informations.`;
  }

  return `Bonjour ${order.customerName}, c'est MARJAD. Nous vous contactons pour confirmer votre commande #${order.id} : ${firstItem} (${total}), livraison à ${order.city}. Pouvez-vous confirmer l'adresse : ${order.address} ?`;
}

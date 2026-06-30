import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { adminExportOrders } from '@/lib/queries/orders';
import { formatMAD } from '@/lib/money';
import { noStoreJson } from '@/lib/http';

const VALID_STATUSES = new Set([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);
const EXPORT_PRESETS = {
  'to-confirm': { status: 'pending', filename: 'a-confirmer' },
  'ready-to-ship': { status: 'confirmed', filename: 'pretes-expedition' },
  'in-transit': { status: 'shipped', filename: 'en-transit' },
  delivered: { status: 'delivered', filename: 'livrees' },
} as const;

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: string[][]) {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const presetParam = req.nextUrl.searchParams.get('preset')?.trim() ?? '';
  const preset = presetParam in EXPORT_PRESETS ? EXPORT_PRESETS[presetParam as keyof typeof EXPORT_PRESETS] : null;
  const statusParam = req.nextUrl.searchParams.get('status')?.trim() ?? '';
  if (
    (presetParam && !preset) ||
    (statusParam && !VALID_STATUSES.has(statusParam)) ||
    (preset && statusParam && preset.status !== statusParam)
  ) {
    return noStoreJson({ error: "Filtre d'export invalide." }, { status: 400 });
  }
  const status = preset?.status ?? (VALID_STATUSES.has(statusParam) ? statusParam : undefined);
  const orders = await adminExportOrders(status);

  const header = [
    'order_id',
    'status',
    'customer_name',
    'customer_phone',
    'city',
    'address',
    'total_mad',
    'payment_method',
    'items',
    'notes',
    'created_at',
  ];

  const body = orders.map((order) => [
    String(order.id),
    order.status,
    order.customerName,
    order.customerPhone,
    order.city,
    order.address,
    formatMAD(parseFloat(order.total)),
    order.paymentMethod,
    order.items
      .map((item) => `${item.quantity}x ${item.product.nameFr} (${item.product.slug})`)
      .join(' | '),
    order.notes ?? '',
    order.createdAt.toISOString(),
  ]);

  const csv = `\uFEFF${toCsv([header, ...body])}`;
  const filenameLabel = preset?.filename ?? status;
  const filename = `marjad-orders${filenameLabel ? `-${filenameLabel}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

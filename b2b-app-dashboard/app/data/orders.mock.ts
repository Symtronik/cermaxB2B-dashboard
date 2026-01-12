// ~/data/orders.mock.ts
export type OrderStatus = 'new' | 'paid' | 'processing' | 'shipped' | 'cancelled'

export type Customer = {
  id: string
  name: string
  email: string
  nip: string
  paymentTermsDays: number
}

export type Product = {
  id: string
  sku: string
  name: string
  price: number
  vatRate: number
}

export type OrderItem = {
  productId: string
  sku: string
  name: string
  qty: number
  unitPrice: number
  vatRate: number
}

export type Order = {
  id: string
  customerId: string
  createdAt: string // YYYY-MM-DD (łatwiej do input[type=date])
  status: OrderStatus
  discountPercent: number
  note: string
  items: OrderItem[]
}

// ---------- MOCK DANE ----------
export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Firma ABC Sp. z o.o.', email: 'zakupy@abc.pl', nip: '1234567890', paymentTermsDays: 14 },
  { id: 'c2', name: 'Hurtownia Delta', email: 'b2b@delta.pl', nip: '9876543210', paymentTermsDays: 7 },
  { id: 'c3', name: 'Sklep Omega', email: 'kontakt@omega.pl', nip: '5554443332', paymentTermsDays: 30 }
]

export const mockProducts: Product[] = [
  { id: 'p1', sku: 'CER-001', name: 'Płytka gres 60x60', price: 89.99, vatRate: 23 },
  { id: 'p2', sku: 'CER-002', name: 'Fuga elastyczna 2kg', price: 24.5, vatRate: 23 },
  { id: 'p3', sku: 'CER-003', name: 'Klej do płytek 25kg', price: 39.0, vatRate: 8 },
  { id: 'p4', sku: 'CER-004', name: 'Listwa wykończeniowa', price: 15.9, vatRate: 23 }
]

export const mockOrdersSeed: Order[] = [
  {
    id: 'ZAM-10241',
    customerId: 'c1',
    createdAt: '2026-01-05',
    status: 'new',
    discountPercent: 5,
    note: 'Proszę o szybką wysyłkę.',
    items: [
      { productId: 'p1', sku: 'CER-001', name: 'Płytka gres 60x60', qty: 10, unitPrice: 89.99, vatRate: 23 },
      { productId: 'p2', sku: 'CER-002', name: 'Fuga elastyczna 2kg', qty: 4, unitPrice: 24.5, vatRate: 23 }
    ]
  },
  {
    id: 'ZAM-10240',
    customerId: 'c2',
    createdAt: '2026-01-05',
    status: 'paid',
    discountPercent: 0,
    note: '',
    items: [{ productId: 'p3', sku: 'CER-003', name: 'Klej do płytek 25kg', qty: 8, unitPrice: 39.0, vatRate: 8 }]
  },
  {
    id: 'ZAM-10239',
    customerId: 'c3',
    createdAt: '2026-01-04',
    status: 'processing',
    discountPercent: 3,
    note: 'Dostawa na rampę.',
    items: [
      { productId: 'p4', sku: 'CER-004', name: 'Listwa wykończeniowa', qty: 12, unitPrice: 15.9, vatRate: 23 }
    ]
  }
]

// ---------- Helpery ----------
export function formatPLN(v: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v)
}

export function statusLabel(s: OrderStatus) {
  switch (s) {
    case 'new': return 'Nowe'
    case 'paid': return 'Opłacone'
    case 'processing': return 'W realizacji'
    case 'shipped': return 'Wysłane'
    case 'cancelled': return 'Anulowane'
  }
}

export function statusColor(s: OrderStatus) {
  switch (s) {
    case 'new': return 'primary'
    case 'paid': return 'green'
    case 'processing': return 'amber'
    case 'shipped': return 'blue'
    case 'cancelled': return 'red'
  }
}

export function calcSubtotal(order: Pick<Order, 'items'>) {
  return order.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
}

export function calcDiscountValue(subtotal: number, discountPercent: number) {
  return Math.max(0, (subtotal * (discountPercent || 0)) / 100)
}

export function calcVatTotal(order: Pick<Order, 'items' | 'discountPercent'>) {
  const subtotal = calcSubtotal(order)
  if (subtotal <= 0) return 0

  const discount = calcDiscountValue(subtotal, order.discountPercent)
  const after = Math.max(0, subtotal - discount)
  const ratio = after / subtotal

  return order.items.reduce((sum, i) => {
    const line = i.qty * i.unitPrice
    const lineAfter = line * ratio
    return sum + lineAfter * (i.vatRate / 100)
  }, 0)
}

export function calcGrandTotal(order: Pick<Order, 'items' | 'discountPercent'>) {
  const sub = calcSubtotal(order)
  const disc = calcDiscountValue(sub, order.discountPercent)
  const vat = calcVatTotal(order)
  return Math.max(0, sub - disc) + vat
}

export function getCustomer(customerId: string) {
  return mockCustomers.find(c => c.id === customerId) || null
}

export function getOrderById(orders: Order[], id: string) {
  return orders.find(o => o.id === id) || null
}

export function nextOrderId(orders: Order[]) {
  // proste generowanie: ZAM-xxxxx
  const nums = orders
    .map(o => Number(String(o.id).replace(/\D/g, '')))
    .filter(n => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 10240) + 1
  return `ZAM-${next}`
}

export function getOrdersByCustomer(orders: Order[], customerId: string) {
  return orders.filter(o => o.customerId === customerId)
}

export function calcCustomerStats(orders: Order[]) {
  const ordersCount = orders.length
  const revenue = orders.reduce((sum, o) => sum + calcGrandTotal(o), 0)
  const lastOrderDate = ordersCount
    ? orders.map(o => o.createdAt).sort().at(-1) ?? null
    : null

  return { ordersCount, revenue, lastOrderDate }
}

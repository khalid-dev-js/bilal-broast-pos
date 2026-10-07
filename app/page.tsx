'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Filter,
  Home,
  LogOut,
  Minus,
  Package,
  Pencil,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'

const imageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PjAPlM2DApGA4EwoNccgHRstb2MJi2.png'
const loginCredentials = { id: 'admin@bilalbroast.test', password: 'changeme123' }

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Orders', icon: ClipboardList },
]

const productApiUrl = '/api/products'
const localOrdersApiUrl = '/api/orders/local'
const paymentOptions = [
  { label: 'Cash', icon: CircleDollarSign },
  { label: 'Card', icon: CreditCard },
  { label: 'Wallet', icon: WalletCards },
]

const baseProducts = [
  { name: 'Zinger Burger', price: 550, image: imageUrl, category: 'Burgers', description: 'Crispy chicken fillet with fresh lettuce and sauce.' },
  { name: 'Nashville Fries', price: 150, image: imageUrl, category: 'Fries', description: 'Crispy seasoned fries with a crunchy golden finish.' },
  { name: 'Cheese Broast 2pc', price: 900, image: imageUrl, category: 'Chicken', description: 'Two pieces of crispy broast with a cheesy crunch.' },
  { name: 'Regular Broast 2pc', price: 900, image: imageUrl, category: 'Chicken', description: 'Classic pair of broast with signature spices.' },
  { name: 'Chicken Burger', price: 450, image: imageUrl, category: 'Burgers', description: 'Juicy chicken burger with grilled flavor.' },
  { name: 'Chicken Breast 1pc', price: 150, image: imageUrl, category: 'Chicken', description: 'Single tender chicken breast serving.' },
  { name: 'Regular Broast 4pc', price: 900, image: imageUrl, category: 'Chicken', description: 'Family-size broast pack for sharing.' },
  { name: 'Masala Fries', price: 150, image: imageUrl, category: 'Fries', description: 'Golden fries tossed with masala seasoning.' },
  { name: 'Chicken Breast 2pc', price: 900, image: imageUrl, category: 'Chicken', description: 'Double portion of crispy chicken breast.' },
  { name: 'Zinger Rage 2pc', price: 900, image: imageUrl, category: 'Deals', description: 'Double zinger combo with a signature meal feel.' },
  { name: 'Family Broast Meal', price: 900, image: imageUrl, category: 'Deals', description: 'Family meal with broast and drinks.' },
  { name: 'Pepsi Can', price: 100, image: imageUrl, category: 'Drinks', description: 'Chilled Pepsi can served cold.' },
]

type Product = {
  id?: string
  slug?: string
  name: string
  price: number
  image: string
  category: string
  description?: string
}

type CartItem = Product & { qty: number }

type SortMode = 'Newest' | 'Oldest' | 'Highest Amount'

type LocalOrder = {
  _id?: string
  orderNumber?: string
  items?: Array<{
    nameSnapshot?: string
    quantity?: number
    priceSnapshot?: number
    lineTotal?: number
    product?: string | { _id?: string }
  }>
  paymentMethod?: string
  grandTotal?: number
  subtotal?: number
  createdAt?: string
  orderStatus?: string
}

type ReceiptSlip = {
  orderId: string
  category: string
  orderType: string
  date: string
  time: string
  cashier: string
  server: string
  items: Array<{
    name: string
    qty: number
    amount: number
  }>
  subtotal: number
  gst: number
  total: number
}

function normalizeBackendProduct(item: any): Product {
  return {
    id: item?._id ? String(item._id) : undefined,
    slug: item?.slug || undefined,
    name: item?.name || 'Unnamed product',
    price: Number(item?.price ?? 0),
    image: item?.image || item?.category?.image || imageUrl,
    category: item?.category?.name || 'General',
    description: item?.description || 'Freshly prepared item from Bilal Broast.',
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function truncateText(value: string, maxLength: number) {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}â€¦` : value
}

function centerText(value: string, width = 32) {
  const safeValue = value.trim() || ''
  if (safeValue.length >= width) return safeValue
  const leftPad = Math.max(0, Math.floor((width - safeValue.length) / 2))
  return `${' '.repeat(leftPad)}${safeValue}`
}

function formatItemLine(name: string, qty: number, amount: number, width = 32) {
  const left = truncateText(name, 18)
  const right = `${qty} x ${formatCurrency(amount)}`
  const gap = width - left.length - right.length
  return `${left}${' '.repeat(Math.max(1, gap))}${right}`
}

function buildEscPosLines(slip: ReceiptSlip) {
  const width = 32

  const subtotal = formatCurrency(slip.subtotal)
  const gst = formatCurrency(slip.gst)
  const totalDue = formatCurrency(slip.total)

  function fit(value: string, length: number) {
    return value.slice(0, length).padEnd(length, ' ')
  }

  function right(value: string, length: number) {
    return value.slice(0, length).padStart(length, ' ')
  }

  function itemLine(name: string, qty: number, amount: number) {
    const item = fit(name, 17)
    const quantity = right(`x${qty}`, 4)
    const price = right(formatCurrency(amount), 11)
    return `${item}${quantity}${price}`
  }

  return [
    centerText('BILAL BROAST', width),
    centerText('Health & Taste', width),
    '-'.repeat(width),
    `Order #: ${slip.orderId}`.slice(0, width).padEnd(width, ' '),
    `Date: ${slip.date} ${slip.time}`.slice(0, width).padEnd(width, ' '),
    `Cashier: ${slip.cashier}`.slice(0, width).padEnd(width, ' '),
    `Server: ${slip.server}`.slice(0, width).padEnd(width, ' '),
    `Type: ${slip.orderType}`.slice(0, width).padEnd(width, ' '),
    '-'.repeat(width),
    `${fit('ITEM', 17)}${right('QTY', 4)}${right('PRICE', 11)}`,
    ...slip.items.map((item) => itemLine(item.name, item.qty, item.amount)),
    '-'.repeat(width),
    `Subtotal:${right(subtotal, 23)}`.slice(0, width),
    `GST 13%:${right(gst, 24)}`.slice(0, width),
    `TOTAL:${right(totalDue, 26)}`.slice(0, width),
    '-'.repeat(width),
    `Payment: ${slip.orderType === 'Delivery' ? 'COD' : 'Cash'}`
      .slice(0, width)
      .padEnd(width, ' '),
    '',
    centerText('Thank You!', width),
    centerText('Visit Again!', width),
    '',
    '',
    '',
  ]
}

function buildEscPosReceipt(slip: ReceiptSlip) {
  const lines = buildEscPosLines(slip)
  const text = lines.join('\n')
  const encoder = new TextEncoder()
  const bytes = encoder.encode(`${text}\n\n\n`)
  return bytes
}

function buildReceiptHtml(slip: ReceiptSlip, payment: string) {
  const rows = slip.items
    .map(
      (item) => `
        <tr>
          <td class="item-name">${item.name}</td>
          <td class="qty">x${item.qty}</td>
          <td class="amount">${formatCurrency(item.amount)}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Bilal Broast Receipt</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 58mm;
            background: #fff;
            font-family: Arial, sans-serif;
            color: #111;
          }

          body {
            display: block;
          }

          .receipt {
            width: 50mm;
            max-width: 50mm;
            margin: 0 auto;
            padding: 5px 2px 10px 3px;
            background: #fff;
            overflow: hidden;
            letter-spacing: 0;
            word-break: normal;
            overflow-wrap: normal;
          }

          .brand-logo {
            display: block;
            width: 46mm;
            max-width: 100%;
            max-height: 30mm;
            height: auto;
            object-fit: contain;
            margin: 0 auto 2mm;
          }

          .line {
            border-top: 1px solid #111;
            margin: 6px 0;
            width: 100%;
          }

          .meta {
            width: 100%;
            padding: 0;
            margin-left: 2px;
            margin: 0;
            font-size: 9px;
            font-weight: 700;
            line-height: 1.55;
            text-align: left;
          }

          .meta p {
            margin: 0;
            padding: 0;
          }

          table {
            width: calc(100% - 2px);
            border-collapse: collapse;
            table-layout: fixed;
            margin: 4px 0 0 2px;
            padding: 0;
            font-size: 9px;
            font-weight: 700;
          }

          td {
            padding: 2px 0;
            vertical-align: top;
            color: #111;
          }

          .item-name {
            width: 53%;
            padding-right: 4px;
            text-align: left;
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          .qty {
            width: 17%;
            text-align: center;
            white-space: nowrap;
            padding: 0;
          }

          .amount {
            width: 30%;
            text-align: right;
            white-space: nowrap;
            padding: 0 24px 0 0; 
            transform: none;
          }

          .totals {
            width: 100%;
            margin: 6px 0 0 2px;
            padding: 0;
            font-size: 9px;
            font-weight: 700;
            line-height: 1.55;
          }

          .total-row {
            font-weight: 900;
            font-size: 11px;
          }

          .footer {
            width: 100%;
            margin: 10px 0 0 2px;
            padding: 0;
            text-align: center;
            font-size: 9px;
            font-weight: 700;
            line-height: 1.45;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <img class="brand-logo" src="${window.location.origin}/bilal-broast-logo.png" alt="Bilal Broast logo" />

          <div class="line"></div>

          <div class="meta">
            <p><strong>Invoice</strong></p>
            <p>Order #: ${slip.orderId}</p>
            <p>Date: ${slip.date} ${slip.time}</p>
            <p>Order Type: ${slip.orderType}</p>
            <p>Cashier: ${slip.cashier}</p>
            <p>Server: ${slip.server}</p>
          </div>

          <div class="line"></div>

          <table>
            <thead>
              <tr>
                <td class="item-name">
                  <strong>Item</strong>
                </td>
                <td class="qty">
                  <strong>Qty</strong>
                </td>
                <td class="amount">
                  <strong>Price</strong>
                </td>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="line"></div>

          <div class="totals">
            <div>Subtotal: ${formatCurrency(slip.subtotal)}</div>
            <div>GST: ${formatCurrency(slip.gst)}</div>
            <div class="total-row">Total Due: ${formatCurrency(slip.total)}</div>
          </div>

          <div class="line"></div>

          <div class="footer">
            <div>Payment: ${payment || 'Cash'}</div>
            <div style="margin-top:8px;">Thank You For Choosing Bilal Broast</div>
            <div style="margin-top:2px;">Visit Again!</div>
          </div>
        </div>
      </body>
    </html>
  `
}

async function printReceiptDocument(slip: ReceiptSlip, payment: string, targetWindow?: Window | null): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const printWindow = targetWindow === undefined
    ? window.open('', '_blank', 'width=420,height=900')
    : targetWindow
  if (!printWindow) return false

  printWindow.document.open()
  printWindow.document.write(buildReceiptHtml(slip, payment))
  printWindow.document.close()

  const logo = printWindow.document.querySelector<HTMLImageElement>('.brand-logo')
  const logoReady = logo
    ? Promise.race([
        logo.decode().catch(() => undefined),
        new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
      ])
    : Promise.resolve()

  try {
    await logoReady
    printWindow.focus()
    printWindow.print()
    setTimeout(() => printWindow.close(), 800)
    return true
  } catch (error) {
    console.error('Receipt print could not be started.', error)
    return false
  }
}

async function printReceiptSilently(slip: ReceiptSlip) {
  if (typeof window === 'undefined') return false

  const printerApi = (navigator as Navigator & { usb?: any }).usb
  if (!printerApi || !window.isSecureContext) {
    return false
  }

  try {
    const devices = await printerApi.getDevices?.()
    if (!devices || devices.length === 0) {
      return false
    }

    const device = devices[0]
    if (!device) return false

    await device.open()
    if (device.configuration === null) {
      await device.selectConfiguration(1)
    }

    const interfaces = device.configuration?.interfaces ?? []
    const targetInterface = interfaces.find((entry: any) =>
      entry.alternate?.endpoints?.some((endpoint: any) => endpoint.direction === 'out'),
    )

    if (!targetInterface) {
      await device.close()
      return false
    }

    const outputEndpoint = targetInterface.alternate.endpoints.find((endpoint: any) => endpoint.direction === 'out')
    if (!outputEndpoint) {
      await device.close()
      return false
    }

    await device.claimInterface(targetInterface.interfaceNumber)
    const payload = buildEscPosReceipt(slip)
    await device.transferOut(outputEndpoint.endpointNumber, payload)
    await device.releaseInterface(targetInterface.interfaceNumber)
    await device.close()
    return true
  } catch (error) {
    console.info('No USB thermal printer available; falling back to the system print dialog.', error)
    return false
  }
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeNav, setActiveNav] = useState('Home')
  const [products, setProducts] = useState<Product[]>(baseProducts)
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [search, setSearch] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payment, setPayment] = useState('Cash')
  const [orderType, setOrderType] = useState('Takeaway')
  const [completed, setCompleted] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('Newest')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [receiptSlips, setReceiptSlips] = useState<ReceiptSlip[]>([])
  const [categoryPrintQueue, setCategoryPrintQueue] = useState<ReceiptSlip[]>([])
  const [categoryPrintModalOpen, setCategoryPrintModalOpen] = useState(false)
  const [printingCategory, setPrintingCategory] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [adding, setAdding] = useState(false)

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loginId.trim().toLowerCase() !== loginCredentials.id || loginPassword !== loginCredentials.password) {
      setLoginError('ID or password is incorrect.')
      return
    }
    setLoginError('')
    setIsAuthenticated(true)
  }

  useEffect(() => {
    let isActive = true

    fetch(productApiUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to fetch products')
        const payload = await response.json()
        const remoteProducts = Array.isArray(payload?.data?.products)
          ? payload.data.products.map(normalizeBackendProduct)
          : []

        if (!isActive) return

        if (remoteProducts.length > 0) {
          setProducts(remoteProducts)
          setCart((current) => current.map((cartItem) => {
            const matchedProduct = remoteProducts.find((product: Product) => product.name === cartItem.name)
            return matchedProduct ? { ...cartItem, ...matchedProduct, qty: cartItem.qty } : cartItem
          }))
        } else {
          setProducts([])
          setProductError('The backend menu returned no products. Check that products are available in the live catalog.')
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setProducts([])
          setProductError(error instanceof Error ? error.message : 'Unable to load the live menu.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingProducts(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const displayCategories = useMemo(() => {
    const categories = ['All Items', ...new Set(products.map((product) => product.category))]
    return categories.filter(Boolean)
  }, [products])

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim()
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All Items' || product.category === activeCategory
      const matchesSearch = !keyword || product.name.toLowerCase().includes(keyword)
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  function buildReceiptSlips() {
    const now = new Date()
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    return [{
      orderId: `#BN-${String(now.getTime()).slice(-5)}`,
      category: 'All Items',
      orderType,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      cashier: 'Sarah',
      server: 'Bilal',
      items: cart.map((item) => ({ name: item.name, qty: item.qty, amount: item.price * item.qty })),
      subtotal,
      gst: 0,
      total: subtotal,
    }]
  }

  async function handleOrderDone() {
    if (isSubmittingOrder) return
    if (completed) {
      if (categoryPrintQueue.length > 0) setCategoryPrintModalOpen(true)
      return
    }
    if (cart.length === 0) return

    const missingProduct = cart.find((item) => !item.slug && !item.id)
    if (missingProduct) {
      setOrderError(`${missingProduct.name} is missing its backend product ID. Reload the live menu before submitting.`)
      return
    }

    setOrderError('')
    setIsSubmittingOrder(true)
    const printWindow = window.open('', '_blank', 'width=420,height=900')
    if (printWindow) {
      printWindow.document.write('<!doctype html><title>Saving order</title><body style="font:16px Arial,sans-serif;padding:24px">Saving order...</body>')
      printWindow.document.close()
    }

    try {
      const response = await fetch(localOrdersApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.slug || item.id, quantity: item.qty })),
          paymentMethod: payment === 'Cash' ? 'cash' : 'online',
        }),
      })
      const payload = await response.json()
      const order: LocalOrder | undefined = payload?.data?.order ?? payload?.data
      if (!response.ok || payload?.success === false || !order) {
        throw new Error(payload?.message || 'The backend did not confirm this order.')
      }

      const baseReceipt = buildReceiptSlips()[0]
      const createdAt = order.createdAt ? new Date(order.createdAt) : new Date()
      baseReceipt.orderId = order.orderNumber || order._id || baseReceipt.orderId
      baseReceipt.date = createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      baseReceipt.time = createdAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
      const categoryByProduct = new Map<string, string>()
      for (const cartItem of cart) {
        if (cartItem.id) categoryByProduct.set(cartItem.id, cartItem.category || 'General')
        if (cartItem.slug) categoryByProduct.set(cartItem.slug, cartItem.category || 'General')
      }

      const categoryGroups = new Map<string, ReceiptSlip['items']>()
      for (const item of order.items || []) {
        const productId = typeof item.product === 'string' ? item.product : item.product?._id
        const category = categoryByProduct.get(productId || '')
          || cart.find((cartItem) => cartItem.name === item.nameSnapshot)?.category
          || 'General'
        const categoryItems = categoryGroups.get(category) || []
        categoryItems.push({
          name: item.nameSnapshot || 'Item',
          qty: Number(item.quantity || 0),
          amount: Number(item.lineTotal ?? Number(item.priceSnapshot || 0) * Number(item.quantity || 0)),
        })
        categoryGroups.set(category, categoryItems)
      }

      const nextReceipts = Array.from(categoryGroups, ([category, items]) => {
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
        return { ...baseReceipt, category, items, subtotal, gst: 0, total: subtotal }
      })
      setReceiptSlips(nextReceipts)
      setCompleted(true)

      if (nextReceipts.length > 1) {
        printWindow?.close()
        setCategoryPrintQueue(nextReceipts)
        setCategoryPrintModalOpen(true)
      } else {
        const printSuccessful = await printReceiptDocument(nextReceipts[0] || baseReceipt, payment, printWindow)
        if (!printSuccessful) {
          printWindow?.close()
          setOrderError('Order saved, but the print window was blocked. Allow pop-ups for this POS, then use Print Slip.')
        }
      }
    } catch (error) {
      printWindow?.close()
      setOrderError(error instanceof Error ? error.message : 'Unable to save the order. Please try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  async function printQueuedCategory(slip: ReceiptSlip) {
    if (printingCategory) return
    setPrintingCategory(slip.category)
    const started = await printReceiptDocument(slip, payment)
    setPrintingCategory('')
    if (!started) {
      setOrderError(`Could not start printing ${slip.category}. Allow pop-ups, then try again.`)
      return
    }
    setCategoryPrintQueue((current) => current.filter((entry) => entry.category !== slip.category))
    if (categoryPrintQueue.length === 1) setCategoryPrintModalOpen(false)
  }

  function addToCart(product: Product) {
    setCompleted(false)
    setOrderError('')
    setCart((current) => {
      const found = current.find((item) => (product.id && item.id === product.id) || (product.slug && item.slug === product.slug) || item.name === product.name)
      if (!found) return [...current, { ...product, qty: 1 }]
      return current.map((item) =>
        (product.id && item.id === product.id) || (product.slug && item.slug === product.slug) || item.name === product.name
          ? { ...item, qty: item.qty + 1 }
          : item,
      )
    })
  }

  function updateQuantity(name: string, amount: number) {
    setCart((current) =>
      current
        .map((item) => (item.name === name ? { ...item, qty: item.qty + amount } : item))
        .filter((item) => item.qty > 0),
    )
  }

  function openNewProduct() {
    setEditing(null)
    setAdding(true)
  }

  function openEditProduct(product: Product) {
    setAdding(false)
    setEditing(product)
  }

  function closeEditor() {
    setAdding(false)
    setEditing(null)
  }

  function saveProduct(product: Product) {
    const normalized = {
      ...product,
      name: product.name.trim() || 'Untitled Product',
      category: product.category.trim() || 'General',
      description: product.description?.trim() || 'Freshly prepared item.',
      image: product.image.trim() || imageUrl,
    }

    if (adding) {
      setProducts((current) => [normalized, ...current])
    } else if (editing) {
      setProducts((current) =>
        current.map((item) => (item.name === editing.name ? normalized : item)),
      )
    }

    closeEditor()
  }

  const pageTitle = activeNav === 'Home' ? 'Cashier' : activeNav

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7f2] p-4 text-slate-900">
        <form onSubmit={handleLogin} className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-7 shadow-lg">
          <div className="mb-7 text-center">
            <p className="text-sm font-black italic text-[#279b2e]">BILAL</p>
            <h1 className="mt-1 text-2xl font-black">Broast POS</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>
          </div>
          <label className="mb-4 block text-sm font-semibold text-slate-700">
            ID / Email
            <input autoComplete="username" autoFocus required type="email" value={loginId} onChange={(event) => setLoginId(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#279b2e]" />
          </label>
          <label className="mb-5 block text-sm font-semibold text-slate-700">
            Password
            <input autoComplete="current-password" required type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#279b2e]" />
          </label>
          {loginError && <p className="mb-4 text-sm font-medium text-red-700" role="alert">{loginError}</p>}
          <button className="h-11 w-full rounded-md bg-[#279b2e] font-semibold text-white transition hover:bg-[#238a2f]" type="submit">Login</button>
        </form>
      </main>
    )
  }

  return (
    <main className="dashboard-shell min-h-screen overflow-x-hidden bg-[#f5f7f2] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[228px] flex-col bg-[#0b0d10] text-white lg:flex">
        <div className="flex h-[128px] items-center justify-center border-b border-white/5">
          <div className="text-center leading-none">
            <div className="text-[18px] font-black italic text-[#39b34a]">Bilal</div>
            <div className="text-[31px] font-black">Burger</div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#39b34a]">RESTAURANT</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-8">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`flex items-center gap-4 rounded-xl px-4 py-4 text-left text-[16px] font-semibold transition ${
                activeNav === label ? 'bg-[#279b2e] text-white shadow-lg shadow-emerald-500/20' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <Icon className="size-7" />
              {label}
            </button>
          ))}
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="mx-4 mb-11 flex items-center gap-4 rounded-xl bg-[#e1191e] px-4 py-4 text-left font-semibold text-white">
          <LogOut className="size-7" />
          Logout
        </button>
      </aside>

      <div className="lg:pl-[228px]">
        <header className="flex min-h-[104px] items-center gap-3 bg-[#0b0d10] px-5 py-4 text-white md:px-10">
          <div className="min-w-[140px]">
            <p className="text-white/80">Welcome Back,</p>
            <h1 className="text-[22px] font-bold">{pageTitle}</h1>
          </div>

          <div className="relative hidden max-w-[450px] flex-1 md:block">
            <input
              aria-label="Search menu item"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu item..."
              className="h-[59px] w-full rounded-xl bg-white px-5 pr-14 text-[18px] text-slate-900 outline-none ring-0"
            />
            <Search className="absolute right-5 top-4 size-7 text-slate-800" />
          </div>

          <div className="ml-auto flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 md:gap-5 md:px-5">
            <div className="hidden sm:block">
              <p className="text-sm text-white/65">Terminal</p>
              <p className="font-semibold">T2</p>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-white/65">User</p>
              <p className="font-semibold">Bilal Ahmad</p>
            </div>
            <button aria-label="Notifications" className="grid place-items-center rounded-xl bg-[#1f8f29] p-3 transition hover:bg-[#2cac35]">
              <Bell className="size-7" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-5 xl:p-6">
          {activeNav === 'Orders' ? (
            <OrdersSection date={orderDate} setDate={setOrderDate} sortMode={sortMode} setSortMode={setSortMode} calendarOpen={calendarOpen} setCalendarOpen={setCalendarOpen} />
          ) : (
            <HomeView
              categories={displayCategories}
              filteredProducts={filteredProducts}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              addToCart={addToCart}
              cart={cart}
              updateQuantity={updateQuantity}
              total={total}
              payment={payment}
              setPayment={setPayment}
              orderType={orderType}
              setOrderType={setOrderType}
              completed={completed}
              isSubmittingOrder={isSubmittingOrder}
              orderError={orderError}
              onOrderDone={handleOrderDone}
              isLoading={isLoadingProducts}
              productError={productError}
              receiptSlips={receiptSlips}
            />
          )}
        </div>
      </div>

      {categoryPrintModalOpen && categoryPrintQueue.length > 0 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="presentation">
          <section
            aria-labelledby="category-print-title"
            aria-modal="true"
            className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl md:p-6"
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900" id="category-print-title">Print category slips</h2>
                <p className="mt-1 text-sm text-slate-600">Order {categoryPrintQueue[0].orderId} Â· {categoryPrintQueue.length} categories remaining</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm font-semibold text-emerald-800">Saved</span>
                <button
                  aria-label="Close category print modal"
                  className="grid size-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setCategoryPrintModalOpen(false)}
                  title="Close"
                  type="button"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {categoryPrintQueue.map((slip) => (
                <div key={slip.category} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900">{slip.category}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {slip.items.reduce((sum, item) => sum + item.qty, 0)} items Â· Rs. {slip.total.toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#279b2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#238a2f] disabled:cursor-wait disabled:opacity-60"
                    disabled={Boolean(printingCategory)}
                    onClick={() => void printQueuedCategory(slip)}
                    type="button"
                  >
                    <Printer className="size-4" />
                    {printingCategory === slip.category ? 'Printing...' : 'Print'}
                  </button>
                </div>
              ))}
            </div>

            {orderError && <p className="mt-4 text-sm font-medium text-red-700" role="alert">{orderError}</p>}
          </section>
        </div>
      )}
    </main>
  )
}

function HomeView({
  categories,
  filteredProducts,
  activeCategory,
  setActiveCategory,
  addToCart,
  cart,
  updateQuantity,
  total,
  payment,
  setPayment,
  orderType,
  setOrderType,
  completed,
  isSubmittingOrder,
  orderError,
  onOrderDone,
  isLoading,
  productError,
  receiptSlips,
}: {
  categories: string[]
  filteredProducts: Product[]
  activeCategory: string
  setActiveCategory: (value: string) => void
  addToCart: (product: Product) => void
  cart: CartItem[]
  updateQuantity: (name: string, amount: number) => void
  total: number
  payment: string
  setPayment: (value: string) => void
  orderType: string
  setOrderType: (value: string) => void
  completed: boolean
  isSubmittingOrder: boolean
  orderError: string
  onOrderDone: () => void
  isLoading: boolean
  productError: string
  receiptSlips: ReceiptSlip[]
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeCategory === category ? 'bg-[#279b2e] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}

          <button className="ml-auto flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 transition hover:bg-slate-100">
            <Filter className="size-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm font-medium text-slate-500">Loading menu from live backend...</div>
        ) : productError ? (
          <div role="alert" className="py-10 text-center text-sm font-medium text-red-700">{productError}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-10 text-center text-sm font-medium text-slate-500">No products found for this filter.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <button
                key={product.name}
                onClick={() => addToCart(product)}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#39a43e] hover:shadow-md"
              >
                <img src={product.image} alt={product.name} className="h-[120px] w-full object-cover" />
                <div className="space-y-2 p-3">
                  <div
                    className="min-h-[42px] text-[14px] font-semibold leading-5 text-slate-800"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.name}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{product.category}</span>
                    <span className="text-base font-bold text-[#2c7d34]">Rs. {product.price.toLocaleString()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-4">
        <OrderPanel
          cart={cart}
          updateQuantity={updateQuantity}
          total={total}
          payment={payment}
          setPayment={setPayment}
          orderType={orderType}
          setOrderType={setOrderType}
          completed={completed}
          isSubmittingOrder={isSubmittingOrder}
          orderError={orderError}
          onOrderDone={onOrderDone}
        />
        {receiptSlips.length > 0 && <ReceiptPreview slips={receiptSlips} payment={payment} />}
      </div>
    </div>
  )
}

function OrderPanel({
  cart,
  updateQuantity,
  total,
  payment,
  setPayment,
  orderType,
  setOrderType,
  completed,
  isSubmittingOrder,
  orderError,
  onOrderDone,
}: {
  cart: CartItem[]
  updateQuantity: (name: string, amount: number) => void
  total: number
  payment: string
  setPayment: (value: string) => void
  orderType: string
  setOrderType: (value: string) => void
  completed: boolean
  isSubmittingOrder: boolean
  orderError: string
  onOrderDone: () => void
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold">Order Panel</h2>
        <span className="rounded-lg bg-[#e6f5e6] px-3 py-2 text-sm font-semibold text-[#26772d]">
          Walk-in
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_58px_60px_70px_18px] border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Item</span>
        <span>Price</span>
        <span>Qty</span>
        <span>Total</span>
        <span />
      </div>

      <div className="mt-2 space-y-3">
        {cart.map((item) => (
          <div
            key={item.name}
            className="grid grid-cols-[minmax(0,1fr)_58px_60px_70px_18px] items-center gap-1 py-3 text-sm text-slate-700"
          >
            <span className="pr-1 font-medium leading-5" style={{ overflowWrap: 'anywhere' }}>
              {item.name}
            </span>
            <span>Rs. {item.price}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuantity(item.name, 1)}
                className="grid size-6 place-items-center rounded bg-[#279b2e] text-white"
              >
                <Plus className="size-3" />
              </button>
              <span className="min-w-[18px] text-center">{item.qty}</span>
              <button
                onClick={() => updateQuantity(item.name, -1)}
                className="grid size-6 place-items-center rounded bg-[#d91e29] text-white"
              >
                <Minus className="size-3" />
              </button>
            </div>
            <span>Rs. {item.price * item.qty}</span>
            <button onClick={() => updateQuantity(item.name, -item.qty)}>
              <X className="size-5 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Order Type</p>
          <div className="grid grid-cols-3 gap-2">
            {['Takeaway', 'Dine In', 'Delivery'].map((option) => (
              <button
                key={option}
                onClick={() => setOrderType(option)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                  orderType === option ? 'border-[#279b2e] bg-[#edf9ee] text-[#24742b]' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 text-sm text-slate-600">
          <span>Subtotal</span>
          <strong className="text-slate-900">Rs. {total.toLocaleString()}</strong>
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600">
          <span>Discount</span>
          <span>Rs. 0</span>
        </div>
        <div className="flex items-center justify-between py-3 text-xl font-bold text-slate-900">
          <span>Total</span>
          <span className="text-[#298132]">Rs. {total.toLocaleString()}</span>
        </div>

        <button
          onClick={onOrderDone}
          disabled={cart.length === 0 || isSubmittingOrder}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#279b2e] py-4 text-lg font-semibold text-white transition hover:bg-[#238a2f] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Check className="size-6" />
          {isSubmittingOrder ? 'Saving Order...' : completed ? 'Order Saved' : 'Order Done'}
        </button>
        {orderError && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{orderError}</p>}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {paymentOptions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setPayment(label)}
            className={`flex flex-col items-center gap-2 rounded-xl border py-3 text-sm font-semibold transition ${
              payment === label ? 'border-[#279b2e] bg-[#f0faef] text-[#24742b]' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <Icon className="size-7" />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}

function ReceiptPreview({ slips, payment }: { slips: ReceiptSlip[]; payment: string }) {
  return (
    <section className="receipt-preview-shell rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:shadow-none">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-slate-800">Slip Preview</h3>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && slips.length > 0) {
              printReceiptDocument(slips[0], payment)
            }
          }}
          className="rounded-xl bg-[#0b0d10] px-3 py-2 text-sm font-semibold text-white"
        >
          Print Slip
        </button>
      </div>

      <div className="space-y-4 print:space-y-2">
        {slips.map((slip, index) => (
          <div
            key={`${slip.orderId}-${slip.category}-${index}`}
            className="receipt-slip mx-auto w-[50mm] max-w-full bg-white px-0 py-4 text-[#111] shadow-md print:shadow-none"
          >
            <img
              src="/bilal-broast-logo.png"
              alt="Bilal Broast logo"
              className="mx-auto mb-3 block w-[46mm] max-w-full max-h-[30mm] object-contain"
            />

            <div className="mb-3 h-px bg-black" />

            <div className="space-y-1 text-center text-sm font-semibold">
              <div className="text-lg font-black">Invoice</div>
              <div>Order #: {slip.orderId}</div>
              <div>Date: {slip.date} {slip.time}</div>
              <div>Order Type: {slip.orderType}</div>
              <div>Cashier: {slip.cashier}</div>
              <div>Server: {slip.server}</div>
            </div>

            <div className="mt-3 h-px bg-black" />

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_25px_60px] items-start text-[11px] font-black uppercase tracking-wide">
              <span className="text-left">Item</span>
              <span className="text-center">Qty</span>
              <span className="pr-1 text-right">Price</span>
            </div>

            {slip.items.map((item: any) => (
              <div
                key={`${slip.orderId}-${item.name}`}
                className="mt-2 grid grid-cols-[minmax(0,1fr)_25px_60px] items-start text-[12px]"
              >
                <span className="min-w-0 pr-1 font-medium break-words">{item.name}</span>
                <span className="text-center whitespace-nowrap">x{item.qty}</span>
                <span className="pr-1 text-right whitespace-nowrap">{item.amount.toLocaleString()}.00</span>
              </div>
            ))}

            <div className="mt-3 h-px bg-black" />
            <div className="mt-2 space-y-1 text-sm font-semibold">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{slip.subtotal.toLocaleString()}.00</span></div>
              <div className="flex items-center justify-between"><span>GST</span><span>{slip.gst.toFixed(2)}</span></div>
            </div>
            <div className="mt-3 h-px bg-black" />
            <div className="mt-2 flex items-center justify-between text-base font-black">
              <span>Total Due:</span>
              <span>{slip.total.toFixed(2)}</span>
            </div>
            <div className="mt-4 text-center text-[11px] font-bold uppercase tracking-[0.18em]">
              Payment Mode: {payment || 'Cash'}
            </div>
            <div className="mt-4 text-center text-sm font-semibold leading-snug">
              <div>Thank You For Choosing Bilal Broast</div>
              <div className="mt-1">Visit Again!</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function OrdersSection({
  date,
  setDate,
  sortMode,
  setSortMode,
  calendarOpen,
  setCalendarOpen,
}: {
  date: string
  setDate: (value: string) => void
  sortMode: SortMode
  setSortMode: (value: SortMode) => void
  calendarOpen: boolean
  setCalendarOpen: (value: boolean) => void
}) {
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (date) {
      params.set('dateFrom', date)
      params.set('dateTo', date)
    }
    const query = params.toString()

    setIsLoading(true)
    setLoadError('')

    fetch(`${localOrdersApiUrl}${query ? `?${query}` : ''}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || 'Unable to load local orders.')
        }
        setOrders(Array.isArray(payload?.data) ? payload.data : [])
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setLoadError(error instanceof Error ? error.message : 'Unable to load local orders.')
        setOrders([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [date])

  const sortedOrders = [...orders].sort((first, second) => {
    const firstDate = new Date(first.createdAt || 0).getTime()
    const secondDate = new Date(second.createdAt || 0).getTime()
    if (sortMode === 'Oldest') return firstDate - secondDate
    if (sortMode === 'Highest Amount') return Number(second.grandTotal || 0) - Number(first.grandTotal || 0)
    return secondDate - firstDate
  })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Local Orders</h2>
          <p className="text-sm text-slate-500">Saved orders and billing records</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <CalendarDays className="size-5 text-[#279b2e]" />
              <span className="hidden sm:inline">{date ? 'Date Filter' : 'Sort & Filter'}</span>
              <ChevronDown className="size-4" />
            </button>

            {calendarOpen && (
              <div className="absolute right-0 z-20 mt-2 w-[240px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <div className="mb-3 text-sm font-semibold text-slate-700">Order filters</div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <CalendarDays className="size-4 text-[#279b2e]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value)
                      setCalendarOpen(false)
                    }}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>

                <div className="mt-4 space-y-2">
                  {(['Newest', 'Oldest', 'Highest Amount'] as SortMode[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortMode(option)
                        setCalendarOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
                        sortMode === option ? 'bg-[#edf9ee] text-[#217b2d]' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                      {sortMode === option && <Check className="size-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500">
              <th className="px-4 py-4 font-semibold">Order ID</th>
              <th className="px-4 py-4 font-semibold">Customer</th>
              <th className="px-4 py-4 font-semibold">Items</th>
              <th className="px-4 py-4 font-semibold">Date</th>
              <th className="px-4 py-4 font-semibold">Amount</th>
              <th className="px-4 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order, index) => {
              const createdAt = order.createdAt ? new Date(order.createdAt) : null
              return (
              <tr key={order._id || order.orderNumber || index} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-5 font-bold text-slate-800">{order.orderNumber || order._id || 'Local order'}</td>
                <td className="px-4 py-5 text-slate-700">Walk-in Customer</td>
                <td className="px-4 py-5 text-slate-700">{(order.items || []).map((item) => `${item.nameSnapshot || 'Item'} x${item.quantity || 0}`).join(', ')}</td>
                <td className="px-4 py-5 text-slate-700">{createdAt ? createdAt.toLocaleString() : 'â€”'}</td>
                <td className="px-4 py-5 font-bold text-slate-800">Rs. {Number(order.grandTotal || 0).toLocaleString()}</td>
                <td className="px-4 py-5">
                  <span
                    className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"
                  >
                    {order.orderStatus || 'delivered'}
                  </span>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>

        {isLoading && <div className="py-12 text-center text-slate-500">Loading local orders...</div>}
        {!isLoading && loadError && (
          <div role="alert" className="py-12 text-center text-red-700">{loadError}</div>
        )}
        {!isLoading && !loadError && !sortedOrders.length && (
          <div className="py-12 text-center text-slate-500">No local orders found for this date.</div>
        )}
      </div>
    </section>
  )
}

function ProductManager({
  products,
  editing,
  adding,
  onEdit,
  onAdd,
  onCancel,
  onSave,
}: {
  products: Product[]
  editing: Product | null
  adding: boolean
  onEdit: (product: Product) => void
  onAdd: () => void
  onCancel: () => void
  onSave: (product: Product) => void
}) {
  const [draft, setDraft] = useState<Product | null>(editing)

  const openEditor = (product: Product) => {
    setDraft(product)
    onEdit(product)
  }

  const save = () => {
    if (!draft) return
    onSave(draft)
  }

  const currentMode = adding ? 'Add New Product' : editing ? 'Edit Product' : 'Product Setup'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-sm text-slate-500">Add, edit, and manage the full menu catalog</p>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-[#279b2e] px-4 py-3 font-semibold text-white transition hover:bg-[#238a2f]"
        >
          <Plus className="size-5" />
          Add Product
        </button>
      </div>

      {(editing || adding) && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{currentMode}</h3>
            <button onClick={onCancel} className="rounded-full bg-white p-2 text-slate-700 shadow-sm">
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="font-semibold text-slate-700">
              Name
              <input
                value={draft?.name ?? ''}
                onChange={(event) => setDraft((current) => ({ ...(current ?? baseProducts[0]), name: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal text-slate-800 outline-none focus:border-[#279b2e]"
              />
            </label>

            <label className="font-semibold text-slate-700">
              Price
              <input
                type="number"
                value={draft?.price ?? 0}
                onChange={(event) => setDraft((current) => ({ ...(current ?? baseProducts[0]), price: Number(event.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal text-slate-800 outline-none focus:border-[#279b2e]"
              />
            </label>

            <label className="font-semibold text-slate-700">
              Category
              <input
                value={draft?.category ?? ''}
                onChange={(event) => setDraft((current) => ({ ...(current ?? baseProducts[0]), category: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal text-slate-800 outline-none focus:border-[#279b2e]"
              />
            </label>

            <label className="font-semibold text-slate-700">
              Image URL
              <input
                value={draft?.image ?? ''}
                onChange={(event) => setDraft((current) => ({ ...(current ?? baseProducts[0]), image: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal text-slate-800 outline-none focus:border-[#279b2e]"
              />
            </label>

            <label className="font-semibold text-slate-700 md:col-span-2">
              Description
              <textarea
                value={draft?.description ?? ''}
                onChange={(event) => setDraft((current) => ({ ...(current ?? baseProducts[0]), description: event.target.value }))}
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal text-slate-800 outline-none focus:border-[#279b2e]"
              />
            </label>
          </div>

          <button
            onClick={save}
            className="mt-5 flex items-center gap-2 rounded-xl bg-[#279b2e] px-5 py-3 font-semibold text-white transition hover:bg-[#238a2f]"
          >
            <Check className="size-5" />
            Save Product
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={`${product.name}-${product.category}`} className="flex gap-3 rounded-2xl border border-slate-200 p-3 shadow-sm">
            <img src={product.image} alt={product.name} className="size-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div
                className="text-base font-bold text-slate-800"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.name}
              </div>
              <p className="mt-1 text-sm text-slate-500">{product.category} Â· Rs. {product.price}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500" style={{ overflowWrap: 'anywhere' }}>
                {product.description}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => openEditor(product)}
                  className="flex items-center gap-1 rounded-lg bg-[#edf9ee] px-2.5 py-2 text-sm font-bold text-[#2a7b2d]"
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-bold text-slate-600">
                  <Trash2 className="size-4" />
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

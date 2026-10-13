'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Clock3, Printer, Search, X } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { formatPrice, type Order } from '@/lib/data'
import { api } from '@/lib/api/client'
import { getSocket } from '@/lib/api/socket'
import { useEffect } from 'react'

type LiveStatus = 'In progress' | 'Done'
type ReceiptOrder = Order & { subtotal: number; deliveryFee: number; paymentMethod: string }

const getLiveStatus = (status: string): LiveStatus => ['delivered', 'cancelled', 'Delivered', 'Cancelled'].includes(status) ? 'Done' : 'In progress'

function mapOrder(raw: any): ReceiptOrder {
  return { id: raw._id || raw.id || raw.orderNumber, customerName: raw.customerSnapshot?.name || raw.customer?.name || raw.customerName || 'Customer', phone: raw.customerSnapshot?.phone || raw.customer?.phone || raw.phone || '', address: raw.deliveryAddress?.address || raw.address || 'Pickup order', deliveryInstructions: raw.deliveryAddress?.notes || raw.deliveryInstructions || '', total: Number(raw.grandTotal ?? raw.total ?? 0), subtotal: Number(raw.subtotal ?? raw.grandTotal ?? raw.total ?? 0), deliveryFee: Number(raw.deliveryFee ?? 0), paymentMethod: raw.paymentMethod || 'cod', status: raw.orderStatus || raw.status || 'pending', createdAt: raw.createdAt ? new Date(raw.createdAt).toLocaleString() : '', items: (raw.items || []).map((item: any) => ({ id: item.product?._id || item.product || item.id || item.name, name: item.name || item.product?.name || item.nameSnapshot || 'Item', price: Number(item.price ?? item.priceSnapshot ?? 0), quantity: Number(item.quantity || 1) })) }
}

export default function LiveOrdersPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'All' | LiveStatus>('All')
  const [orders, setOrders] = useState<ReceiptOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [printed, setPrinted] = useState<string | null>(null)
  const [printing, setPrinting] = useState<string | null>(null)
  const printingRef = useRef(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [socketState, setSocketState] = useState('connecting')
  const [toast, setToast] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<ReceiptOrder | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => { try { const result = await api.get<any>('/admin/orders?page=1&limit=100&sort=newest'); const list = Array.isArray(result) ? result : result?.orders || result?.items || []; const mapped = list.map(mapOrder); if (active) setOrders(mapped); const orderId = new URLSearchParams(window.location.search).get('order'); if (active && orderId) { let selected = mapped.find((order: ReceiptOrder) => order.id === orderId); if (!selected) { const detail = await api.get<any>(`/admin/orders/${encodeURIComponent(orderId)}`); selected = mapOrder(detail?.order || detail) } if (active && selected) { setSelectedOrder(selected); window.history.replaceState(window.history.state, '', window.location.pathname) } } } catch (error) { console.error('[v0] Failed to load live orders', error) } finally { if (active) setLoading(false) } }
    load()
    const socket = getSocket()
    if (!socket) return () => { active = false }
    const onConnect = () => { setSocketState('live'); socket.emit('admin:join'); load() }
    const onDisconnect = () => setSocketState('offline')
    const upsert = (raw: any) => { const next = mapOrder(raw); setOrders((current) => { const index = current.findIndex((item) => item.id === next.id); if (index < 0) return [next, ...current]; const copy = [...current]; copy[index] = { ...copy[index], ...next }; return copy }) }
    const onCancel = (raw: any) => upsert({ ...raw, orderStatus: 'cancelled' })
    socket.on('connect', onConnect); socket.on('disconnect', onDisconnect); socket.on('connect_error', onDisconnect); socket.on('order:new', upsert); socket.on('order:status-updated', upsert); socket.on('order:payment-updated', upsert); socket.on('order:cancelled', onCancel)
    socket.connect()
    const refreshTimer = window.setInterval(load, 10000)
    return () => { active = false; window.clearInterval(refreshTimer); socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); socket.off('connect_error', onDisconnect); socket.off('order:new', upsert); socket.off('order:status-updated', upsert); socket.off('order:payment-updated', upsert); socket.off('order:cancelled', onCancel); socket.disconnect() }
  }, [])
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesQuery = `${order.id} ${order.customerName} ${order.phone} ${order.address}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (status === 'All' || getLiveStatus(order.status) === status)
  }), [orders, query, status])

  async function toggleStatus(id: string) {
    const order = orders.find((item) => item.id === id)
    if (!order) return
    const nextStatus = getLiveStatus(order.status) === 'Done' ? 'preparing' : 'delivered'
    setUpdating(id)
    try { const updated = await api.patch<any>(`/admin/orders/${id}/status`, { orderStatus: nextStatus }); setOrders((current) => current.map((item) => item.id === id ? mapOrder(updated?.order || updated) : item)); setSelectedOrder((current) => current?.id === id ? mapOrder(updated?.order || updated) : current) } catch (error) { console.error('[v0] Failed to update live order status', error) } finally { setUpdating(null) }
  }

  function printSlip(id: string) {
    const order = orders.find((item) => item.id === id)
    if (!order || printingRef.current) return
    const printWindow = window.open('', '', 'popup,width=420,height=720')
    if (!printWindow) {
      setToast('Receipt print window browser ne block kar di. Pop-ups allow karke dobara try karein.')
      window.setTimeout(() => setToast(''), 3500)
      return
    }
    printingRef.current = true
    setPrinting(id)
    setSelectedOrder(order)
    setPrinted(id)
    window.setTimeout(() => setPrinted(null), 1800)
    window.setTimeout(async () => {
      let cleanupTimer: number | undefined
      const finishPrint = () => {
        if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer)
        printingRef.current = false
        setPrinting(null)
        setPrinted(null)
        if (!printWindow.closed) printWindow.close()
      }
      const failPrint = (message: string, error?: unknown) => {
        if (error) console.error('Bilal Broast receipt could not be printed.', error)
        finishPrint()
        setToast(message)
        window.setTimeout(() => setToast(''), 3500)
      }
      try {
        if (printWindow.closed) {
          failPrint('Receipt print window band ho gayi. Dobara Print slip try karein.')
          return
        }
        const receipt = document.querySelector<HTMLElement>('#receipt-slip')
        if (!receipt) {
          failPrint('Receipt load nahi hui. Dobara Print slip try karein.')
          return
        }
        const printDocument = printWindow.document
        printDocument.open()
        printDocument.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bilal Broast Receipt</title></head><body></body></html>')
        printDocument.close()
        const printStyle = printDocument.createElement('style')
        printStyle.textContent = `
          @page { size: 58mm auto; margin: 0; }
          *, *::before, *::after { box-sizing: border-box; }
          html, body { width: 58mm; min-height: 0; margin: 0; padding: 0; background: #fff; }
          body { color: #000; font: 700 10px/1.4 Arial, sans-serif; }
          .receipt-slip { width: 58mm; max-width: 58mm; margin: 0; padding: 3mm; color: #000; background: #fff; box-shadow: none; }
          .receipt-brand { display: flex; align-items: center; justify-content: center; }
          .receipt-logo-img { display: block; width: 44mm; max-width: 100%; max-height: 26mm; height: auto; object-fit: contain; margin: 0 auto 2mm; }
          .receipt-rule { height: 1px; margin: 2.5mm 0; background: #000; }
          .receipt-address, .receipt-thanks { margin: 2mm 0; color: #000; text-align: center; font-size: 9px; line-height: 1.45; }
          .receipt-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 2mm; }
          .receipt-title-row>div>span { font-size: 9px; font-weight: 900; letter-spacing: .1em; }
          .receipt-title-row h2 { margin: 1mm 0 0; font-size: 14px; }
          .receipt-status { padding: 1mm 1.5mm; border: 1px solid #000; border-radius: 99px; color: #000; font-size: 8px; font-weight: 900; }
          .receipt-meta { display: grid; gap: 1.5mm; margin-top: 3mm; color: #000; font-size: 9px; }
          .receipt-meta span { display: grid; grid-template-columns: 16mm minmax(0, 1fr); gap: 1.5mm; line-height: 1.35; overflow-wrap: anywhere; }
          .receipt-meta b { font-size: 8px; font-weight: 900; text-transform: uppercase; }
          .receipt-items-head, .receipt-items>div { display: grid; grid-template-columns: minmax(0, 1fr) 8mm 18mm; gap: 1mm; align-items: start; }
          .receipt-items-head { color: #000; font-size: 8px; font-weight: 900; }
          .receipt-items-head span:nth-child(2), .receipt-items>div b { text-align: center; }
          .receipt-items-head span:last-child, .receipt-items>div strong { text-align: right; }
          .receipt-items { display: grid; gap: 1.5mm; margin-top: 2mm; color: #000; }
          .receipt-items>div { font-size: 9px; line-height: 1.35; overflow-wrap: anywhere; }
          .receipt-items>div b, .receipt-items>div strong { font-size: 9px; }
          .receipt-items>div strong { white-space: nowrap; }
          .receipt-totals { display: grid; gap: 1.5mm; color: #000; font-size: 9px; }
          .receipt-totals span, .receipt-totals>strong { display: flex; justify-content: space-between; gap: 2mm; }
          .receipt-totals>strong { padding-top: 2mm; border-top: 2px solid #000; font-size: 11px; text-transform: uppercase; }
          .receipt-totals>strong b { font-size: 13px; }
          .receipt-thanks { margin: 4mm 0 0; font-weight: 700; }
        `
        printDocument.head.append(printStyle)
        printDocument.body.append(receipt.cloneNode(true))
        const printLogo = printDocument.querySelector<HTMLImageElement>('.receipt-logo-img')
        if (!printLogo) {
          failPrint('Bilal Broast ka logo receipt me nahi mila.')
          return
        }
        try {
          await printLogo.decode()
        } catch (error) {
          failPrint('Bilal Broast ka logo load nahi hua. Dobara print try karein.', error)
          return
        }
        const printReceipt = printDocument.querySelector<HTMLElement>('.receipt-slip')
        if (!printReceipt) {
          failPrint('Receipt print layout load nahi hua. Dobara Print slip try karein.')
          return
        }
        const pageHeightMm = Math.ceil(printReceipt.getBoundingClientRect().height * 25.4 / 96) + 2
        const pageSize = printDocument.createElement('style')
        pageSize.textContent = `@page { size: 58mm ${pageHeightMm}mm; margin: 0; }`
        printDocument.head.append(pageSize)
        printWindow.addEventListener('afterprint', finishPrint, { once: true })
        printWindow.addEventListener('beforeunload', finishPrint, { once: true })
        cleanupTimer = window.setTimeout(finishPrint, 120000)
        printWindow.focus()
        printWindow.print()
      } catch (error) {
        failPrint('Receipt print nahi ho saki. Dobara Print slip try karein.', error)
      }
    }, 120)
  }

  return <DashboardShell title="Live orders" description="A clear view of every order moving through the restaurant.">
    <section className="live-orders-page">
      <div className="live-orders-toolbar">
        <label className="live-search"><Search size={16} /><span className="sr-only">Search live orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer or phone" /></label>
        <div className="live-status-tabs" role="tablist" aria-label="Order status filter">
          {(['All', 'In progress', 'Done'] as const).map((item) => <button key={item} className={status === item ? 'is-active' : ''} onClick={() => setStatus(item)} role="tab" aria-selected={status === item}>{item}<span>{item === 'All' ? orders.length : orders.filter((order) => getLiveStatus(order.status) === item).length}</span></button>)}
        </div>
      </div>
      <div className="live-orders-meta"><div><span className="live-dot" />Live order board <strong>{filteredOrders.length} orders</strong><small className="live-connection-state">{socketState === 'live' ? 'Live' : socketState === 'offline' ? 'REST fallback' : 'Connecting...'}</small></div><button className="live-refresh" onClick={() => setQuery('')}><Clock3 size={14} /> Latest first</button></div>
      <div className="live-orders-table-wrap">
        <table className="live-orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan={7} className="live-table-state">Loading live orders...</td></tr> : filteredOrders.map((order) => { const done = getLiveStatus(order.status) === 'Done'; return <tr className={!done ? 'is-in-progress' : ''} key={order.id}><td data-label="Order"><strong>{order.id}</strong><small>{order.createdAt}</small></td><td data-label="Customer"><strong>{order.customerName}</strong><small>{order.phone}</small></td><td data-label="Items"><strong>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</strong><small>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</small></td><td data-label="Delivery"><small>{order.address}</small></td><td data-label="Total"><strong>{formatPrice(order.total)}</strong></td><td data-label="Status"><button disabled={updating === order.id} aria-label={done ? `Order ${order.id} is done` : `Mark order ${order.id} as done`} title={done ? 'Order completed' : 'Click to mark as done'} className={`live-status ${done ? 'is-done' : 'is-in-progress'}`} onClick={() => toggleStatus(order.id)}>{done ? <Check size={13} /> : <Clock3 size={13} />}{updating === order.id ? 'Updating...' : done ? 'Done' : 'In progress'}{!done && <span className="live-status-action">Mark as done</span>}<ChevronDown size={12} /></button></td><td data-label="Actions"><div className="live-order-actions"><button className="view-order" onClick={() => setSelectedOrder(order)}>Details</button><button className="print-slip" disabled={printing !== null} onClick={() => printSlip(order.id)}><Printer size={14} /> {printing === order.id ? 'Printing...' : printed === order.id ? 'Ready to print' : 'Print slip'}</button></div></td></tr> })}</tbody>
        </table>
        {!filteredOrders.length && <div className="live-empty"><X size={20} /><h3>No orders found</h3><p>Try another search or status filter.</p></div>}
      </div>
    </section>
    {selectedOrder && <div className="receipt-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null) }}>
      <section className="receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
        <div className="receipt-actions"><button className="receipt-close" onClick={() => setSelectedOrder(null)} aria-label="Close receipt"><X size={18} /></button><button className="receipt-print-button" disabled={printing !== null} onClick={() => printSlip(selectedOrder.id)}><Printer size={15} /> {printing === selectedOrder.id ? 'Printing...' : printed === selectedOrder.id ? 'Ready to print' : 'Print receipt'}</button></div>
        <div className="receipt-slip" id="receipt-slip">
          <div className="receipt-brand"><img className="receipt-logo-img" src="/bilal-broast-brand.png" alt="Bilal Broast" /></div>
          <div className="receipt-rule" /><p className="receipt-address">Fresh food, prepared with care<br />Karachi, Pakistan</p>
          <div className="receipt-rule" /><div className="receipt-title-row"><div><span>INVOICE</span><h2 id="receipt-title">#{selectedOrder.id}</h2></div><span className={`receipt-status ${getLiveStatus(selectedOrder.status) === 'Done' ? 'is-done' : ''}`}>{getLiveStatus(selectedOrder.status)}</span></div>
          <div className="receipt-meta"><span><b>Date</b>{selectedOrder.createdAt}</span><span><b>Customer</b>{selectedOrder.customerName}</span><span><b>Phone</b>{selectedOrder.phone}</span><span><b>Deliver to</b>{selectedOrder.address}</span></div>
          <div className="receipt-rule" /><div className="receipt-items-head"><span>ITEM</span><span>QTY</span><span>AMOUNT</span></div><div className="receipt-items">{selectedOrder.items.map((item) => <div key={item.name}><span>{item.name}</span><b>x {item.quantity}</b><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
          <div className="receipt-rule" /><div className="receipt-totals"><span>Subtotal <b>{formatPrice(selectedOrder.subtotal)}</b></span><span>Delivery fee <b>{formatPrice(selectedOrder.deliveryFee)}</b></span><span>Payment <b>{selectedOrder.paymentMethod === 'online' ? 'Online' : 'Cash'}</b></span><strong>Total due <b>{formatPrice(selectedOrder.total)}</b></strong></div>
          <p className="receipt-thanks">Thank you for choosing Bilal Broast!<br />Please visit again.</p>
        </div>
      </section>
    </div>}
    {toast && <div className="receipt-toast" role="alert">{toast}</div>}
  </DashboardShell>
}

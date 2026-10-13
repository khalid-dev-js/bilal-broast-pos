'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, DollarSign, Search, SlidersHorizontal, UserRound, X } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { formatPrice } from '@/lib/data'
import { api } from '@/lib/api/client'

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
type SortOption = 'newest' | 'oldest' | 'total_high' | 'total_low' | 'name_asc' | 'name_desc'
type AdminOrder = {
	id: string
	backendId: string
	customerName: string
	phone: string
	address: string
	deliveryInstructions: string
	status: OrderStatus
	total: number
	subtotal: number
	deliveryFee: number
	paymentMethod: string
	createdAt: string
	items: { name: string; quantity: number; price: number }[]
}

const statusLabels: Record<OrderStatus, string> = { pending: 'New', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
const sortLabels: Record<SortOption, string> = { newest: 'Newest first', oldest: 'Oldest first', total_high: 'Highest amount', total_low: 'Lowest amount', name_asc: 'Customer A-Z', name_desc: 'Customer Z-A' }

function mapOrder(raw: any): AdminOrder {
	return { id: raw.orderNumber || raw._id || raw.id, backendId: raw._id || raw.id || raw.orderNumber, customerName: raw.customerSnapshot?.name || raw.customer?.name || raw.customerName || 'Customer', phone: raw.customerSnapshot?.phone || raw.customer?.phone || raw.phone || 'No phone provided', address: raw.deliveryAddress?.address || raw.address || 'Pickup order', deliveryInstructions: raw.deliveryAddress?.notes || raw.deliveryInstructions || '', status: raw.orderStatus || raw.status || 'pending', total: Number(raw.grandTotal ?? raw.total ?? 0), subtotal: Number(raw.subtotal ?? raw.grandTotal ?? raw.total ?? 0), deliveryFee: Number(raw.deliveryFee ?? 0), paymentMethod: raw.paymentMethod || 'cod', createdAt: raw.createdAt || raw.created_at || new Date().toISOString(), items: (raw.items || []).map((item: any) => ({ name: item.name || item.product?.name || item.nameSnapshot || 'Item', quantity: Number(item.quantity || 1), price: Number(item.price ?? item.priceSnapshot ?? 0) })) }
}

function dateKey(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function displayDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) }
function monthLabel(date: Date) { return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

export default function DashboardOrdersPage() {
	const [orders, setOrders] = useState<AdminOrder[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [query, setQuery] = useState('')
	const [status, setStatus] = useState<OrderStatus | 'all'>('all')
	const [selectedDate, setSelectedDate] = useState('')
	const [dateFrom, setDateFrom] = useState('')
	const [dateTo, setDateTo] = useState('')
	const [calendarMonth, setCalendarMonth] = useState(() => new Date())
	const [calendarOpen, setCalendarOpen] = useState(false)
	const [sort, setSort] = useState<SortOption>('newest')
	const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
	const calendarRef = useRef<HTMLDivElement>(null)

	useEffect(() => { let active = true; api.get<any>('/admin/orders?page=1&limit=100&sort=newest').then((result) => { const list = Array.isArray(result) ? result : result?.orders || result?.items || []; if (active) setOrders(list.map(mapOrder)) }).catch(() => { if (active) setError('Unable to load orders right now.') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
	useEffect(() => { const close = (event: MouseEvent) => { if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setCalendarOpen(false) }; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setCalendarOpen(false) }; document.addEventListener('mousedown', close); document.addEventListener('keydown', escape); return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape) } }, [])

	const filteredOrders = useMemo(() => orders.filter((order) => {
		const haystack = `${order.id} ${order.customerName} ${order.phone}`.toLowerCase()
		const orderDate = dateKey(order.createdAt)
		return (!query || haystack.includes(query.toLowerCase())) && (status === 'all' || order.status === status) && (selectedDate ? orderDate === selectedDate : (!dateFrom || orderDate >= dateFrom) && (!dateTo || orderDate <= dateTo))
	}).sort((a, b) => { if (sort === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt); if (sort === 'total_high') return b.total - a.total; if (sort === 'total_low') return a.total - b.total; if (sort === 'name_asc') return a.customerName.localeCompare(b.customerName); if (sort === 'name_desc') return b.customerName.localeCompare(a.customerName); return +new Date(b.createdAt) - +new Date(a.createdAt) }), [orders, query, selectedDate, sort, status])
	const activeFilters = query || selectedDate || dateFrom || dateTo || status !== 'all' || sort !== 'newest'
	const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
	const calendarDays = useMemo(() => { const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1); const start = (first.getDay() + 6) % 7; const days = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate(); return Array.from({ length: Math.ceil((start + days) / 7) * 7 }, (_, index) => { const day = index - start + 1; return day > 0 && day <= days ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) : null }) }, [calendarMonth])

	function clearFilters() { setQuery(''); setSelectedDate(''); setDateFrom(''); setDateTo(''); setStatus('all'); setSort('newest') }
	function selectDate(date: Date) { setSelectedDate(dateKey(date.toISOString())); setDateFrom(''); setDateTo(''); setCalendarOpen(false) }
	function quickDate(kind: 'today' | 'yesterday' | 'week' | 'month') { const today = new Date(); if (kind === 'today') selectDate(today); else if (kind === 'yesterday') { today.setDate(today.getDate() - 1); selectDate(today) } else { const start = new Date(today); if (kind === 'week') start.setDate(today.getDate() - 6); else start.setDate(1); setSelectedDate(''); setDateFrom(dateKey(start.toISOString())); setDateTo(dateKey(today.toISOString())); setCalendarOpen(false) } }
	async function changeStatus(order: AdminOrder, nextStatus: OrderStatus) { if (nextStatus === order.status) return; try { const result = await api.patch<any>(`/admin/orders/${order.backendId}/status`, { orderStatus: nextStatus }); const updated = mapOrder(result?.order || result); setOrders((current) => current.map((item) => item.id === order.id ? updated : item)); setSelectedOrder((current) => current?.id === order.id ? updated : current) } catch { setError('That status change is not allowed for this order.') } }

	return <DashboardShell title="Orders" description="Review incoming orders and keep the kitchen moving.">
		<section className="orders-dashboard">
			<div className="orders-toolbar">
				<label className="orders-search"><Search size={16} /><span className="sr-only">Search orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer or phone" /></label>
				<div className="orders-filter-group" ref={calendarRef}>
					  <button className={`orders-filter-button ${selectedDate || dateFrom ? 'is-active' : ''}`} onClick={() => setCalendarOpen((open) => !open)}><CalendarDays size={15} />{selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : dateFrom ? `${new Date(`${dateFrom}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(`${dateTo}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Date'}<ChevronDown size={14} /></button>
					{calendarOpen && <div className="orders-calendar" role="dialog" aria-label="Select order date"><div className="calendar-quick"><button onClick={() => quickDate('today')}>Today</button><button onClick={() => quickDate('yesterday')}>Yesterday</button><button onClick={() => quickDate('week')}>Last 7 days</button><button onClick={() => quickDate('month')}>This month</button></div><div className="calendar-heading"><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={16} /></button><strong>{monthLabel(calendarMonth)}</strong><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={16} /></button></div><div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{calendarDays.map((day, index) => day ? <button key={index} className={`${selectedDate === dateKey(day.toISOString()) ? 'is-selected ' : ''}${sameDay(day, new Date()) ? 'is-today' : ''}`} onClick={() => selectDate(day)}>{day.getDate()}</button> : <span key={index} />)}</div></div>}
				</div>
				<select className="orders-select" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | 'all')} aria-label="Filter by status"><option value="all">All statuses</option>{statusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select>
				<select className="orders-select" value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort orders">{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
				{activeFilters && <button className="orders-clear" onClick={clearFilters}><X size={14} />Clear filters</button>}
			</div>
			{activeFilters && <div className="orders-active-filters"><span>Active filters</span>{query && <button onClick={() => setQuery('')}>Search: {query} <X size={12} /></button>}{(selectedDate || dateFrom) && <button onClick={() => { setSelectedDate(''); setDateFrom(''); setDateTo('') }}>{selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : `${dateFrom} - ${dateTo}`} <X size={12} /></button>}{status !== 'all' && <button onClick={() => setStatus('all')}>{statusLabels[status]} <X size={12} /></button>}{sort !== 'newest' && <button onClick={() => setSort('newest')}>{sortLabels[sort]} <X size={12} /></button>}</div>}
			<div className="orders-stat-row"><div><span>Total shown</span><strong>{filteredOrders.length}</strong></div><div><span>New</span><strong>{filteredOrders.filter((order) => order.status === 'pending').length}</strong></div><div><span>Preparing</span><strong>{filteredOrders.filter((order) => order.status === 'preparing').length}</strong></div><div><span>Revenue shown</span><strong>{formatPrice(totalRevenue)}</strong></div></div>
			{error && <div className="orders-error">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
			{loading ? <div className="orders-skeleton-list">{[1, 2, 3].map((item) => <div className="orders-skeleton" key={item} />)}</div> : !filteredOrders.length ? <div className="orders-empty"><SlidersHorizontal size={25} /><h2>No orders found</h2><p>Try changing your date, status or search filters.</p><button className="button button-outline" onClick={clearFilters}>Clear filters</button></div> : <div className="admin-order-list orders-list-redesign">{filteredOrders.map((order) => <article className="admin-order-card" key={order.id}><div className="admin-order-card-main"><div className="admin-order-card-top"><span className="dashboard-eyebrow">{order.id}</span><select className={`admin-order-status status-${order.status}`} value={order.status} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)} aria-label={`Status for ${order.id}`}>{statusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select></div><h2>{order.customerName}</h2><p className="admin-order-items">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(' · ') || 'No items recorded'}</p><div className="admin-order-meta"><span><Clock3 size={13} />{displayDate(order.createdAt)}</span><span><UserRound size={13} />{order.phone}</span></div></div><div className="admin-order-total"><strong>{formatPrice(order.total)}</strong><button onClick={() => setSelectedOrder(order)}>View details <ChevronRight size={15} /></button></div></article>)}</div>}
		</section>
		{selectedOrder && <div className="admin-order-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null) }}><section className="admin-order-modal" role="dialog" aria-modal="true" aria-labelledby="admin-order-detail-title"><button className="admin-order-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close details"><X size={18} /></button><span className="dashboard-eyebrow">Order details</span><h2 id="admin-order-detail-title">{selectedOrder.id}</h2><div className="admin-order-detail-status"><select className={`admin-order-status status-${selectedOrder.status}`} value={selectedOrder.status} onChange={(event) => changeStatus(selectedOrder, event.target.value as OrderStatus)}>{statusOptions.map((item) => <option key={item} value={item}>{statusLabels[item]}</option>)}</select><span>{displayDate(selectedOrder.createdAt)}</span></div><div className="admin-order-detail-grid"><div><small>Customer</small><strong>{selectedOrder.customerName}</strong><span>{selectedOrder.phone}</span></div><div><small>Delivery address</small><strong>{selectedOrder.address}</strong><span>{selectedOrder.deliveryInstructions || 'No extra instructions'}</span></div></div><div className="admin-order-detail-items"><small>Ordered items</small>{selectedOrder.items.map((item) => <div key={item.name}><span>{item.quantity} × {item.name}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><div className="admin-order-detail-summary"><span>Subtotal <strong>{formatPrice(selectedOrder.subtotal)}</strong></span><span>Delivery fee <strong>{formatPrice(selectedOrder.deliveryFee)}</strong></span><span>Payment <strong>{selectedOrder.paymentMethod === 'online' ? 'Online payment' : 'Cash on delivery'}</strong></span><span className="grand-total">Grand total <strong>{formatPrice(selectedOrder.total)}</strong></span></div></section></div>}
	</DashboardShell>
}

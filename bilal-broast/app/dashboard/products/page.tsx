'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { categories, formatPrice } from '@/lib/data'

type DashboardProduct = {
  id: string
  name: string
  description?: string
  category?: string
  image: string
  price: number
  originalPrice?: number
}

function normalizeProduct(item: any): DashboardProduct {
  return {
    ...item,
    id: item._id || item.id,
    category: typeof item.category === 'object' ? item.category?.name : item.category,
    image: item.image || item.imageUrl || item.images?.[0] || '/placeholder.svg',
  }
}

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [items, setItems] = useState<DashboardProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<DashboardProduct | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    api.get<any>('/admin/products?page=1&limit=100').then((response) => {
      const data = Array.isArray(response) ? response : response?.products || response?.items || response?.results || response?.data?.products || response?.data?.items || []
      setItems(Array.isArray(data) ? data.map(normalizeProduct) : [])
    }).catch((error) => {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to load products.' })
    }).finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => items.filter((product) => {
    const productCategory = product.category || ''
    return (category === 'All' || productCategory === category) && `${product.name} ${productCategory}`.toLowerCase().includes(query.toLowerCase())
  }), [items, query, category])

  async function deleteProduct() {
    if (!confirmDelete) return
    try {
      await api.delete(`/admin/products/${confirmDelete.id}`)
      setItems((current) => current.filter((item) => item.id !== confirmDelete.id))
      setNotice({ type: 'success', message: `${confirmDelete.name} deleted successfully.` })
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete product.' })
    } finally {
      setConfirmDelete(null)
    }
  }

  return <DashboardShell title="Products" description="Manage the items guests see on your menu.">
    {notice && <div className={`dashboard-toast dashboard-toast-${notice.type}`} role="status"><span>{notice.type === 'success' ? 'Done' : 'Error'}</span><strong>{notice.message}</strong><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
    <div className="products-toolbar"><input placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select><Link href="/dashboard/products/new" className="button button-primary"><Plus size={16} /> Add product</Link></div>
    {loading ? <div className="editor-card">Loading products...</div> : visible.length ? <div className="admin-product-list">{visible.map((product) => <article className="admin-product" key={product.id}><div className="admin-thumb"><Image src={product.image} alt={product.name} fill sizes="80px" /></div><div className="admin-product-copy"><span>{product.category || 'Uncategorized'}</span><h2>{product.name}</h2><p>{product.description}</p></div><div className="admin-product-price"><strong>{formatPrice(product.price)}</strong>{product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}</div><span className="admin-status">Active</span><div className="admin-actions"><Link href={`/dashboard/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}><Pencil size={16} /></Link><button type="button" onClick={() => setConfirmDelete(product)} aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button></div></article>)}</div> : <div className="editor-card"><h2>No products found</h2><p>Add a product from the backend dashboard to see it here.</p></div>}
    {confirmDelete && <div className="modal-backdrop" role="presentation" onClick={() => setConfirmDelete(null)}><section className="confirm-modal dashboard-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-product-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setConfirmDelete(null)} aria-label="Close delete confirmation"><X size={18} /></button><span className="dashboard-eyebrow">Delete product</span><h2 id="delete-product-title">Remove {confirmDelete.name}?</h2><p>This product will be removed from the dashboard and menu.</p><div className="confirm-modal-actions"><button className="button button-outline" type="button" onClick={() => setConfirmDelete(null)}>Cancel</button><button className="button button-primary delete-confirm-button" type="button" onClick={deleteProduct}>Delete product <Trash2 size={15} /></button></div></section></div>}
  </DashboardShell>
}

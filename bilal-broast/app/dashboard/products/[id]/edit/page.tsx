'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ProductForm } from '@/components/dashboard/ProductForm'
export default function EditProductPage() { const { id } = useParams<{ id: string }>(); const [product, setProduct] = useState<any>(null); const [loading, setLoading] = useState(true); useEffect(() => { if (!id) return; api.get<any>(`/admin/products/${id}`).then((response) => setProduct(response?.product || response?.data || response)).catch(() => setProduct(null)).finally(() => setLoading(false)) }, [id]); if (loading) return <DashboardShell title="Edit product" description="Loading product details."><div className="editor-card">Loading product…</div></DashboardShell>; if (!product) return <DashboardShell title="Product not found" description="This product could not be loaded from the backend."><div className="editor-card">Product not found.</div></DashboardShell>; const normalized = { ...product, id: product._id || product.id, slug: product.slug || product._id || product.id, category: typeof product.category === 'object' ? product.category.name : product.category, image: product.image || product.imageUrl || product.images?.[0] || '/placeholder.svg' }; return <DashboardShell title="Edit product" description={`Update ${normalized.name} without losing its menu identity.`}><ProductForm product={normalized} /></DashboardShell> }

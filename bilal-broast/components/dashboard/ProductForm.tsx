'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, ImagePlus, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { categories, type Product } from '@/lib/data'
import { api } from '@/lib/api/client'

export function ProductForm({ product }: { product?: Product }) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [categoryList, setCategoryList] = useState(categories.map((category) => category.name))
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({})
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(product?.category || categories[0].name)
  const [name, setName] = useState(product?.name || '')
  const [slug, setSlug] = useState(product?.slug || '')
  const [description, setDescription] = useState(product?.description || '')
  const [ingredients, setIngredients] = useState(product?.ingredients.join(', ') || '')
  const [price, setPrice] = useState(product?.price ? String(product.price) : '')
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ? String(product.originalPrice) : '')
  const [image, setImage] = useState(product?.image || '')
  const [popular, setPopular] = useState(Boolean(product?.isPopular))
  const [deal, setDeal] = useState(Boolean(product?.isDeal))
  const [uploading, setUploading] = useState(false)
  const [ingredientInput, setIngredientInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const ingredientItems = useMemo(() => ingredients.split(',').map((item) => item.trim()).filter(Boolean), [ingredients])
  const discount = price && originalPrice && Number(originalPrice) > Number(price) ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : 0
  useEffect(() => { api.get<any>('/admin/categories').then((response) => { const list = Array.isArray(response) ? response : response?.categories || response?.data || []; const ids: Record<string, string> = {}; list.forEach((item: any) => { const name = item.name || item.title; const id = item._id || item.id; if (name && id) ids[name] = id }); setCategoryIds(ids); if (list.length) setCategoryList(list.map((item: any) => item.name || item.title).filter(Boolean)) }).catch(() => {}) }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setSaved(false); setNotice(null)
    const payload = { name: name.trim(), slug: slug.trim(), price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : undefined, description: description.trim(), category: categoryIds[selectedCategory] || selectedCategory.toLowerCase(), image, ingredients: ingredientItems, isAvailable: true, isFeatured: popular, isDeal: deal }
    try {
      if (product?.id) await api.patch(`/admin/products/${product.id}`, payload)
      else await api.post('/admin/products', payload)
      setSaved(true)
      setNotice({ type: 'success', message: product?.id ? 'Product updated successfully.' : 'Product added successfully.' })
      if (!product?.id) {
        setName(''); setSlug(''); setDescription(''); setIngredients(''); setPrice(''); setOriginalPrice(''); setImage(''); setIngredientInput('')
      }
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save product.' })
    } finally { setSaving(false) }
  }
  async function addCategory() { const value = newCategory.trim(); if (!value || categoryList.includes(value)) return; try { await api.post('/admin/categories', { name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-'), isActive: true, sortOrder: categoryList.length + 1 }); setCategoryList((current) => [...current, value]); setSelectedCategory(value); setNewCategory(''); setShowNewCategory(false) } catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to create category') } }
  function addIngredient(value = ingredientInput) { const clean = value.trim(); if (!clean) return; setIngredients((current) => [...new Set([...current.split(',').map((item) => item.trim()).filter(Boolean), clean])].join(', ')); setIngredientInput('') }
  function removeIngredient(value: string) { setIngredients((current) => current.split(',').map((item) => item.trim()).filter((item) => item && item !== value).join(', ')) }
  async function handleImageUpload(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post<any>('/admin/uploads/image', formData)
      const url = response?.url || response?.secure_url || response?.data?.url
      if (!url) throw new Error('Cloudinary did not return an image URL')
      setImage(url)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to upload image')
    } finally {
      setUploading(false)
    }
  }

  return <div className="product-editor-shell">
    {notice && <div className={`dashboard-toast dashboard-toast-${notice.type}`} role="status"><span>{notice.type === 'success' ? 'Done' : 'Error'}</span><strong>{notice.message}</strong><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
    <div className="product-editor-topbar"><Link href="/dashboard/products" className="back-link"><ArrowLeft size={15} /> Back to products</Link><div className="editor-state">{saved ? <><Check size={15} /> Saved locally</> : 'Unsaved changes'}</div></div>
    <form className="product-editor" onSubmit={submit}>
      <div className="product-editor-main">
        <div className="form-section editor-intro"><span className="dashboard-eyebrow">Product information</span><h1>{product ? 'Edit product' : 'Add a new product'}</h1><p>Give guests a clear, appetizing reason to add this item to their order.</p></div>
        <div className="form-section editor-card"><div className="form-section-heading"><div><span className="dashboard-eyebrow">Details</span><h2>Product information</h2></div></div><div className="form-grid"><label>Product name<input name="name" value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!product) setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) }} required /></label><label>Slug<input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required /><small className="field-hint">Used in the product URL</small></label><label className="wide">Description<textarea name="description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={180} required /><small className="character-count">{description.length}/180</small></label><div className="category-field"><label htmlFor="product-category">Category</label><div className="category-select-row"><select id="product-category" name="category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>{categoryList.map((category) => <option key={category}>{category}</option>)}</select><button type="button" className="new-category-button" onClick={() => setShowNewCategory((value) => !value)}><Plus size={14} /> New</button></div>{showNewCategory && <div className="new-category-box"><input autoFocus value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Wraps" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCategory() } }} /><button type="button" onClick={() => addCategory()}>Add category</button><button type="button" aria-label="Close new category" className="close-category" onClick={() => setShowNewCategory(false)}><X size={14} /></button></div>}</div><div className="ingredient-field"><label>Ingredients</label><div className="ingredient-chips">{ingredientItems.map((item) => <button type="button" key={item} onClick={() => removeIngredient(item)}>{item}<X size={12} /></button>)}</div><div className="ingredient-input-row"><input value={ingredientInput} onChange={(event) => setIngredientInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addIngredient() } }} placeholder="Type an ingredient" /><button type="button" onClick={() => addIngredient()} disabled={!ingredientInput.trim()} aria-label="Add ingredient"><Plus size={14} /> Add</button></div></div></div></div>
        <div className="form-section editor-card"><div className="form-section-heading"><div><span className="dashboard-eyebrow">Pricing & media</span><h2>Make it appetizing</h2></div>{discount > 0 && <span className="discount-badge">{discount}% off</span>}</div><div className="form-grid"><label>Price<input name="price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} required /></label><label>Original price<input name="originalPrice" type="number" min="0" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} /><small className="field-hint">Optional sale reference</small></label><div className="image-field wide"><label>Product image</label><div className="image-input-row"><input name="image" value={image} onChange={(event) => setImage(event.target.value)} placeholder="Paste an image URL" required /><button type="button" className="upload-button" onClick={() => fileRef.current?.click()} disabled={uploading}><ImagePlus size={15} /> {uploading ? 'Uploading...' : 'Upload'}</button><input ref={fileRef} hidden type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} /></div></div></div></div>
      </div>
      <aside className="product-editor-side"><div className="editor-preview-card"><div className="preview-label">Live preview</div><div className="preview-image">{image ? <img src={image} alt="Product preview" /> : <div><ImagePlus size={28} /><span>Your image preview</span></div>}</div><div className="preview-copy"><span>{selectedCategory}</span><h2>{name || 'Product name'}</h2><p>{description || 'A short, appetizing description will appear here.'}</p><div className="preview-price"><strong>Rs. {Number(price || 0).toLocaleString()}</strong>{originalPrice && Number(originalPrice) > Number(price || 0) && <del>Rs. {Number(originalPrice).toLocaleString()}</del>}</div></div></div><div className="editor-settings-card"><div><span className="dashboard-eyebrow">Visibility</span><h2>Merchandising</h2></div><label className="switch-row"><span>Popular product</span><input type="checkbox" checked={popular} onChange={(event) => setPopular(event.target.checked)} /></label><label className="switch-row"><span>Featured deal</span><input type="checkbox" checked={deal} onChange={(event) => setDeal(event.target.checked)} /></label></div></aside>
      <div className="editor-actions"><Link href="/dashboard/products" className="button button-ghost">Cancel</Link><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}</button></div>
    </form>{saved && <p className="form-success"><Check size={15} /> Product saved in mock mode. Connect POST /api/products when the backend is ready.</p>}
  </div>
}

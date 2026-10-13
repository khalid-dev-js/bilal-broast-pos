'use client'

import Link from 'next/link'
import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/layout/Logo'
import { PushNotificationControl } from '@/components/dashboard/PushNotificationControl'
import { api } from '@/lib/api/client'
import { disconnectSocket } from '@/lib/api/socket'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  { href: '/dashboard/live-orders', label: 'Live Orders', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  async function handleLogout() {
    try { await api.post('/auth/logout') } finally { disconnectSocket(); router.replace('/admin-login') }
  }
  return <div className="dashboard-app">
    <aside className={`dashboard-sidebar ${open ? 'is-open' : ''}`}>
      <div className="dashboard-brand"><Logo /><button className="dashboard-close" onClick={() => setOpen(false)} aria-label="Close dashboard menu"><X size={20} /></button></div>
      <nav className="dashboard-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)}><Icon size={17} />{label}</Link>)}</nav>
      <div className="dashboard-account"><div className="admin-avatar">AB</div><div><strong>Admin account</strong><span>Restaurant manager</span></div><button aria-label="Log out" onClick={handleLogout}><LogOut size={16} /></button></div>
    </aside>
    <main className="dashboard-main"><header className="dashboard-header"><button className="dashboard-menu" onClick={() => setOpen(true)} aria-label="Open dashboard menu"><Menu size={21} /></button><div><span className="dashboard-eyebrow">Bilal Broast / Admin</span><h1>{title}</h1><p>{description}</p></div><div style={{ marginLeft: 'auto', display: 'grid', justifyItems: 'end', gap: 8 }}><PushNotificationControl /><Link href="/" className="dashboard-view-site" style={{ marginLeft: 0 }}>View site</Link></div></header>{children}</main>
  </div>
}

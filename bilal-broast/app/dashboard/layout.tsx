import { AdminGuard } from '@/components/dashboard/AdminGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}

'use client'

import { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white px-6 py-8">
        <h2 className="text-lg font-semibold mb-10">X-Scheduler</h2>

        <nav className="space-y-3 text-sm">
          <a href="/dashboard" className="block font-medium">
            Dashboard
          </a>
          <a href="/dashboard/analytics" className="block text-muted">
            Analytics
          </a>
        </nav>

        <button
          onClick={() => {
            logout()
            router.push('/login')
          }}
          className="mt-10 flex items-center gap-2 text-sm text-muted hover:text-danger"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Folder,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Content Inbox', href: '/inbox', icon: Inbox },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-2 text-xl font-bold tracking-tight">
        X-Scheduler
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href

          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

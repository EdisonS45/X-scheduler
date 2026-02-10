'use client'

export default function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="text-sm font-medium text-slate-700">
        Welcome back
      </div>

      <div className="flex items-center gap-4">
        {/* Later: notifications, profile menu */}
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
    </header>
  )
}

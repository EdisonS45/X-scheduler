import { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string | number
  icon?: ReactNode
  subtext?: string
}

export default function StatCard({
  label,
  value,
  icon,
  subtext,
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-2 text-3xl font-semibold text-slate-900">
        {value}
      </div>

      {subtext && (
        <p className="mt-1 text-sm text-slate-500">{subtext}</p>
      )}
    </div>
  )
}

import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Title + Description */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-slate-500 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Right: Action */}
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

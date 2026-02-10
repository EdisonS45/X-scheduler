'use client'

type Stat = {
  label: string
  value: string
  sub?: string
}

const STATS: Stat[] = [
  { label: 'Posts sent', value: '128', sub: 'Last 30 days' },
  { label: 'Success rate', value: '96.1%' },
  { label: 'Failures', value: '5' },
  { label: 'Active projects', value: '3' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Analytics
        </h1>
        <p className="text-sm text-slate-500">
          Performance overview of your scheduled posts
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-xs text-slate-400 mt-1">
                {stat.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Placeholder chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-700">
          Posting activity
        </p>
        <div className="mt-4 h-40 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          Chart placeholder
        </div>
      </div>
    </div>
  )
}

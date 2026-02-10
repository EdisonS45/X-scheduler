'use client'

import { useEffect, useState } from 'react'
import { getProjects } from '@/lib/projects'
import StatusPill from '@/components/ui/StatusPill'
import Link from 'next/link'

type Project = {
  _id: string
  name: string
  status: string
  timeGapMinutes: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects().then((data) => {
      setProjects([
        ...data.active,
        ...data.pendingStopped,
        ...data.completed,
      ])
      setLoading(false)
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Projects</h1>

        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryMuted">
          + New Project
        </button>
      </div>

      {loading && <p className="text-muted">Loading projects…</p>}

      {!loading && projects.length === 0 && (
        <div className="text-muted">
          No projects yet. Create your first campaign.
        </div>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <Link
            key={p._id}
            href={`/dashboard/projects/${p._id}`}
            className="block bg-white border rounded-xl p-5 shadow-soft hover:shadow-card transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-xs text-muted mt-1">
                  Interval: {p.timeGapMinutes} min
                </p>
              </div>

              <StatusPill status={p.status} />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

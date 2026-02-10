'use client'

import Link from 'next/link'

type Project = {
  id: string
  name: string
  status: 'running' | 'paused' | 'completed'
  totalPosts: number
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Founder Threads',
    status: 'running',
    totalPosts: 42,
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'paused',
    totalPosts: 18,
  },
]

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Projects
        </h1>

        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          New Project
        </button>
      </div>

      {/* Projects list */}
      <div className="rounded-lg border border-slate-200 bg-white">
        {MOCK_PROJECTS.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No projects yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {MOCK_PROJECTS.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {project.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {project.totalPosts} posts
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      project.status === 'running'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {project.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

type Post = {
  id: string
  content: string
  status: 'scheduled' | 'posted' | 'failed'
  scheduledAt: string
}

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    content: 'Shipping faster beats perfect planning.',
    status: 'posted',
    scheduledAt: '2024-09-10 09:00',
  },
  {
    id: 'p2',
    content: 'Your MVP is supposed to be ugly.',
    status: 'scheduled',
    scheduledAt: '2024-09-11 09:00',
  },
]

export default function ProjectDetailsPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/projects"
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to Projects
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Project #{id}
        </h1>
        <p className="text-sm text-slate-500">
          Scheduled posts in this project
        </p>
      </div>

      {/* Posts table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left">
            <tr>
              <th className="p-3">Content</th>
              <th className="p-3">Scheduled</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_POSTS.map((post) => (
              <tr
                key={post.id}
                className="border-b last:border-0"
              >
                <td className="p-3 text-slate-700">
                  {post.content}
                </td>
                <td className="p-3 text-slate-500">
                  {post.scheduledAt}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      post.status === 'posted'
                        ? 'bg-green-100 text-green-700'
                        : post.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

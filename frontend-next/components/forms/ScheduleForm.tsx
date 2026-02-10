'use client'

import { useState, useMemo } from 'react'

export type SchedulePayload = {
  intervalMinutes: number
  startAt: string
}

type Props = {
  onSubmit?: (data: SchedulePayload) => void
}

export default function ScheduleForm({ onSubmit }: Props) {
  // --- defaults: safe & predictable ---
  const [intervalMinutes, setIntervalMinutes] = useState<number>(60)

  const [startAt, setStartAt] = useState<string>(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 10) // buffer time
    d.setSeconds(0)
    d.setMilliseconds(0)
    return d.toISOString().slice(0, 16)
  })

  const summary = useMemo(() => {
    const startDate = new Date(startAt)
    const nextDate = new Date(startDate)
    nextDate.setMinutes(startDate.getMinutes() + intervalMinutes)

    return {
      start: startDate.toLocaleString(),
      next: nextDate.toLocaleString(),
    }
  }, [startAt, intervalMinutes])

  const handleSubmit = () => {
    onSubmit?.({
      intervalMinutes,
      startAt,
    })
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      {/* Posting Frequency */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Posting frequency
        </label>

        <select
          value={intervalMinutes}
          onChange={(e) => setIntervalMinutes(Number(e.target.value))}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value={30}>Every 30 minutes</option>
          <option value={60}>Every 1 hour</option>
          <option value={120}>Every 2 hours</option>
          <option value={240}>Every 4 hours</option>
        </select>
      </div>

      {/* Start Time */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Start posting at
        </label>

        <input
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      {/* Summary */}
      <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Summary</p>

        <p className="mt-1">
          First tweet will post at{' '}
          <span className="font-medium">{summary.start}</span>
        </p>

        <p>
          Next tweet at{' '}
          <span className="font-medium">{summary.next}</span>
        </p>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create Project & Start
        </button>
      </div>
    </div>
  )
}

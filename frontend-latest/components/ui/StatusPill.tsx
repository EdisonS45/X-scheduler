import clsx from 'clsx'

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'px-3 py-1 rounded-full text-xs font-medium',
        status === 'running' && 'bg-green-100 text-green-700',
        status === 'paused' && 'bg-yellow-100 text-yellow-700',
        status === 'stopped' && 'bg-gray-100 text-gray-600'
      )}
    >
      {status}
    </span>
  )
}

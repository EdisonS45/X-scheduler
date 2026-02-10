import BulkTextInput from '@/components/forms/BulkTextInput'

export default function InboxPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Content Inbox
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste tweets in bulk. We’ll split and schedule them for you.
        </p>
      </div>

      <BulkTextInput />
    </div>
  )
}

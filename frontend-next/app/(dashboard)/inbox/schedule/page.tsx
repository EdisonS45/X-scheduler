import ScheduleForm from '@/components/forms/ScheduleForm'

export default function SchedulePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Schedule Tweets
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Choose how often your tweets should be posted.
        </p>
      </div>

      <ScheduleForm />
    </div>
  )
}

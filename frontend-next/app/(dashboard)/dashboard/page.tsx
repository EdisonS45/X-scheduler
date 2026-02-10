// app/(dashboard)/dashboard/page.tsx
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";

const stats = [
  {
    label: "Posts Scheduled",
    value: "128",
    icon: CalendarDays,
  },
  {
    label: "Posted Successfully",
    value: "96",
    icon: CheckCircle2,
  },
  {
    label: "Pending",
    value: "24",
    icon: Clock,
  },
  {
    label: "Failed",
    value: "8",
    icon: XCircle,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your scheduled activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <stat.icon className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-medium text-slate-700 mb-4">
          Posting Activity
        </h2>

        <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 text-sm">
          Chart will be rendered here
        </div>
      </div>
    </div>
  );
}

'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account and integrations
        </p>
      </div>

      {/* Account section */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-800">
          Account
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            disabled
            value="user@example.com"
            className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
          />
        </div>
      </section>

      {/* X integration */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-medium text-slate-800">
          X (Twitter) Integration
        </h2>

        <p className="text-sm text-slate-500">
          Manage your connected X account
        </p>

        <div className="flex items-center justify-between rounded-md border border-slate-200 p-4">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Connected account
            </p>
            <p className="text-xs text-slate-500">
              @yourhandle
            </p>
          </div>

          <button className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            Disconnect
          </button>
        </div>
      </section>
    </div>
  )
}

"use client";

import { useMemo, useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

type ScheduledPost = {
  id: string;
  content: string;
  scheduledAt: string;
  status: "queued" | "posted" | "failed";
};

const START_HOUR = 9;
const END_HOUR = 18;
const SLOT_HEIGHT = 64; // px per hour

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(dayjs().startOf("week"));

  // 🔁 mock data (replace with API later)
  const posts: ScheduledPost[] = [
    {
      id: "1",
      content: "Launching v1 today 🚀",
      scheduledAt: dayjs().hour(11).minute(30).toISOString(),
      status: "queued",
    },
    {
      id: "2",
      content: "Thread: lessons from building X-Scheduler",
      scheduledAt: dayjs().hour(14).minute(0).toISOString(),
      status: "posted",
    },
  ];

  const days = useMemo(
    () => Array.from({ length: 5 }).map((_, i) => weekStart.add(i + 1, "day")),
    [weekStart]
  );

  function getTop(date: dayjs.Dayjs) {
    const minutes = date.hour() * 60 + date.minute();
    return ((minutes - START_HOUR * 60) / 60) * SLOT_HEIGHT;
  }

  return (
    <div className="h-full bg-slate-100 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 h-full flex">
        {/* Sidebar */}
        <aside className="w-72 border-r p-6 space-y-6">
          <h2 className="text-lg font-semibold">Calendar</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setWeekStart(w => w.subtract(1, "week"))}
              className="p-2 rounded hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setWeekStart(w => w.add(1, "week"))}
              className="p-2 rounded hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-sm text-slate-500">
            {weekStart.format("MMM DD")} –{" "}
            {weekStart.add(4, "day").format("MMM DD")}
          </p>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 text-sm"
                placeholder="Search posts"
              />
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <Plus size={16} />
              Schedule Post
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-6 relative">
              {/* Time column */}
              <div className="border-r">
                {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 text-xs text-slate-500 p-2"
                  >
                    {START_HOUR + i}:00
                  </div>
                ))}
              </div>

              {/* Days */}
              {days.map(day => (
                <div key={day.toString()} className="relative border-r">
                  {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                    <div key={i} className="h-16 border-b border-slate-50" />
                  ))}

                  {posts
                    .filter(p => dayjs(p.scheduledAt).isSame(day, "day"))
                    .map(post => {
                      const time = dayjs(post.scheduledAt);
                      return (
                        <div
                          key={post.id}
                          className="absolute left-2 right-2 bg-blue-50 border border-blue-100 rounded-xl p-2 text-xs"
                          style={{
                            top: getTop(time),
                            height: 48,
                          }}
                        >
                          <div className="font-medium truncate">
                            {post.content}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {time.format("hh:mm A")} • {post.status}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

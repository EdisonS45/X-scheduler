import React from 'react'

export default function ProjectCard({project, onStart, onStop}){
  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-slate-500 mt-1">Status: {project.status}</p>
        </div>
<div className="flex gap-2">
  <button onClick={() => onPause(project._id)} className="px-3 py-1 rounded-lg bg-yellow-500 text-white">Pause</button>
  <button onClick={() => onDelete(project._id)} className="px-3 py-1 rounded-lg bg-red-600 text-white">Delete</button>
</div>

      </div>
    </div>
  )
}
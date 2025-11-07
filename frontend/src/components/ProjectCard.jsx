import React from 'react'
import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  TrashIcon, 
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/solid'

const StatusIndicator = ({ status }) => {
  let colorClass = 'bg-slate-400';
  let text = 'Stopped';
  
  if (status === 'running') {
    colorClass = 'bg-green-500';
    text = 'Running';
  } else if (status === 'paused') {
    colorClass = 'bg-yellow-500';
    text = 'Paused';
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${colorClass}`}></span>
      <span className="text-sm font-medium text-slate-700 capitalize">{text}</span>
    </div>
  )
}

export default function ProjectCard({ project, onStart, onPause, onStop, onDelete }){
  
  const handleResume = () => onStop(project._id); // Stop route toggles resume

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{project.name}</h3>
          <StatusIndicator status={project.status} />
        </div>
        
        <p className="text-sm text-slate-500 mb-4">
          Posts every {project.timeGapMinutes} minutes
        </p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <ClockIcon className="h-5 w-5 text-blue-500 mx-auto" />
            <p className="text-xl font-semibold">{project.pending || 0}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
          <div>
            <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
            <p className="text-xl font-semibold">{project.posted || 0}</p>
            <p className="text-xs text-slate-500">Posted</p>
          </div>
          <div>
            <XCircleIcon className="h-5 w-5 text-red-500 mx-auto" />
            <p className="text-xl font-semibold">{project.failed || 0}</p>
            <p className="text-xs text-slate-500">Failed</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 grid grid-cols-2 gap-2">
        {/* --- Action Buttons --- */}
        {project.status === 'stopped' && (
          <button 
            onClick={() => onStart(project._id)} 
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600"
          >
            <PlayIcon className="h-5 w-5" />
            Start
          </button>
        )}

        {project.status === 'running' && (
          <>
            <button 
              onClick={() => onPause(project._id)} 
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600"
            >
              <PauseIcon className="h-5 w-5" />
              Pause
            </button>
            <button 
              onClick={() => onStop(project._id)} 
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              <StopIcon className="h-5 w-5" />
              Stop
            </button>
          </>
        )}
        
        {project.status === 'paused' && (
          <button 
            onClick={handleResume}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600"
          >
            <PlayIcon className="h-5 w-5" />
            Resume
          </button>
        )}

        {/* --- Management Buttons --- */}
        <Link 
          to={`/project/${project._id}`}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
        >
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          View
        </Link>
        <button 
          onClick={() => onDelete(project._id)} 
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 hover:text-red-600"
        >
          <TrashIcon className="h-5 w-5" />
          Delete
        </button>
      </div>
    </div>
  )
}
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

// --- New Status Indicator Component ---
const StatusIndicator = ({ status }) => {
  let colorClass = 'bg-slate-400 text-slate-800';
  let text = 'Stopped';
  let dotClass = 'bg-slate-500';

  if (status === 'running') {
    colorClass = 'bg-green-100 text-green-800';
    text = 'Running';
    dotClass = 'bg-green-500 animate-pulse';
  } else if (status === 'paused') {
    colorClass = 'bg-yellow-100 text-yellow-800';
    text = 'Paused';
    dotClass = 'bg-yellow-500';
  }
  
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <span className={`h-2 w-2 rounded-full ${dotClass}`}></span>
      {text}
    </div>
  )
}

// --- New Stat Component ---
const StatCard = ({ icon, label, value, colorClass = 'text-slate-500' }) => (
  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md">
    {React.cloneElement(icon, { className: `h-5 w-5 ${colorClass}` })}
    <div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-600">{label}</p>
    </div>
  </div>
)

export default function ProjectCard({ project, onStart, onPause, onStop, onDelete }){
  
  const handleResume = () => onStop(project._id);
  const hasPendingPosts = project.pending > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 truncate" title={project.name}>
            {project.name}
          </h3>
          <StatusIndicator status={project.status} />
        </div>
        
        <p className="text-sm text-slate-500 mb-4">
          Posts every {project.timeGapMinutes} minutes
        </p>

        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={<ClockIcon />} label="Pending" value={project.pending || 0} colorClass="text-blue-500" />
          <StatCard icon={<CheckCircleIcon />} label="Posted" value={project.posted || 0} colorClass="text-green-500" />
          <StatCard icon={<XCircleIcon />} label="Failed" value={project.failed || 0} colorClass="text-red-500" />
        </div>
      </div>

      <div className="bg-slate-50 p-3 grid grid-cols-2 gap-2">
        {/* --- Primary Actions (Start/Pause/Resume) --- */}
        {project.status === 'stopped' && (
          <button 
            onClick={() => onStart(project._id)} 
            disabled={!hasPendingPosts} 
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            title={!hasPendingPosts ? "No pending posts to start" : "Start project"}
          >
            <PlayIcon className="h-5 w-5" />
            Start Project
          </button>
        )}

        {project.status === 'running' && (
          <button 
            onClick={() => onPause(project._id)} 
            disabled={!hasPendingPosts}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <PauseIcon className="h-5 w-5" />
            Pause Project
          </button>
        )}
        
        {project.status === 'paused' && (
          <button 
            onClick={handleResume}
            disabled={!hasPendingPosts}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            title={!hasPendingPosts ? "No pending posts to resume" : "Resume project"}
          >
            <PlayIcon className="h-5 w-5" />
            Resume Project
          </button>
        )}

        {/* --- Secondary Actions (Fixed Color) --- */}
        <Link 
          to={`/project/${project._id}`}
          // FIX: Uses Indigo colors by default
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 hover:bg-indigo-100"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          View
        </Link>
        <button 
          onClick={() => onDelete(project)} 
          // FIX: Uses Red colors by default
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 hover:bg-red-100"
        >
          <TrashIcon className="h-4 w-4" />
          Delete
        </button>
        
        {project.status === 'running' && (
           <button 
              onClick={() => onStop(project._id)} 
              className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              <StopIcon className="h-5 w-5" />
              Stop Immediately
            </button>
        )}
      </div>
    </div>
  )
}
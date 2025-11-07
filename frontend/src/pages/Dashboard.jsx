import React, {useEffect, useState} from 'react'
import ProjectCard from '../components/ProjectCard'
import AddProjectModal from '../components/AddProjectModal'
import { getProjects, startProject } from '../lib/api'

export default function Dashboard(){
  const [projects, setProjects] = useState([])
  const fetch = async ()=>{
    const res = await getProjects(); setProjects(res.data)
  }
  useEffect(()=>{ fetch() }, [])

  const handleStart = async (id)=>{ await startProject(id); await fetch() }
  const handleStop = async (id)=>{ /* TODO: stop route */ await fetch() }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">X Scheduler — Dashboard</h1>
        <AddProjectModal onCreated={fetch} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(p => <ProjectCard key={p._id} project={p} onStart={handleStart} onStop={handleStop} />)}
      </div>
    </div>
  )
}
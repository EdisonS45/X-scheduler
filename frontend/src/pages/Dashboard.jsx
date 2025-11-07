import React, { useEffect, useState, useCallback } from 'react'
import ProjectCard from '../components/ProjectCard'
import AddProjectModal from '../components/AddProjectModal'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import InfoModal from '../components/InfoModal' // <-- 1. Import new component
import { getProjects, startProject, pauseProject, stopProject, deleteProject } from '../lib/api'

export default function Dashboard(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // --- 2. New state for Info/Error modal ---
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [infoModalConfig, setInfoModalConfig] = useState({ title: '', message: '', level: 'error' })
  // ---

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getProjects()
      setProjects(res.data)
    } catch (err) {
      if (err.response?.status !== 401) { // 401 is handled by the API interceptor
        setError(err.message || 'Failed to fetch projects')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // --- 3. New modal helper functions ---
  const openInfoModal = (title, message, level = 'error') => {
    setInfoModalConfig({ title, message, level });
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
  };
  // ---

  // --- 4. Update handleApiCall to use the modal ---
  const handleApiCall = async (apiFunc, ...args) => {
    try {
      await apiFunc(...args)
      await fetchProjects() // Refresh data on success
    } catch (err) {
      // REPLACED 'alert' with 'openInfoModal'
      const errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status !== 401) { // 401 is handled globally
        // Use a more specific title for this known error
        if (errorMessage.includes("Another project")) {
          openInfoModal("Action Denied", errorMessage, 'error');
        } else {
          openInfoModal("An error occurred", errorMessage, 'error');
        }
      }
    }
  }
  // ---

  const handleStart = (id) => handleApiCall(startProject, id)
  const handlePause = (id) => handleApiCall(pauseProject, id)
  const handleStop = (id) => handleApiCall(stopProject, id)

  // Delete Flow
  const openDeleteModal = (id) => {
    setProjectToDelete(id)
    setIsDeleteModalOpen(true)
  }
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setProjectToDelete(null)
  }
  const confirmDelete = async () => {
    if (!projectToDelete) return
    
    setDeleteLoading(true)
    try {
      await deleteProject(projectToDelete)
      await fetchProjects()
      closeDeleteModal()
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status !== 401) {
        openInfoModal("Delete Error", errorMessage, 'error');
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <AddProjectModal onCreated={fetchProjects} />
        </div>

        {loading && <div className="text-center mt-8">Loading projects...</div>}
        
        {error && (
          <div className="text-center mt-12 bg-red-100 p-8 rounded-lg shadow">
            <h3 className="text-xl font-medium text-red-700">Failed to load</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}
        
        {!loading && !error && projects.length === 0 && (
          <div className="text-center mt-12 bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-medium">No projects found</h3>
            <p className="text-slate-500 mt-2">Click "+ Add Project" to get started.</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <ProjectCard 
              key={p._id} 
              project={p} 
              onStart={handleStart} 
              onPause={handlePause}
              onStop={handleStop}
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      </div>
      
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />

      {/* --- 5. Render the new modal --- */}
      <InfoModal
        open={isInfoModalOpen}
        onClose={closeInfoModal}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        level={infoModalConfig.level}
      />
      {/* --- */}
    </>
  )
}
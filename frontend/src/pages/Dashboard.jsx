import React, { useEffect, useState, useCallback } from 'react'
import {
  getProjects,
  getTemplates,
  startProject,
  pauseProject,
  stopProject,
  deleteProject,
  deleteBulkProjects
} from '../lib/api'

import {
  ClockIcon,
  CheckCircleIcon,
  BookmarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import ProjectList from '../components/ProjectList'
import CompletedProjectList from '../components/CompletedProjectList'
import TemplatesList from '../components/TemplatesList'
import AddProjectModal from '../components/AddProjectModal'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import InfoModal from '../components/InfoModal'
import { useToast } from '../components/Toast'

const TABS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TEMPLATES: 'templates',
}

export default function Dashboard() {
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState(TABS.ACTIVE)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState({ active: [], pendingStopped: [], completed: [] })
  const [templates, setTemplates] = useState([])
  const [error, setError] = useState(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfig, setDeleteConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
    itemCount: 0,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Info modal (fallback)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [infoModalConfig, setInfoModalConfig] = useState({
    title: '',
    message: '',
    level: 'error',
  })

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [projectRes, templateRes] = await Promise.all([
        getProjects(),
        getTemplates(),
      ])

      setProjects(projectRes.data)
      setTemplates(templateRes.data)
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to fetch dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // ---------- Generic API handler with TOASTS ----------
  const handleApiCall = async (apiFn, successMsg, ...args) => {
    try {
      await apiFn(...args)
      showToast(successMsg, 'success')
      await fetchAllData()
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      showToast(msg, 'error')
      await fetchAllData() // re-sync UI
    }
  }

  // ---------- Project Actions ----------
  const onStart = (id) =>
    handleApiCall(startProject, 'Project started successfully', id)

  const onPause = (id) =>
    handleApiCall(pauseProject, 'Project paused', id)

  const onStop = (id) =>
    handleApiCall(stopProject, 'Project stopped', id)

  // ---------- Single Delete ----------
  const onDelete = (project) => {
    setDeleteConfig({
      title: 'Delete Project?',
      message: `Are you sure you want to delete "${project.name}"? This will permanently remove all posts and data.`,
      onConfirm: () => confirmSingleDelete(project._id),
      itemCount: 1,
    })
    setIsDeleteModalOpen(true)
  }

  const confirmSingleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteProject(id)
      showToast('Project deleted successfully', 'success')
      setIsDeleteModalOpen(false)
      await fetchAllData()
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      showToast(msg, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ---------- Bulk Delete ----------
  const onBulkDelete = (projectIds) => {
    setDeleteConfig({
      title: `Delete ${projectIds.length} Projects?`,
      message: `This will permanently delete ${projectIds.length} projects. This action cannot be undone.`,
      onConfirm: () => confirmBulkDelete(projectIds),
      itemCount: projectIds.length,
    })
    setIsDeleteModalOpen(true)
  }

  const confirmBulkDelete = async (projectIds) => {
    setDeleteLoading(true)
    try {
      const res = await deleteBulkProjects(projectIds)

      if (res.data.errors?.length > 0) {
        showToast('Some projects failed to delete', 'error')
      } else {
        showToast('Projects deleted successfully', 'success')
      }

      setIsDeleteModalOpen(false)
      await fetchAllData()
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      showToast(msg, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ---------- Tabs ----------
  const TabButton = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 ${activeTab === tab
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
      {React.cloneElement(icon, { className: 'h-5 w-5' })}
      {label}
      <span
        className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab
            ? 'bg-indigo-100 text-indigo-600'
            : 'bg-slate-200 text-slate-700'
          }`}
      >
        {count}
      </span>
    </button>
  )

  return (
    <>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <AddProjectModal onCreated={fetchAllData} />
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex flex-wrap gap-4">
            <TabButton
              tab={TABS.ACTIVE}
              icon={<ClockIcon />}
              label="Active Projects"
              count={projects.active.length + projects.pendingStopped.length}
            />
            <TabButton
              tab={TABS.COMPLETED}
              icon={<CheckCircleIcon />}
              label="Completed"
              count={projects.completed.length}
            />
            <TabButton
              tab={TABS.TEMPLATES}
              icon={<BookmarkIcon />}
              label="Templates"
              count={templates.length}
            />
          </nav>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center mt-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-slate-500 font-medium">Loading dashboard…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center mt-12 bg-red-50 p-8 rounded-lg">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-medium text-red-800 mt-2">
              Failed to load dashboard
            </h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="mt-6">
            {activeTab === TABS.ACTIVE && (
              <div className="space-y-10">
                <ProjectList
                  title="Running / Paused"
                  projects={projects.active}
                  onStart={onStart}
                  onPause={onPause}
                  onStop={onStop}
                  onDelete={onDelete}
                />
                <ProjectList
                  title="Ready to Start"
                  projects={projects.pendingStopped}
                  onStart={onStart}
                  onPause={onPause}
                  onStop={onStop}
                  onDelete={onDelete}
                />
              </div>
            )}

            {activeTab === TABS.COMPLETED && (
              <CompletedProjectList
                projects={projects.completed}
                onDelete={onDelete}
                onBulkDelete={onBulkDelete}
              />
            )}

            {activeTab === TABS.TEMPLATES && (
              <TemplatesList
                templates={templates}
                onTemplateUsed={fetchAllData}
                onTemplateDeleted={fetchAllData}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteConfig.onConfirm}
        loading={deleteLoading}
        title={deleteConfig.title}
        message={deleteConfig.message}
        itemCount={deleteConfig.itemCount}
      />

      {/* Info Modal (fallback) */}
      <InfoModal
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        level={infoModalConfig.level}
      />
    </>
    
  )
}

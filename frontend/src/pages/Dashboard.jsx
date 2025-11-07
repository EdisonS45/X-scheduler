import React, { useEffect, useState, useCallback } from 'react'
import { getProjects, getTemplates, startProject, pauseProject, stopProject, deleteProject, deleteBulkProjects } from '../lib/api'
import { ClockIcon, CheckCircleIcon, BookmarkIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline'

import ProjectList from '../components/ProjectList'
import CompletedProjectList from '../components/CompletedProjectList'
import TemplatesList from '../components/TemplatesList'
import AddProjectModal from '../components/AddProjectModal'

import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import InfoModal from '../components/InfoModal'

const TABS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TEMPLATES: 'templates',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(TABS.ACTIVE);
  const [loading, setLoading] = useState(true);
  
  const [projects, setProjects] = useState({ active: [], pendingStopped: [], completed: [] });
  const [templates, setTemplates] = useState([]);
  
  const [error, setError] = useState(null);

  // --- Updated Modal States ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ 
    title: '', 
    message: '', 
    onConfirm: () => {},
    itemCount: 0 
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  // ---

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalConfig, setInfoModalConfig] = useState({ title: '', message: '', level: 'error' });

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectRes, templateRes] = await Promise.all([
        getProjects(),
        getTemplates()
      ]);
      setProjects(projectRes.data);
      setTemplates(templateRes.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData() }, [fetchAllData]);

  const openInfoModal = (title, message, level = 'error') => {
    setInfoModalConfig({ title, message, level });
    setIsInfoModalOpen(true);
  };
  const closeInfoModal = () => setIsInfoModalOpen(false);

  // --- UPDATED: handleApiCall now re-fetches on error ---
  const handleApiCall = async (apiFunc, ...args) => {
    try {
      await apiFunc(...args);
      await fetchAllData(); // Refresh ALL data on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status !== 401) { 
        if (errorMessage.includes("Another project")) {
          openInfoModal("Action Denied", errorMessage, 'error');
        } else {
          openInfoModal("An error occurred", errorMessage, 'error');
        }
        // --- THIS IS THE FIX for Bug 1 ---
        // If an action failed, re-sync state.
        await fetchAllData(); 
        // ---
      }
    }
  };

  const onStart = (id) => handleApiCall(startProject, id);
  const onPause = (id) => handleApiCall(pauseProject, id);
  const onStop = (id) => handleApiCall(stopProject, id);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // --- UPDATED: Single Delete ---
  const onDelete = (project) => {
    setDeleteConfig({
      title: 'Delete Project?',
      message: `Are you sure you want to delete "${project.name}"? All posts and data will be permanently removed. This cannot be undone.`,
      onConfirm: () => confirmSingleDelete(project._id),
      itemCount: 1
    });
    setIsDeleteModalOpen(true);
  };

  const confirmSingleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await deleteProject(id);
      await fetchAllData();
      closeDeleteModal();
    } catch (err) {
      if (err.response?.status !== 401) {
        openInfoModal("Delete Error", err.response?.data?.message || err.message, 'error');
      }
    } finally {
      // --- THIS IS THE FIX for Bug 2 ---
      setDeleteLoading(false); 
    }
  };
  
  // --- UPDATED: Bulk Delete (uses modal now) ---
  const onBulkDelete = (projectIds) => {
    setDeleteConfig({
      title: `Delete ${projectIds.length} Projects?`,
      message: `Are you sure you want to permanently delete these ${projectIds.length} projects? This action cannot be undone.`,
      onConfirm: () => confirmBulkDelete(projectIds),
      itemCount: projectIds.length
    });
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = async (projectIds) => {
    setDeleteLoading(true);
    try {
      await deleteBulkProjects(projectIds);
      await fetchAllData();
      closeDeleteModal();
    } catch (err) {
      if (err.response?.status !== 401) {
        openInfoModal("Bulk Delete Error", err.response?.data?.message || err.message, 'error');
      }
    } finally {
      // --- THIS IS THE FIX for Bug 2 ---
      setDeleteLoading(false);
    }
  };
  
  // --- New Tab Button Component ---
  const TabButton = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-t-lg border-b-2 ${
        activeTab === tab
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
      }`}
    >
      {React.cloneElement(icon, { className: "h-5 w-5" })}
      {label}
      <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
        activeTab === tab 
          ? 'bg-indigo-100 text-indigo-600' 
          : 'bg-slate-200 text-slate-700'
      }`}>
        {count}
      </span>
    </button>
  );

  return (
    <>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex gap-4">
            <AddProjectModal onCreated={fetchAllData} />
          </div>
        </div>

        {/* --- New Tab Navigation Design --- */}
        <div className="border-b border-slate-200">
          <nav className="flex flex-wrap items-center gap-2 sm:gap-6">
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

        {/* --- Loading & Error States --- */}
        {loading && (
          <div className="text-center mt-12 text-slate-500">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 font-medium">Loading Dashboard...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center mt-12 bg-red-50 p-8 rounded-lg shadow-inner">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-medium text-red-800">Failed to load data</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* --- Tab Content --- */}
        <div className="mt-6">
          {!loading && !error && activeTab === TABS.ACTIVE && (
            <div className="space-y-10">
              <ProjectList
                title="Running / Paused"
                projects={projects.active}
                onStart={onStart} onPause={onPause} onStop={onStop} onDelete={onDelete}
              />
              <ProjectList
                title="Ready to Start"
                projects={projects.pendingStopped}
                onStart={onStart} onPause={onPause} onStop={onStop} onDelete={onDelete}
              />
            </div>
          )}
          
          {!loading && !error && activeTab === TABS.COMPLETED && (
            <CompletedProjectList
              projects={projects.completed}
              onDelete={onDelete}
              onBulkDelete={onBulkDelete}
            />
          )}

          {!loading && !error && activeTab === TABS.TEMPLATES && (
            <TemplatesList
              templates={templates}
              onTemplateUsed={fetchAllData}
              onTemplateDeleted={fetchAllData}
            />
          )}
        </div>
      </div>

      {/* --- Reusable Delete Modal --- */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteConfig.onConfirm}
        loading={deleteLoading}
        title={deleteConfig.title}
        message={deleteConfig.message}
        itemCount={deleteConfig.itemCount}
      />
      <InfoModal
        open={isInfoModalOpen}
        onClose={closeInfoModal}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        level={infoModalConfig.level}
      />
    </>
  )
}
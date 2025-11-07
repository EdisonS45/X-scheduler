import React, { useState } from 'react';
import { createTemplate, deleteTemplate, createProjectFromTemplate } from '../lib/api';
import { BookmarkIcon, EyeIcon, EyeSlashIcon, PlusIcon, TrashIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/solid';
import DeleteConfirmationModal from './DeleteConfirmationModal'; 

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">&times;</button>
        {children}
      </div>
    </div>
  );
};

const CreateTemplateModal = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessSecret, setAccessSecret] = useState("");
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !apiKey || !apiSecret || !accessToken || !accessSecret) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      await createTemplate({ name, twitterApiKey: apiKey, twitterApiSecret: apiSecret, twitterAccessToken: accessToken, twitterAccessSecret: accessSecret });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Create New Template</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="p-2 border rounded-md w-full" placeholder="Template Name (e.g., 'My Main Account')" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" onClick={() => setShowApiKeys(!showApiKeys)} className="flex items-center gap-2 text-sm font-medium text-indigo-600">
          {showApiKeys ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          {showApiKeys ? 'Hide' : 'Show'} Credentials
        </button>
        {showApiKeys && (
          <div className="space-y-4 p-4 border rounded-md bg-slate-50">
            <input className="p-2 border rounded-md w-full" placeholder="API Key" type={showApiKeys ? "text" : "password"} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <input className="p-2 border rounded-md w-full" placeholder="API Secret" type={showApiKeys ? "text" : "password"} value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
            <input className="p-2 border rounded-md w-full" placeholder="Access Token" type={showApiKeys ? "text" : "password"} value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
            <input className="p-2 border rounded-md w-full" placeholder="Access Secret" type={showApiKeys ? "text" : "password"} value={accessSecret} onChange={(e) => setAccessSecret(e.target.value)} />
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300">
            {loading ? "Saving..." : "Save Template"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const UseTemplateModal = ({ open, onClose, onUsed, template }) => {
  const [name, setName] = useState("");
  const [timeGap, setTimeGap] = useState(60);
  const [customTimeGap, setCustomTimeGap] = useState(120);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const finalTimeGap = timeGap === 'custom' ? Number(customTimeGap) : Number(timeGap);
    if (!name || !finalTimeGap || finalTimeGap <= 0 || !csvFile) {
      setError("Please fill all fields, select a time gap, and upload a CSV.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("timeGapMinutes", finalTimeGap);
      fd.append("file", csvFile);
      await createProjectFromTemplate(template._id, fd);
      onUsed();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-1">Use Template</h2>
      <p className="text-sm text-slate-500 mb-4">Create a new project using <span className="font-semibold">{template?.name}</span></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="p-2 border rounded-md w-full" placeholder="New Project Name (e.g., 'Dec Week 1 Posts')" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <select className="p-2 border rounded-md w-1/2" value={timeGap} onChange={(e) => setTimeGap(e.target.value)}>
            <option value="30">Every 30 minutes</option>
            <option value="60">Every 1 hour</option>
            <option value="120">Every 2 hours</option>
            <option value="custom">Custom (minutes)</option>
          </select>
          {timeGap === 'custom' && <input type="number" className="p-2 border rounded-md w-1/2" placeholder="e.g., 45" value={customTimeGap} onChange={(e) => setCustomTimeGap(e.target.value)} />}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Posts CSV</label>
          <input type="file" accept="text/csv" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setCsvFile(e.target.files[0])} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300">
            {loading ? "Creating..." : "Create & Upload"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const TemplateCard = ({ template, onUse, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between">
    <div>
      <BookmarkIcon className="h-6 w-6 text-indigo-500 mb-2" />
      <h3 className="text-lg font-semibold text-slate-900 truncate">{template.name}</h3>
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={onUse} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
        <ArrowUpOnSquareIcon className="h-5 w-5" />
        Use
      </button>
      <button onClick={onDelete} className="px-3 py-2 rounded-md bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300 hover:text-red-600">
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default function TemplatesList({ templates, onTemplateUsed, onTemplateDeleted }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [isTemplateDeleteModalOpen, setIsTemplateDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUseClick = (template) => {
    setSelectedTemplate(template);
    setIsUseModalOpen(true);
  };
  
  // FIX: Open Delete Dialog
  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setIsTemplateDeleteModalOpen(true);
  };

  // FIX: Confirm Delete Logic
  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteTemplate(templateToDelete._id);
      onTemplateDeleted();
      setIsTemplateDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete template"); // Fallback alert
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow bg-white text-slate-700 border hover:bg-slate-50 mb-6">
        <PlusIcon className="h-5 w-5" />
        Add New Template
      </button>

      {templates.length === 0 && (
        <div className="text-center mt-12 bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-medium">No templates found</h3>
          <p className="text-slate-500 mt-2">Create a template to reuse your Twitter credentials.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <TemplateCard
            key={t._id}
            template={t}
            onUse={() => handleUseClick(t)}
            onDelete={() => handleDeleteClick(t)}
          />
        ))}
      </div>

      <CreateTemplateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={onTemplateDeleted}
      />
      
      {selectedTemplate && (
        <UseTemplateModal
          open={isUseModalOpen}
          onClose={() => setIsUseModalOpen(false)}
          onUsed={onTemplateUsed}
          template={selectedTemplate}
        />
      )}
      
      {/* --- Template Delete Modal --- */}
      {templateToDelete && (
        <DeleteConfirmationModal
          open={isTemplateDeleteModalOpen}
          onClose={() => setIsTemplateDeleteModalOpen(false)}
          onConfirm={confirmDeleteTemplate}
          loading={deleteLoading}
          title="Delete Template?"
          message={`Are you sure you want to delete the template "${templateToDelete.name}"? This will not affect existing projects, but you won't be able to use this template for new ones.`}
          itemCount={1}
        />
      )}
    </>
  );
}
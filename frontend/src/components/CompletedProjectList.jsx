import React, { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { format, isToday, isYesterday } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/solid';

const groupProjectsByDate = (projects) => {
  return projects.reduce((acc, project) => {
    const date = new Date(project.createdAt);
    let groupTitle = format(date, 'MMMM d, yyyy');
    if (isToday(date)) groupTitle = 'Today';
    if (isYesterday(date)) groupTitle = 'Yesterday';
    if (!acc[groupTitle]) acc[groupTitle] = [];
    acc[groupTitle].push(project);
    return acc;
  }, {});
};

export default function CompletedProjectList({ projects, onDelete, onBulkDelete }) {
  const [selected, setSelected] = useState(new Set());

  const allProjectIds = useMemo(() => projects.map(p => p._id), [projects]);
  const isAllSelected = selected.size > 0 && selected.size === allProjectIds.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allProjectIds));
    }
  };

  const toggleSelect = (projectId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelected(newSelected);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center mt-12 bg-white p-8 rounded-lg shadow-inner border border-slate-200">
        <h3 className="text-xl font-medium text-slate-800">No completed projects</h3>
        <p className="text-slate-500 mt-2">Projects you stop that have no pending posts will appear here.</p>
      </div>
    );
  }

  const groupedProjects = groupProjectsByDate(projects);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow border border-slate-200">
        <input
          type="checkbox"
          className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <label className="text-sm font-medium text-slate-700">
          {selected.size} selected
        </label>
        <button
          onClick={() => onBulkDelete(Array.from(selected))}
          disabled={selected.size === 0}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <TrashIcon className="h-4 w-4" />
          Delete Selected
        </button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedProjects).map(([dateGroup, groupProjects]) => (
          <div key={dateGroup}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {dateGroup}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupProjects.map(p => (
                <div key={p._id} className="relative">
                  <input
                    type="checkbox"
                    // FIX: Checkbox moved to top-right corner, visually separated from content
                    className="absolute top-5 right-5 z-10 h-5 w-5 rounded-full border-2 border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:ring-indigo-500 transition-all duration-150 cursor-pointer"
                    checked={selected.has(p._id)}
                    onChange={() => toggleSelect(p._id)}
                  />
                  <div className={`${selected.has(p._id) ? 'ring-2 ring-indigo-600' : ''} rounded-lg`}>
                    <ProjectCard 
                      project={p} 
                      onDelete={onDelete} 
                      onStart={() => {}} 
                      onPause={() => {}} 
                      onStop={() => {}} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import ProjectCard from './ProjectCard';

// Helper to group by date
const groupProjectsByDate = (projects) => {
  const groups = projects.reduce((acc, project) => {
    const date = new Date(project.createdAt);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupTitle;
    if (date.toDateString() === today.toDateString()) {
      groupTitle = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupTitle = 'Yesterday';
    } else {
      groupTitle = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (!acc[groupTitle]) {
      acc[groupTitle] = [];
    }
    acc[groupTitle].push(project);
    return acc;
  }, {});
  
  // Sort groups by date (Today, Yesterday, then chronological)
  return Object.entries(groups).sort(([keyA], [keyB]) => {
    if (keyA === 'Today') return -1;
    if (keyB === 'Today') return 1;
    if (keyA === 'Yesterday') return -1;
    if (keyB === 'Yesterday') return 1;
    return new Date(keyB) - new Date(keyA); // Sort by date descending
  });
};

export default function ProjectList({ title, projects, ...handlers }) {
  if (projects.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
        <p className="text-slate-500">No projects in this category.</p>
      </div>
    );
  }

  const groupedProjects = groupProjectsByDate(projects);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">{title}</h2>
      <div className="space-y-6">
        {groupedProjects.map(([dateGroup, groupProjects]) => (
          <div key={dateGroup}>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {dateGroup}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupProjects.map(p => (
                <ProjectCard key={p._id} project={p} {...handlers} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
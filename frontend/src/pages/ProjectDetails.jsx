import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById } from '../lib/api';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';

const PostRow = ({ post }) => {
  let statusIcon;
  if (post.status === 'posted') {
    statusIcon = <CheckCircleIcon className="h-5 w-5 text-green-500" title="Posted" />;
  } else if (post.status === 'failed') {
    statusIcon = <XCircleIcon className="h-5 w-5 text-red-500" title="Failed" />;
  } else {
    statusIcon = <ClockIcon className="h-5 w-5 text-blue-500" title="Pending" />;
  }

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      <td className="p-3 text-slate-700">{post.content}</td>
      <td className="p-3 text-slate-500 text-sm">
        {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'Not scheduled'}
      </td>
      <td className="p-3 text-slate-500 text-sm">
        {post.postedAt ? new Date(post.postedAt).toLocaleString() : 'N/A'}
      </td>
      <td className="p-3">
        <span className="flex items-center gap-2 text-sm capitalize">
          {statusIcon}
          {post.status}
        </span>
      </td>
    </tr>
  );
};

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjectById(id);
      setProject(res.data.project);
      setPosts(res.data.posts);
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) return <div className="p-8">Loading project details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!project) return <div className="p-8">Project not found.</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <Link to="/" className="flex items-center gap-2 text-sm text-sky-600 hover:underline mb-4">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
      <p className="text-slate-600">
        Status: <span className="font-medium capitalize">{project.status}</span>
      </p>

      <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-5 border-b border-slate-200">
          Scheduled Posts ({posts.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3 text-sm font-semibold text-slate-600">Content</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Scheduled At</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Posted At</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <PostRow key={post._id} post={post} />
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <p className="p-5 text-center text-slate-500">
              No posts found for this project.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
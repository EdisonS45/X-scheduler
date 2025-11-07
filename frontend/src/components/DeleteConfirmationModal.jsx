import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
            <ExclamationTriangleIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-0 flex-1">
            <h3
              className="text-lg leading-6 font-semibold text-slate-900"
              id="modal-title"
            >
              Delete Project
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                Are you sure you want to delete this project? All of its posts
                and schedule data will be permanently removed. This action
                cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
            onClick={onConfirm}
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
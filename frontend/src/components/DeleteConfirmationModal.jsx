import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading,
  title = "Delete Project?", // Default title
  message = "Are you sure? This action cannot be undone.", // Default message
  itemCount = 1 // Used for button text
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300 ease-in-out"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
            <ExclamationTriangleIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-0 flex-1">
            <h3 className="text-lg leading-6 font-semibold text-slate-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {/* --- FIX: Cancel button is NEVER disabled --- */}
          <button
            type="button"
            className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
            onClick={onConfirm}
          >
            {loading ? 'Deleting...' : `Delete ${itemCount} ${itemCount > 1 ? 'Items' : 'Item'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
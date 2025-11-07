import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function InfoModal({
  open,
  onClose,
  title = "Error",
  message,
  level = "error" // 'error' or 'info'
}) {
  if (!open) return null;

  const isError = level === 'error';

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <div className="flex items-start gap-4">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${isError ? 'bg-red-100' : 'bg-blue-100'} sm:mx-0`}>
            {isError ? (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            ) : (
              <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            )}
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
          <button
            type="button"
            className="px-4 py-2 bg-sky-600 text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-sky-700"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
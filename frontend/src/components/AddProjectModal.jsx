import React, { useState } from "react";
import { createProject, uploadCSV } from "../lib/api";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

export default function AddProjectModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [timeGap, setTimeGap] = useState(60);
  const [customTimeGap, setCustomTimeGap] = useState(120); // For custom input
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessSecret, setAccessSecret] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // --- New state for hiding keys ---
  const [showApiKeys, setShowApiKeys] = useState(false);

  const resetForm = () => {
    setName("");
    setTimeGap(60);
    setCustomTimeGap(120);
    setApiKey("");
    setApiSecret("");
    setAccessToken("");
    setAccessSecret("");
    setCsvFile(null);
    setError("");
    setSuccess("");
    setLoading(false);
    setShowApiKeys(false);
  }

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    // Use custom time gap if selected
    const finalTimeGap = timeGap === 'custom' ? Number(customTimeGap) : Number(timeGap);

    if (!finalTimeGap || finalTimeGap <= 0) {
      setError("Time gap must be a positive number.");
      return;
    }
    
    if (
      !name ||
      !apiKey ||
      !apiSecret ||
      !accessToken ||
      !accessSecret ||
      !csvFile
    ) {
      setError("Please fill all fields and upload a CSV file.");
      return;
    }

    try {
      setLoading(true);
      const res = await createProject({
        name,
        timeGapMinutes: finalTimeGap, // Use the correct time gap
        twitterApiKey: apiKey,
        twitterApiSecret: apiSecret,
        twitterAccessToken: accessToken,
        twitterAccessSecret: accessSecret,
      });

      const project = res.data;

      const fd = new FormData();
      fd.append("file", csvFile);
      const uploadRes = await uploadCSV(project._id, fd);

      const count = uploadRes.data.inserted || 0;
      
      setSuccess(`✅ Project created with ${count} posts. You can now start it from the dashboard.`);
      onCreated();
      
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 2000); // auto close after success
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setOpen(false);
    resetForm();
  }

  return (
    <div>
      <button
        className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-sky-700"
        onClick={() => setOpen(true)}
      >
        + Add Project
      </button>

      {open && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-lg relative my-8">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="p-2 border rounded-md"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              {/* --- Updated Time Gap Input --- */}
              <div className="flex gap-2">
                <select
                  className="p-2 border rounded-md w-1/2"
                  value={timeGap}
                  onChange={(e) => setTimeGap(e.target.value)}
                >
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every 1 hour</option>
                  <option value="120">Every 2 hours</option>
                  <option value="240">Every 4 hours</option>
                  <option value="custom">Custom (minutes)</option>
                </select>
                
                {timeGap === 'custom' && (
                  <input
                    type="number"
                    className="p-2 border rounded-md w-1/2"
                    placeholder="e.g., 45"
                    value={customTimeGap}
                    onChange={(e) => setCustomTimeGap(e.target.value)}
                  />
                )}
              </div>
              
              {/* --- API Key Section with Toggle --- */}
              <div className="md:col-span-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="flex items-center gap-2 text-sm font-medium text-sky-600"
                >
                  {showApiKeys ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  {showApiKeys ? 'Hide' : 'Show'} Twitter API Credentials
                </button>
              </div>

              {showApiKeys && (
                <>
                  <input
                    className="p-2 border rounded-md"
                    placeholder="API Key"
                    type={showApiKeys ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <input
                    className="p-2 border rounded-md"
                    placeholder="API Secret"
                    type={showApiKeys ? "text" : "password"}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                  <input
                    className="p-2 border rounded-md"
                    placeholder="Access Token"
                    type={showApiKeys ? "text" : "password"}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <input
                    className="p-2 border rounded-md"
                    placeholder="Access Secret"
                    type={showApiKeys ? "text" : "password"}
                    value={accessSecret}
                    onChange={(e) => setAccessSecret(e.target.value)}
                  />
                </>
              )}
              {/* --- End API Key Section --- */}

              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Posts CSV (Single column for content)
                </label>
                <input
                  type="file"
                  accept="text/csv"
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-sky-50 file:text-sky-700
                    hover:file:bg-sky-100"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
              </div>
            </div>

            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
            {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-sky-700 disabled:bg-sky-300"
                onClick={handleCreate}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
            
            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}